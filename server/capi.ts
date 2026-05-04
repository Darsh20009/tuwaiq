import crypto from "crypto";
import { db } from "./db";

/**
 * Conversions API (CAPI) — Server-Side Tracking
 *
 * Sends Purchase events from the server to Facebook and Snapchat
 * immediately after a payment is confirmed by Al Rajhi.
 *
 * Deduplication: eventId must match the browser-side pixel eventID
 * so each platform counts the conversion exactly once.
 *
 * PCI DSS: customer data is one-way hashed (SHA-256) before sending.
 */

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function normalizePhone(phone: string): string {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0") && p.length === 10) p = "966" + p.slice(1);
  else if (p.startsWith("5") && p.length === 9) p = "966" + p;
  return p;
}

async function getTrackingSettings(): Promise<{
  facebookPixelId?: string;
  facebookCAPIToken?: string;
  snapchatPixelId?: string;
  snapchatCAPIToken?: string;
}> {
  try {
    const s = await db.collection("settings").findOne({});
    return {
      facebookPixelId: s?.facebookPixelId || "",
      facebookCAPIToken: s?.facebookCAPIToken || "",
      snapchatPixelId: s?.snapchatPixelId || "",
      snapchatCAPIToken: s?.snapchatCAPIToken || "",
    };
  } catch {
    return {};
  }
}

export interface CAPIPurchaseEvent {
  eventId: string;
  amount: number;
  currency?: string;
  donorEmail?: string;
  donorPhone?: string;
  donationType?: string;
}

/**
 * Fire a Purchase event to all configured ad platforms (Facebook + Snapchat).
 * Call this server-side after a payment is confirmed.
 * eventId should be the donationId — the same value passed to the browser pixel.
 */
export async function sendPurchaseCAPIEvents(event: CAPIPurchaseEvent): Promise<void> {
  const settings = await getTrackingSettings();
  const tasks: Promise<void>[] = [];

  if (settings.facebookPixelId && settings.facebookCAPIToken) {
    tasks.push(
      sendFacebookCAPI(settings.facebookPixelId, settings.facebookCAPIToken, event)
        .catch((e) => console.error("[CAPI:Facebook] Failed:", e.message))
    );
  }

  if (settings.snapchatPixelId && settings.snapchatCAPIToken) {
    tasks.push(
      sendSnapchatCAPI(settings.snapchatPixelId, settings.snapchatCAPIToken, event)
        .catch((e) => console.error("[CAPI:Snapchat] Failed:", e.message))
    );
  }

  if (tasks.length === 0) return;

  await Promise.allSettled(tasks);
}

async function sendFacebookCAPI(
  pixelId: string,
  accessToken: string,
  event: CAPIPurchaseEvent
): Promise<void> {
  const userData: Record<string, string> = {};
  if (event.donorEmail) userData.em = sha256Hex(event.donorEmail);
  if (event.donorPhone) userData.ph = sha256Hex(normalizePhone(event.donorPhone));

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: "website",
        event_source_url: "https://tuwaiqassociation.sa/payment-result",
        user_data: userData,
        custom_data: {
          value: event.amount,
          currency: event.currency || "SAR",
          content_name: event.donationType || "تبرع",
          content_category: "Donation",
        },
      },
    ],
  };

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error("[CAPI:Facebook] HTTP", res.status, body.slice(0, 200));
  } else {
    console.log("[CAPI:Facebook] Purchase event sent — eventId:", event.eventId, "amount:", event.amount);
  }
}

async function sendSnapchatCAPI(
  pixelId: string,
  accessToken: string,
  event: CAPIPurchaseEvent
): Promise<void> {
  const userHashes: Record<string, string[]> = {};
  if (event.donorEmail) userHashes.em = [sha256Hex(event.donorEmail)];
  if (event.donorPhone) userHashes.ph = [sha256Hex(normalizePhone(event.donorPhone))];

  const payload = {
    pixel_id: pixelId,
    data: [
      {
        event_name: "PURCHASE",
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: "https://tuwaiqassociation.sa/payment-result",
        client_dedup_id: event.eventId,
        user_data: userHashes,
        custom_data: {
          currency: event.currency || "SAR",
          price: event.amount,
          number_items: 1,
          description: event.donationType || "تبرع",
        },
      },
    ],
  };

  const url = "https://tr.snapchat.com/v2/conversion";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error("[CAPI:Snapchat] HTTP", res.status, body.slice(0, 200));
  } else {
    console.log("[CAPI:Snapchat] Purchase event sent — eventId:", event.eventId, "amount:", event.amount);
  }
}
