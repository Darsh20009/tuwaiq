import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentGatewayDone() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  const donationId = params.get("id");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Notify the parent window (popup opener) via postMessage
    const notify = () => {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: "PAYMENT_DONE", status, id: donationId },
            window.location.origin
          );
          setSent(true);
          // Close this popup after a short delay so user sees the result
          setTimeout(() => {
            try { window.close(); } catch {}
          }, 2000);
          return;
        }
      } catch {}

      // Fallback: if opened in same tab (not a popup), redirect to home
      setSent(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2500);
    };

    // Small delay to ensure the parent window is ready
    const t = setTimeout(notify, 300);
    return () => clearTimeout(t);
  }, [status, donationId]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-white gap-5 p-8"
      dir="rtl"
    >
      {status === "success" ? (
        <>
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-green-700">تم الدفع بنجاح</h2>
          <p className="text-sm text-gray-500 text-center">
            {sent ? "سيتم إغلاق هذه النافذة تلقائياً..." : "جاري التحديث..."}
          </p>
        </>
      ) : status === "failed" ? (
        <>
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-700">لم يتم الدفع</h2>
          <p className="text-sm text-gray-500 text-center">
            {sent ? "سيتم إغلاق هذه النافذة تلقائياً..." : "جاري التحديث..."}
          </p>
        </>
      ) : (
        <>
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-700">جاري التحقق من الدفع...</h2>
          <p className="text-sm text-gray-500">يرجى الانتظار لحظة</p>
        </>
      )}
    </div>
  );
}
