import { NotificationModel } from "../models/Notification.model";
import { pushToUser } from "./websocket";
import { sendPushToUser, sendPushToAdmins, PushPayload } from "./pushNotifications";

export interface NotifyOptions {
  type?: "info" | "success" | "warning" | "error" | "prayer";
  link?: string;
  icon?: string;
  push?: boolean;
}

/**
 * Send a notification to a single user.
 * 3-layer: DB + WebSocket (real-time) + Web Push (offline)
 */
export async function fireNotify(
  userId: string,
  title: string,
  body: string,
  opts: NotifyOptions = {}
) {
  const { type = "info", link, icon = "🔔", push = true } = opts;

  // Layer 1: DB
  await NotificationModel.create({
    userId,
    type,
    title,
    body,
    message: body,
    link,
    icon,
    read: false,
  });

  // Layer 2: WebSocket (live)
  pushToUser(userId, { type: "notification", title, body, link, icon, notifType: type });

  // Layer 3: Web Push (offline)
  if (push) {
    await sendPushToUser(userId, {
      title,
      body,
      icon: "/images/icon-192.png",
      tag: `notif-${Date.now()}`,
      data: { url: link || "/" },
    }).catch(() => {});
  }
}

/**
 * Send a notification to all admin/superadmin users.
 */
export async function fireNotifyAdmins(
  title: string,
  body: string,
  opts: NotifyOptions = {}
) {
  const { type = "info", link, icon = "🔔", push = true } = opts;

  const { UserModel } = await import("../models/User.model");
  const admins = await UserModel.find({ role: { $in: ["admin", "superadmin"] } });

  await Promise.all(
    admins.map((admin: any) =>
      NotificationModel.create({
        userId: admin._id,
        type,
        title,
        body,
        message: body,
        link,
        icon,
        read: false,
      }).then(() => {
        pushToUser(admin._id.toString(), {
          type: "notification",
          title,
          body,
          link,
          icon,
          notifType: type,
        });
      })
    )
  );

  if (push) {
    await sendPushToAdmins({ title, body, tag: `admin-notif-${Date.now()}`, data: { url: link || "/admin" } }).catch(() => {});
  }
}
