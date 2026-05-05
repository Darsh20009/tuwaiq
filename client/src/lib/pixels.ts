/**
 * Browser-side pixel utilities — Facebook/Instagram, Snapchat, TikTok
 *
 * Instagram Ads uses the same Meta/Facebook pixel — no separate script needed.
 * Initialization is called once when pixel IDs are available from settings.
 * Purchase events include an eventID that matches the server-side CAPI call
 * so each platform deduplicates the conversion and counts it exactly once.
 */

declare global {
  interface Window {
    fbq: ((...args: any[]) => void) & { callMethod?: any; queue?: any[]; loaded?: boolean; version?: string };
    _fbq: any;
    snaptr: ((...args: any[]) => void) & { handleRequest?: any; queue?: any[] };
    ttq: ((...args: any[]) => void) & { load?: (id: string) => void; page?: () => void; track?: (event: string, data?: any) => void; _i?: any[]; _t?: any[]; _o?: any };
    dataLayer: Record<string, any>[];
  }
}

let fbInitialized = false;
let snapInitialized = false;
let tiktokInitialized = false;

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

export function initTikTokPixel(pixelId: string): void {
  if (tiktokInitialized || !pixelId || typeof window === "undefined") return;
  tiktokInitialized = true;

  /* eslint-disable */
  (function (w: any, d: Document, t: string) {
    w.TiktokAnalyticsObject = t;
    const ttq: any = (w[t] = w[t] || []);
    ttq.methods = [
      "page", "track", "identify", "instances", "debug",
      "on", "off", "once", "ready", "alias", "group",
      "enableCookie", "disableCookie",
    ];
    ttq.setAndDefer = function (obj: any, method: string) {
      obj[method] = function () {
        obj.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    ttq.instance = function (t: string) {
      const i = ttq._i[t] || [];
      for (let n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(i, ttq.methods[n]);
      return i;
    };
    ttq.load = function (e: string, n: any) {
      const i = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      const script = d.createElement("script") as HTMLScriptElement;
      script.type = "text/javascript";
      script.async = true;
      script.src = i + "?sdkid=" + e + "&lib=" + t;
      const s = d.getElementsByTagName("script")[0];
      s.parentNode!.insertBefore(script, s);
    };
  })(window, document, "ttq");
  /* eslint-enable */

  (window.ttq as any).load(pixelId);
  (window.ttq as any).page();
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
 * Each pixel call is wrapped in try/catch — a pixel error never affects the others.
 */
export function firePurchaseEvent(params: PurchaseEventParams): void {
  const currency = params.currency || "SAR";

  // Google Tag Manager / GA4 — dataLayer push
  try {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
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
  } catch (e) {
    console.warn("[Pixel] GTM dataLayer push failed:", e);
  }

  // Facebook / Instagram Pixel — eventID must match CAPI event_id for deduplication
  try {
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
  } catch (e) {
    console.warn("[Pixel] Facebook pixel Purchase failed:", e);
  }

  // Snapchat Pixel — client_dedup_id must match CAPI client_dedup_id
  try {
    if (typeof window !== "undefined" && window.snaptr) {
      window.snaptr("track", "PURCHASE", {
        price: params.value,
        currency,
        client_dedup_id: params.eventId,
      });
    }
  } catch (e) {
    console.warn("[Pixel] Snapchat pixel PURCHASE failed:", e);
  }

  // TikTok Pixel — event_id must match CAPI event_id for deduplication
  try {
    if (typeof window !== "undefined" && window.ttq) {
      (window.ttq as any).track("CompletePayment", {
        value: params.value,
        currency,
        content_type: "product",
        content_id: params.eventId,
        description: params.contentName || "تبرع",
      });
    }
  } catch (e) {
    console.warn("[Pixel] TikTok pixel CompletePayment failed:", e);
  }
}
