import { useState, useEffect } from "react";
import { Bell, BellOff, X, Smartphone, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// ─── iOS Detection ────────────────────────────────────────────────────────────
function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isInStandaloneMode(): boolean {
  return (
    ("standalone" in window.navigator && (window.navigator as any).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(Array.from(rawData).map(c => c.charCodeAt(0)));
}

async function registerPush(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

    const vapidRes = await fetch("/api/notifications/vapid-key");
    if (!vapidRes.ok) return false;
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
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...p256dh)),
          auth: btoa(String.fromCharCode(...auth)),
        },
      }),
    });
    return true;
  } catch {
    return false;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PushNotificationPrompt() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"prompt" | "ios" | "success" | "denied">("prompt");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Don't show if already dismissed permanently
    if (localStorage.getItem("push_dismissed") === "true") return;
    // Don't show if already granted
    if (typeof Notification !== "undefined" && Notification.permission === "granted") return;
    // Don't show if explicitly denied
    if (typeof Notification !== "undefined" && Notification.permission === "denied") return;

    // Short delay to not show immediately on login
    const timer = setTimeout(() => {
      setShow(true);
      // iOS in browser (not standalone) — show install guidance instead
      if (isIOS() && !isInStandaloneMode()) {
        setMode("ios");
      } else {
        setMode("prompt");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user]);

  if (!show || !user) return null;

  const dismiss = (permanent?: boolean) => {
    setShow(false);
    if (permanent) localStorage.setItem("push_dismissed", "true");
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const ok = await registerPush();
        if (ok) {
          setMode("success");
          setTimeout(() => setShow(false), 2500);
        } else {
          setMode("denied");
        }
      } else {
        setMode("denied");
      }
    } catch {
      setMode("denied");
    } finally {
      setLoading(false);
    }
  };

  // ── iOS Guide ───────────────────────────────────────────────────────────────
  if (mode === "ios") {
    return (
      <div
        dir="rtl"
        className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 rounded-2xl shadow-2xl bg-white border border-gray-200 p-4 animate-in slide-in-from-bottom-4"
        data-testid="push-ios-prompt"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-5 w-5 text-green-600" />
            </div>
            <p className="font-bold text-sm text-gray-800">فعّل الإشعارات على iPhone</p>
          </div>
          <button onClick={() => dismiss()} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
          لتلقي الإشعارات على iPhone، أضف التطبيق للشاشة الرئيسية:
        </p>
        <ol className="text-xs text-gray-700 space-y-1.5 mb-4">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">١</span>
            <span>اضغط على <Share className="h-3 w-3 inline" /> زر المشاركة في الأسفل</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">٢</span>
            <span>اختر "إضافة إلى الشاشة الرئيسية"</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">٣</span>
            <span>افتح التطبيق من الشاشة الرئيسية وفعّل الإشعارات</span>
          </li>
        </ol>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-gray-500"
          onClick={() => dismiss(true)}
        >
          لا شكراً، لا أريد الإشعارات
        </Button>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (mode === "success") {
    return (
      <div
        dir="rtl"
        className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 rounded-2xl shadow-xl bg-green-600 text-white p-4 animate-in slide-in-from-bottom-4"
        data-testid="push-success"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-sm">تم تفعيل الإشعارات ✓</p>
            <p className="text-xs text-green-100 mt-0.5">ستصلك إشعارات حتى خارج التطبيق</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Denied ────────────────────────────────────────────────────────────────────
  if (mode === "denied") {
    return (
      <div
        dir="rtl"
        className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 rounded-2xl shadow-xl bg-amber-50 border border-amber-200 p-4 animate-in slide-in-from-bottom-4"
        data-testid="push-denied"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <BellOff className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-800">الإشعارات محجوبة</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                يمكنك تفعيلها من إعدادات المتصفح ← الموقع ← الإشعارات
              </p>
            </div>
          </div>
          <button onClick={() => dismiss(true)} className="text-amber-400 hover:text-amber-600 flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Default Prompt ────────────────────────────────────────────────────────────
  return (
    <div
      dir="rtl"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 rounded-2xl shadow-2xl bg-white border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4"
      data-testid="push-prompt"
    >
      {/* Green top bar */}
      <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-600" />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">فعّل إشعارات طويق</p>
              <p className="text-[11px] text-gray-500 mt-0.5">ابقَ على اطلاع دائم</p>
            </div>
          </div>
          <button
            onClick={() => dismiss()}
            className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
            data-testid="push-dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          احصل على إشعارات فورية عند قبول طلباتك، أو وصول تحويلاتك، أو أي تحديث مهم — حتى عندما تكون خارج التطبيق.
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleEnable}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-8"
            data-testid="push-enable-btn"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                جارٍ التفعيل...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                تفعيل الإشعارات
              </span>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dismiss(true)}
            className="text-xs h-8 text-gray-500 px-3"
            data-testid="push-decline-btn"
          >
            لاحقاً
          </Button>
        </div>
      </div>
    </div>
  );
}
