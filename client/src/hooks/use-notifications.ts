import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./use-auth";
import { useLocation } from "wouter";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(Array.from(rawData).map(c => c.charCodeAt(0)));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [liveNotif, setLiveNotif] = useState<any | null>(null);
  const [, navigate] = useLocation();

  // ── Fetch notifications from DB ───────────────────────────────────────────
  const { data } = useQuery<{ data: any[]; unread: number; total: number }>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return { data: [], unread: 0, total: 0 };
      return res.json();
    },
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PATCH", `/api/notifications/${id}/read`).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () =>
      apiRequest("PATCH", "/api/notifications/read-all").then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/notifications/${id}`).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  // ── WebSocket — real-time in-app notifications ────────────────────────────
  useEffect(() => {
    if (!user) return;
    const userId = (user as any)._id || (user as any).id;
    if (!userId) return;

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws?userId=${userId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "notification") {
          setLiveNotif(msg);
          queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        }
      } catch {}
    };

    ws.onerror = () => {};
    ws.onclose = () => {};

    return () => { ws.close(); };
  }, [user]);

  // ── Service Worker message handler (notificationclick → navigate) ─────────
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "navigate" && event.data?.url) {
        navigate(event.data.url);
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [navigate]);

  // ── Register service worker on first load ─────────────────────────────────
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch(() => {});
  }, []);

  // ── Register push subscription ────────────────────────────────────────────
  const subscribePush = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return; // Don't ask twice here
    try {
      const vapidRes = await fetch("/api/notifications/vapid-key");
      if (!vapidRes.ok) return;
      const { key } = await vapidRes.json();

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key) as unknown as string,
        });
      }
      const p256dh = Array.from(new Uint8Array((sub as any).getKey("p256dh")));
      const auth = Array.from(new Uint8Array((sub as any).getKey("auth")));
      await apiRequest("POST", "/api/notifications/subscribe", {
        endpoint: sub.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...p256dh)),
          auth: btoa(String.fromCharCode(...auth)),
        },
      });
    } catch {}
  }, []);

  // Auto-subscribe if permission already granted (e.g., user re-opens the app)
  useEffect(() => {
    if (!user) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      subscribePush();
    }
  }, [user, subscribePush]);

  return {
    notifications: data?.data || [],
    unread: data?.unread || 0,
    liveNotif,
    clearLiveNotif: () => setLiveNotif(null),
    markRead: (id: string) => markRead.mutate(id),
    markAllRead: () => markAllRead.mutate(),
    remove: (id: string) => remove.mutate(id),
    subscribePush,
  };
}
