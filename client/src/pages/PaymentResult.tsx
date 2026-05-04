import { useEffect, useRef, useState } from "react";
import {
  Heart, Home, Mail, Send, CheckCircle2, Shield, Loader2, Phone, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { initFacebookPixel, initSnapchatPixel, firePurchaseEvent } from "@/lib/pixels";

const DONATION_TYPE_LABELS: Record<string, string> = {
  general:          "صدقة عامة",
  zakat:            "زكاة",
  waqf:             "وقف",
  water:            "سقيا الماء",
  "ramadan-basket": "سلة رمضانية",
  iftar:            "إفطار صائم",
  food:             "إطعام الجائع",
  "special-cases":  "حالات خاصة",
};

export default function PaymentResult() {
  const params     = new URLSearchParams(window.location.search);
  const donationId = params.get("id");

  const [donationData, setDonationData]   = useState<any>(null);
  const [fetching,     setFetching]       = useState(true);
  const [guestEmail,   setGuestEmail]     = useState("");
  const [pdfSending,   setPdfSending]     = useState(false);
  const [pdfSent,      setPdfSent]        = useState(false);
  const [pdfError,     setPdfError]       = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"] });
  const assocName = settings?.associationName || "جمعية طويق للخدمات الإنسانية";
  const logoUrl   = settings?.logoUrl || "";

  // Initialize ad pixels once settings (pixel IDs) are available
  const pixelsFired = useRef(false);
  useEffect(() => {
    if (!settings) return;
    if (settings.facebookPixelId) initFacebookPixel(settings.facebookPixelId);
    if (settings.snapchatPixelId) initSnapchatPixel(settings.snapchatPixelId);
  }, [settings]);

  // Fire Purchase event once donation data is confirmed — only once per page load
  useEffect(() => {
    if (!donationData || !donationId || pixelsFired.current) return;
    pixelsFired.current = true;

    firePurchaseEvent({
      eventId: donationId,
      value: Number(donationData.amount || 0),
      currency: donationData.currency || "SAR",
      contentName: DONATION_TYPE_LABELS[donationData.type] || donationData.type || "تبرع",
    });
  }, [donationData, donationId]);

  // Fetch donation details in background — only to show amount/reference, not status
  useEffect(() => {
    if (!donationId) { setFetching(false); return; }

    const load = () =>
      fetch(`/api/donations/status/${donationId}`, { credentials: "include" })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setDonationData(d); })
        .catch(() => {})
        .finally(() => setFetching(false));

    load();

    // Poll a few times to get the most up-to-date receipt ID / amount
    let count = 0;
    pollRef.current = setInterval(() => {
      count++;
      if (count >= 5) { clearInterval(pollRef.current!); return; }
      fetch(`/api/donations/status/${donationId}`, { credentials: "include" })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setDonationData(d); })
        .catch(() => {});
    }, 4000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [donationId]);

  const sendGuestPdf = async () => {
    if (!donationId || !guestEmail || pdfSending) return;
    setPdfSending(true);
    setPdfError("");
    try {
      const res  = await fetch(`/api/donations/${donationId}/send-pdf`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: guestEmail }),
      });
      const data = await res.json();
      if (res.ok) setPdfSent(true);
      else setPdfError(data.message || "حدث خطأ أثناء الإرسال");
    } catch {
      setPdfError("تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    }
    setPdfSending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-white" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          {/* ── Header ── */}
          <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 px-8 py-8 text-center relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

            {/* Logo */}
            <div className="flex justify-center mb-3 relative">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={assocName}
                  className="h-14 w-14 object-contain rounded-full bg-white p-1.5 shadow-md"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
              )}
            </div>
            <p className="text-emerald-100 text-xs mb-4">{assocName}</p>

            {/* Animated check */}
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: "1.4s", animationIterationCount: 3 }} />
              <div className="relative w-20 h-20 rounded-full bg-white/25 flex items-center justify-center">
                <CheckCircle2 className="w-11 h-11 text-white" />
              </div>
            </div>

            <h1 className="text-white text-2xl font-bold mb-1">جزاك الله خيراً</h1>
            <p className="text-emerald-100 text-sm font-medium">تبرعكم وصل — كتب الله أجركم</p>
          </div>

          {/* ── Body ── */}
          <div className="px-7 py-6 space-y-5">

            {/* Review notice */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800 mb-0.5">قيد المراجعة من الإدارة</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  سيقوم فريقنا بمراجعة العملية يدوياً والتأكد من وصول تبرعكم.
                  لمتابعة التبرع تواصلوا معنا على{" "}
                  <a href="tel:+966505793012" className="font-bold underline">0505793012</a>
                </p>
              </div>
            </div>

            {/* Donation details */}
            {fetching ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              </div>
            ) : donationData && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                {/* Amount */}
                <div className="text-center">
                  <p className="text-xs text-emerald-600 mb-0.5">المبلغ</p>
                  <p className="text-3xl font-extrabold text-emerald-700">
                    {Number(donationData.amount || 0).toLocaleString("ar-SA")}
                    <span className="text-lg font-medium mr-1">ر.س</span>
                  </p>
                </div>
                <div className="h-px bg-emerald-100" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {donationData.donorName && (
                    <div>
                      <p className="text-emerald-600 text-xs">اسم المتبرع</p>
                      <p className="font-semibold text-gray-800 truncate">{donationData.donorName}</p>
                    </div>
                  )}
                  {donationData.type && (
                    <div>
                      <p className="text-emerald-600 text-xs">نوع التبرع</p>
                      <p className="font-semibold text-gray-800">
                        {DONATION_TYPE_LABELS[donationData.type] || donationData.type}
                      </p>
                    </div>
                  )}
                </div>
                {(donationData.receiptId || donationId) && (
                  <div className="bg-white rounded-xl p-2.5 border border-emerald-100 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">الرقم المرجعي</p>
                    <p className="font-mono text-xs text-gray-700 break-all">
                      {donationData.receiptId || donationId}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hadith */}
            <p className="text-center text-muted-foreground text-xs leading-relaxed border-r-2 border-emerald-200 pr-3">
              «مَنْ فَرَّجَ عَنْ مُسْلِمٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا فَرَّجَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ»
            </p>

            {/* PDF certificate email */}
            {donationId && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-sm font-semibold text-emerald-800">احصل على شهادة تبرعك</p>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  أدخل بريدك الإلكتروني لاستلام شهادة التبرع بصيغة PDF.
                </p>
                {pdfSent ? (
                  <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-xs text-emerald-700 font-medium">تم إرسال الشهادة إلى بريدك ✓</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendGuestPdf()}
                        className="text-sm h-10 bg-white border-emerald-200 focus:border-emerald-400 text-left"
                        dir="ltr"
                        data-testid="input-guest-email"
                      />
                      <button
                        onClick={sendGuestPdf}
                        disabled={pdfSending || !guestEmail}
                        className="flex items-center gap-1.5 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-sm font-bold transition-colors shrink-0"
                        data-testid="button-send-pdf-email"
                      >
                        {pdfSending
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                    {pdfError && <p className="text-xs text-red-500">{pdfError}</p>}
                  </div>
                )}
              </div>
            )}

            {/* WhatsApp support */}
            <a
              href="https://wa.me/966505793012"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors text-sm"
              data-testid="button-whatsapp-support"
            >
              <Phone className="w-4 h-4" />
              تواصل معنا عبر واتساب
            </a>

            {/* Home button */}
            <Link href="/">
              <Button variant="ghost" className="w-full h-10 text-muted-foreground" data-testid="button-home">
                <Home className="w-4 h-4 ml-2" />
                الصفحة الرئيسية
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>جميع المدفوعات مؤمّنة عبر بوابة مصرف الراجحي</span>
          </div>
        </div>
      </div>
    </div>
  );
}
