import webpush from "web-push";
import { PushSubscriptionModel } from "../models/PushSubscription.model";

let vapidPublicKey: string | null = null;
let vapidReady = false;

function initVapid() {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.warn("⚠️  VAPID keys not set. Generating temporary in-memory keys.");
      const keys = webpush.generateVAPIDKeys();
      webpush.setVapidDetails("mailto:info@tuwaiqassociation.sa", keys.publicKey, keys.privateKey);
      vapidPublicKey = keys.publicKey;
      vapidReady = true;
      return;
    }

    webpush.setVapidDetails("mailto:info@tuwaiqassociation.sa", publicKey, privateKey);
    vapidPublicKey = publicKey;
    vapidReady = true;
  } catch (err) {
    console.error("⚠️  VAPID initialization failed (push notifications disabled):", (err as Error).message);
    vapidReady = false;
  }
}

initVapid();

export const VAPID_PUBLIC_KEY = vapidPublicKey;

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, any>;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!vapidReady) return [];
  const subs = await PushSubscriptionModel.find({ userId });
  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/images/icon-192.png",
    badge: "/images/icon-72.png",
    tag: payload.tag || `notif-${Date.now()}`,
    renotify: true,
    data: { url: payload.data?.url || "/" },
  });

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          notification
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscriptionModel.deleteOne({ _id: sub._id });
        }
        throw err;
      }
    })
  );
  return results;
}

export async function sendPushToAdmins(payload: PushPayload) {
  if (!vapidReady) return;
  const mongoose = await import("mongoose");
  const { UserModel } = await import("../models/User.model");
  const admins = await UserModel.find({ role: { $in: ["admin", "superadmin"] } });
  const adminIds = admins.map((a: any) => a._id.toString());
  const subs = await PushSubscriptionModel.find({ userId: { $in: adminIds } });

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/images/icon-192.png",
    badge: "/images/icon-72.png",
    tag: payload.tag,
    data: { url: payload.data?.url || "/admin" },
  });

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, notification).catch(async (err: any) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscriptionModel.deleteOne({ _id: sub._id });
        }
      })
    )
  );
}
