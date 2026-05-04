/**
 * Browser-side pixel utilities — Facebook Pixel & Snapchat Pixel
 *
 * Initialization is called once when pixel IDs are available from settings.
 * Purchase events include an eventID that matches the server-side CAPI call
 * so each platform deduplicates the conversion and counts it exactly once.
 */

declare global {
  interface Window {
    fbq: ((...args: any[]) => void) & { callMethod?: any; queue?: any[]; loaded?: boolean; version?: string };
    _fbq: any;
    snaptr: ((...args: any[]) => void) & { handleRequest?: any; queue?: any[] };
    dataLayer: Record<string, any>[];
  }
}

let fbInitialized = false;
let snapInitialized = false;

export function initFacebookPixel(pixelId: string): void {
  if (fbInitialized || !pixelId || typeof window === "undefined") return;
  fbInitialized = true;

  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode!.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

export function initSnapchatPixel(pixelId: string): void {
  if (snapInitialized || !pixelId || typeof window === "undefined") return;
  snapInitialized = true;

  /* eslint-disable */
  (function (e: any, t: Document, n: string) {
    if (e.snaptr) return;
    const a: any = (e.snaptr = function () {
      a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
    });
    a.queue = [];
    const s = "script";
    const r = t.createElement(s) as HTMLScriptElement;
    r.async = true;
    r.src = n;
    const u = t.getElementsByTagName(s)[0];
    u.parentNode!.insertBefore(r, u);
  })(window, document, "https://sc-static.net/scevent.min.js");
  /* eslint-enable */

  window.snaptr("init", pixelId);
  window.snaptr("track", "PAGE_VIEW");
}

export interface PurchaseEventParams {
  /** Donation ID — used as deduplication key matching the server-side CAPI eventId */
  eventId: string;
  value: number;
  currency?: string;
  contentName?: string;
}

/**
 * Fire a Purchase event on all initialized pixels + GTM dataLayer.
 * Must be called after initFacebookPixel / initSnapchatPixel.
 */
export function firePurchaseEvent(params: PurchaseEventParams): void {
  const currency = params.currency || "SAR";

  // Google Tag Manager / GA4 — dataLayer push
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null }); // clear previous ecommerce object
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: params.eventId,
        value: params.value,
        currency,
        items: [
          {
            item_id: params.eventId,
            item_name: params.contentName || "تبرع",
            item_category: "Donation",
            price: params.value,
            quantity: 1,
          },
        ],
      },
    });
  }

  // Facebook Pixel — eventID must match CAPI event_id for deduplication
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(
      "track",
      "Purchase",
      {
        value: params.value,
        currency,
        content_name: params.contentName || "تبرع",
      },
      { eventID: params.eventId }
    );
  }

  // Snapchat Pixel — client_dedup_id must match CAPI client_dedup_id
  if (typeof window !== "undefined" && window.snaptr) {
    window.snaptr("track", "PURCHASE", {
      price: params.value,
      currency,
      client_dedup_id: params.eventId,
    });
  }
}
