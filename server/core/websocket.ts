import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage, Server } from "http";
import { parse } from "url";

const clients = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer | null = null;

export function setupWebSocket(httpServer: Server) {
  wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const qs = parse(req.url || "", true);
    const userId = qs.query?.userId as string | undefined;

    if (!userId) {
      ws.close();
      return;
    }

    if (!clients.has(userId)) clients.set(userId, new Set());
    clients.get(userId)!.add(ws);

    ws.on("close", () => {
      clients.get(userId)?.delete(ws);
      if (clients.get(userId)?.size === 0) clients.delete(userId);
    });

    ws.on("error", () => {
      clients.get(userId)?.delete(ws);
    });
  });

  return wss;
}

export function pushToUser(userId: string, payload: object) {
  const conns = clients.get(userId);
  if (!conns || conns.size === 0) return;
  const msg = JSON.stringify(payload);
  conns.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

export function pushToAll(payload: object) {
  const msg = JSON.stringify(payload);
  clients.forEach((conns) => {
    conns.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    });
  });
}
