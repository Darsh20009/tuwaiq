import webpush from "web-push";
import { PushSubscriptionModel } from "../models/PushSubscription.model";

let vapidPublicKey: string | null = null;
let vapidReady = false;

// ── Persist VAPID keys in MongoDB settings so they survive server restarts ──
async function loadOrGenerateVapidKeys(): Promise<{ publicKey: string; privateKey: string } | null> {
  try {
    const { db } = await import("../db");
    const settings = await db.collection("settings").findOne({});
    const stored = settings as any;

    if (stored?.vapidPublicKey && stored?.vapidPrivateKey) {
      return { publicKey: stored.vapidPublicKey, privateKey: stored.vapidPrivateKey };
    }

    // Generate new keys and persist them
    const keys = webpush.generateVAPIDKeys();
    await db.collection("settings").updateOne(
      {},
      { $set: { vapidPublicKey: keys.publicKey, vapidPrivateKey: keys.privateKey } },
      { upsert: true }
    );
    console.log("[Push] Generated and saved new VAPID keys to DB");
    return keys;
  } catch (err) {
    console.error("[Push] Failed to load/save VAPID keys from DB:", (err as Error).message);
    return null;
  }
}

async function initVapid() {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (publicKey && privateKey) {
      webpush.setVapidDetails("mailto:info@tuwaiqassociation.sa", publicKey, privateKey);
      vapidPublicKey = publicKey;
      vapidReady = true;
      console.log("[Push] VAPID initialized from env vars");
      return;
    }

    // Try DB-persisted keys
    const keys = await loadOrGenerateVapidKeys();
    if (keys) {
      webpush.setVapidDetails("mailto:info@tuwaiqassociation.sa", keys.publicKey, keys.privateKey);
      vapidPublicKey = keys.publicKey;
      vapidReady = true;
      console.log("[Push] VAPID initialized from DB (persistent)");
    } else {
      // Last resort: temporary in-memory keys
      const tempKeys = webpush.generateVAPIDKeys();
      webpush.setVapidDetails("mailto:info@tuwaiqassociation.sa", tempKeys.publicKey, tempKeys.privateKey);
      vapidPublicKey = tempKeys.publicKey;
      vapidReady = true;
      console.warn("[Push] ⚠️  VAPID using temporary in-memory keys — subscriptions will break on restart");
    }
  } catch (err) {
    console.error("[Push] VAPID initialization failed:", (err as Error).message);
    vapidReady = false;
  }
}

// Initialize after DB is ready (slight delay to allow DB connection)
setTimeout(initVapid, 3000);

export function getVapidPublicKey(): string | null {
  return vapidPublicKey;
}

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
  if (!subs.length) return [];

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
  const { UserModel } = await import("../models/User.model");
  const admins = await UserModel.find({ role: { $in: ["admin", "superadmin"] } });
  const adminIds = admins.map((a: any) => a._id.toString());
  const subs = await PushSubscriptionModel.find({ userId: { $in: adminIds } });

  if (!subs.length) return;

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/images/icon-192.png",
    badge: "/images/icon-72.png",
    tag: payload.tag,
    renotify: true,
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
