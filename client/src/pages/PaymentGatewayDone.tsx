import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";

export default function PaymentGatewayDone() {
  const params     = new URLSearchParams(window.location.search);
  const status     = params.get("status");
  const donationId = params.get("id");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const notify = () => {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: "PAYMENT_DONE", status, id: donationId },
            window.location.origin
          );
          setSent(true);
          setTimeout(() => { try { window.close(); } catch {} }, 2000);
          return;
        }
      } catch {}

      // Fallback: not a popup — redirect to payment result page
      setSent(true);
      const dest = donationId
        ? `/payment-result?id=${donationId}`
        : "/";
      setTimeout(() => { window.location.href = dest; }, 1500);
    };

    const t = setTimeout(notify, 300);
    return () => clearTimeout(t);
  }, [status, donationId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-5 p-8" dir="rtl">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
        {sent
          ? <Heart className="w-12 h-12 text-emerald-500" />
          : <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        }
      </div>
      <h2 className="text-xl font-bold text-emerald-700">جزاك الله خيراً</h2>
      <p className="text-sm text-gray-500 text-center">
        {sent ? "جارٍ التحويل..." : "يرجى الانتظار لحظة..."}
      </p>
    </div>
  );
}
