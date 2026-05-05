import { useEffect, useRef, useState, useCallback } from "react";
import {
  CheckCircle, XCircle, Loader2, X, Shield,
  ExternalLink, RefreshCw, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaymentContext } from "@/contexts/payment-context";
import { useLocation } from "wouter";

type PaymentStatus =
  | "opening"
  | "waiting"
  | "popup_closed"
  | "confirmed"
  | "failed"
  | "cancelled";

const POLL_INTERVAL = 2500;
const POPUP_CHECK_INTERVAL = 800;
const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000; // 10 min

export function PaymentOverlay() {
  const { pendingPayment, closePayment } = usePaymentContext();
  const [status, setStatus] = useState<PaymentStatus>("opening");
  const [elapsed, setElapsed] = useState(0);
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<PaymentStatus>("opening");
  const [, setLocation] = useLocation();

  const stopAll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (popupCheckRef.current) clearInterval(popupCheckRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try { popupRef.current?.close(); } catch {}
  }, []);

  const setStatusSafe = useCallback((s: PaymentStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const startPolling = useCallback((donationId: string) => {
    pollRef.current = setInterval(async () => {
      if (statusRef.current === "confirmed" || statusRef.current === "failed") return;
      try {
        const res = await fetch(`/api/donations/status/${donationId}`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "confirmed") {
          setStatusSafe("confirmed");
          stopAll();
        } else if (data.status === "failed" || data.status === "cancelled") {
          setStatusSafe("failed");
          stopAll();
        }
      } catch {}
    }, POLL_INTERVAL);
  }, [stopAll, setStatusSafe]);

  const openPopup = useCallback((url: string) => {
    const w = 520, h = 680;
    const left = Math.max(0, (window.screen.width - w) / 2);
    const top = Math.max(0, (window.screen.height - h) / 2);
    const popup = window.open(
      url,
      "rajhi_payment",
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
    popupRef.current = popup;
    return popup;
  }, []);

  useEffect(() => {
    if (!pendingPayment) return;

    setStatusSafe("opening");
    setElapsed(0);

    // Open popup
    const popup = openPopup(pendingPayment.paymentUrl);
    if (!popup) {
      // Popup was blocked — treat as popup_closed immediately
      setStatusSafe("popup_closed");
    } else {
      setStatusSafe("waiting");
    }

    // Poll donation status from server
    startPolling(pendingPayment.donationId);

    // Check if popup was closed by user
    popupCheckRef.current = setInterval(() => {
      if (
        popupRef.current &&
        popupRef.current.closed &&
        statusRef.current === "waiting"
      ) {
        setStatusSafe("popup_closed");
        if (popupCheckRef.current) clearInterval(popupCheckRef.current);
      }
    }, POPUP_CHECK_INTERVAL);

    // Elapsed timer (for UI)
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    // Hard timeout
    timeoutRef.current = setTimeout(() => {
      if (statusRef.current === "waiting" || statusRef.current === "popup_closed") {
        setStatusSafe("failed");
        stopAll();
      }
    }, PAYMENT_TIMEOUT_MS);

    // Listen for postMessage from PaymentGatewayDone popup page
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "PAYMENT_DONE") return;
      if (e.data.status === "success") {
        setStatusSafe("confirmed");
      } else {
        setStatusSafe("failed");
      }
      stopAll();
    };
    window.addEventListener("message", onMessage);

    return () => {
      stopAll();
      window.removeEventListener("message", onMessage);
    };
  }, [pendingPayment?.donationId]);

  function handleClose() {
    stopAll();
    closePayment();
    setStatusSafe("opening");
    setElapsed(0);
  }

  function handleReopen() {
    if (!pendingPayment) return;
    const popup = openPopup(pendingPayment.paymentUrl);
    if (popup) {
      popupRef.current = popup;
      setStatusSafe("waiting");
      // restart popup-closed check
      if (popupCheckRef.current) clearInterval(popupCheckRef.current);
      popupCheckRef.current = setInterval(() => {
        if (popupRef.current?.closed && statusRef.current === "waiting") {
          setStatusSafe("popup_closed");
          if (popupCheckRef.current) clearInterval(popupCheckRef.current);
        }
      }, POPUP_CHECK_INTERVAL);
    }
  }

  function handleCancel() {
    stopAll();
    setStatusSafe("cancelled");
  }

  if (!pendingPayment) return null;

  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-emerald-700 to-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">بوابة الدفع الآمنة</p>
              <p className="text-emerald-200 text-xs">مصرف الراجحي</p>
            </div>
          </div>
          {(status === "confirmed" || status === "failed" || status === "cancelled") && (
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              data-testid="button-close-payment"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* ── WAITING (popup open) ── */}
        {status === "waiting" && (
          <div className="flex flex-col items-center gap-5 px-8 py-10 text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-emerald-600" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">أكمل الدفع في النافذة المفتوحة</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                تم فتح نافذة بوابة الدفع. يرجى إدخال بيانات بطاقتك وإتمام العملية.
                <br />
                ستُغلق هذه الشاشة تلقائياً عند اكتمال الدفع.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 px-4 py-2 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>في انتظار تأكيد الدفع</span>
              <span className="font-mono text-gray-400 mr-1">{mins}:{secs}</span>
            </div>
            <button
              onClick={handleCancel}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors underline underline-offset-2"
              data-testid="button-cancel-payment"
            >
              إلغاء العملية
            </button>
          </div>
        )}

        {/* ── POPUP CLOSED / BLOCKED ── */}
        {(status === "popup_closed" || status === "opening") && (
          <div className="flex flex-col items-center gap-5 px-8 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
              <ExternalLink className="w-10 h-10 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {status === "opening" ? "تعذّر فتح النافذة" : "أُغلقت نافذة الدفع"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {status === "opening"
                  ? "يبدو أن المتصفح منع فتح نافذة الدفع. اضغط الزر أدناه لفتحها يدوياً."
                  : "لم تكتمل عملية الدفع. يمكنك إعادة فتح نافذة الدفع أو الإلغاء."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 px-4 py-2 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>لا يزال التبرع محجوزاً في انتظارك</span>
            </div>
            <div className="w-full space-y-2 max-w-xs">
              <Button
                onClick={handleReopen}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-reopen-payment"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                فتح نافذة الدفع
              </Button>
              <Button variant="outline" onClick={handleCancel} className="w-full" data-testid="button-cancel-after-close">
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {/* ── CANCELLED ── */}
        {status === "cancelled" && (
          <div className="flex flex-col items-center gap-5 px-8 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <X className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">تم إلغاء العملية</h3>
              <p className="text-sm text-muted-foreground">يمكنك التبرع في أي وقت تشاء.</p>
            </div>
            <Button onClick={handleClose} className="w-full max-w-xs" data-testid="button-close-cancelled">
              إغلاق
            </Button>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {status === "confirmed" && (
          <div className="flex flex-col items-center gap-5 px-8 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">تم التبرع بنجاح 🎉</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                شكراً لعطائك الكريم. جزاك الله خيراً وجعلها في ميزان حسناتك.
                <br />
                ستصلك شهادة التبرع على بريدك الإلكتروني.
              </p>
            </div>
            <div className="w-full space-y-2 max-w-xs">
              <Button
                onClick={() => { handleClose(); setLocation("/profile"); }}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-success-profile"
              >
                عرض شهادة التبرع
              </Button>
              <Button variant="ghost" onClick={handleClose} className="w-full" data-testid="button-success-close">
                إغلاق
              </Button>
            </div>
          </div>
        )}

        {/* ── FAILED ── */}
        {status === "failed" && (
          <div className="flex flex-col items-center gap-5 px-8 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700 mb-2">لم تكتمل عملية الدفع</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                تعذّرت معالجة الدفع. يمكنك المحاولة مجدداً أو اختيار التحويل البنكي.
              </p>
            </div>
            <div className="w-full space-y-2 max-w-xs">
              <Button onClick={handleClose} className="w-full" data-testid="button-failed-retry">
                حاول مرة أخرى
              </Button>
              <Button
                variant="outline"
                onClick={() => { handleClose(); setLocation("/bank-accounts"); }}
                className="w-full"
                data-testid="button-failed-transfer"
              >
                التحويل البنكي بديلاً
              </Button>
            </div>
          </div>
        )}

        {/* Security footer */}
        <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3 h-3 text-emerald-600" />
          <span>اتصال مشفّر SSL — لا تشارك بيانات بطاقتك مع أي طرف آخر</span>
        </div>
      </div>
    </div>
  );
}
