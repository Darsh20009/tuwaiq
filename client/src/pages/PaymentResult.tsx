import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2, XCircle, Loader2, Shield,
  Home, RotateCcw, Building2, Heart, Clock, Award, FileText, Phone, Mail, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

type Status = "loading" | "polling" | "success" | "failed";

const POLL_INTERVAL = 3000;
const POLL_MAX_SECONDS = 120;

const DONATION_TYPE_LABELS: Record<string, string> = {
  general:         "صدقة عامة",
  zakat:           "زكاة",
  waqf:            "وقف",
  water:           "سقيا الماء",
  "ramadan-basket":"سلة رمضانية",
  iftar:           "إفطار صائم",
  food:            "إطعام الجائع",
  "special-cases": "حالات خاصة",
};

export default function PaymentResult() {
  const params       = new URLSearchParams(window.location.search);
  const rawStatus    = params.get("status");
  const reason       = params.get("reason");
  const donationId   = params.get("id");
  // Poll whenever we have a donationId (always verify from DB), or when status is pending/loading
  const needsPoll    = !!donationId || rawStatus === "pending" || rawStatus === "loading" || !rawStatus;

  // Always poll from DB when we have a donationId — never trust the URL parameter alone.
  // CRITICAL: Even if status=failed in the URL, start in "polling" mode and do an inquiry.
  // Al Rajhi may send a false "failed" callback even when money was actually captured.
  // We verify with the gateway before showing any failure to the donor.
  const [status, setStatus] = useState<Status>(
    donationId ? "polling"                // Always poll when we have a donation ID
    : rawStatus === "success" ? "loading"
    : rawStatus === "failed" ? "failed"
    : "polling"
  );
  const [donationData, setDonationData] = useState<any>(null);
  const [seconds,      setSeconds]      = useState(0);
  const [showDetails,  setShowDetails]  = useState(false);
  const [checking,     setChecking]     = useState(false);
  const gatewayConfirmedFailedRef = useRef(false);
  const [guestEmail,   setGuestEmail]   = useState("");
  const [pdfSending,   setPdfSending]   = useState(false);
  const [pdfSent,      setPdfSent]      = useState(false);
  const [pdfError,     setPdfError]     = useState("");
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"] });

  const applyDonationData = (data: any) => {
    if (data?.success) setDonationData(data);
    if (data?.status === "confirmed" || data?.status === "success" || data?.paymentStatus === "confirmed") {
      clearInterval(pollRef.current!);
      clearInterval(timerRef.current!);
      setStatus("loading");
    } else if (data?.status === "failed" || data?.status === "cancelled" || data?.paymentStatus === "failed") {
      // CRITICAL: For Rajhi payments (donationId present), only show the failed state
      // when the gateway has EXPLICITLY confirmed the payment was not captured.
      // DB "failed" status alone is not reliable — the cron may auto-expire donations
      // whose callback couldn't be verified even when money WAS captured.
      // We only show failure when inquiry returns {resolved: true, status: "failed"}.
      if (donationId && !gatewayConfirmedFailedRef.current) {
        return;
      }
      clearInterval(pollRef.current!);
      clearInterval(timerRef.current!);
      setStatus("failed");
    }
  };

  // Fetch donation details immediately if we have an id.
  // CRITICAL: If status comes back as "failed", still trigger an inquiry from the gateway —
  // Al Rajhi sometimes reports failure even when money was captured.
  useEffect(() => {
    if (!donationId) return;
    fetch(`/api/donations/status/${donationId}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        applyDonationData(d);
        // If still showing as failed/pending after initial fetch, immediately trigger inquiry
        if (d.status === "failed" || d.status === "pending" || !d.status) {
          setTimeout(() => triggerInquiry(), 1000);
        }
      })
      .catch(() => {});
  }, [donationId]);

  // Brief intro → then reveal success
  useEffect(() => {
    if (status !== "loading") return;
    const t1 = setTimeout(() => setShowDetails(true), 400);
    const t2 = setTimeout(() => setStatus("success"),  1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [status]);

  // Trigger server-side Al Rajhi inquiry (asks gateway directly)
  const triggerInquiry = async () => {
    if (!donationId) return;
    try {
      const res = await fetch(`/api/donations/inquiry/${donationId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      // Only mark gateway-confirmed-failed when inquiry explicitly resolves to failed.
      // An "unclear" inquiry should NOT trigger the failed state.
      if (data?.resolved === true && (data?.status === "failed" || data?.status === "cancelled")) {
        gatewayConfirmedFailedRef.current = true;
      }
      applyDonationData(data);
    } catch {}
  };

  // Polling for pending state
  useEffect(() => {
    if (!needsPoll || !donationId) return;
    if (status === "success" || status === "failed") return;

    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);

    let pollCount = 0;
    pollRef.current = setInterval(async () => {
      pollCount++;
      try {
        const res = await fetch(`/api/donations/status/${donationId}`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        applyDonationData(data);

        // After 15 seconds (5 polls) without success, trigger Al Rajhi inquiry
        // Then repeat inquiry every 30 seconds
        if (pollCount === 5 || (pollCount > 5 && pollCount % 10 === 0)) {
          triggerInquiry();
        }
      } catch {}
    }, POLL_INTERVAL);

    const maxTimeout = setTimeout(() => {
      if (pollRef.current)  clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      // Final inquiry attempt at timeout
      triggerInquiry();
    }, POLL_MAX_SECONDS * 1000);

    return () => {
      clearInterval(pollRef.current!);
      clearInterval(timerRef.current!);
      clearTimeout(maxTimeout);
    };
  }, [donationId, needsPoll]);

  // Manual check now — also triggers server-side inquiry
  const checkNow = async () => {
    if (!donationId || checking) return;
    setChecking(true);
    try {
      // First try quick status check
      const res = await fetch(`/api/donations/status/${donationId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        applyDonationData(data);
        // If still pending after status check, trigger Al Rajhi inquiry
        if (data?.status === "pending" || data?.status === "failed" || !data?.status) {
          await triggerInquiry();
        }
      } else {
        await triggerInquiry();
      }
    } catch {}
    setChecking(false);
  };

  const sendGuestPdf = async () => {
    if (!donationId || !guestEmail || pdfSending) return;
    setPdfSending(true);
    setPdfError("");
    try {
      const res = await fetch(`/api/donations/${donationId}/send-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setPdfSent(true);
      } else {
        setPdfError(data.message || "حدث خطأ أثناء الإرسال");
      }
    } catch {
      setPdfError("تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    }
    setPdfSending(false);
  };

  const failReason =
    reason === "declined"      ? "تم رفض بطاقة الدفع. يرجى التحقق من البيانات والمحاولة مرة أخرى."
    : reason === "hash_mismatch" ? "تعذّر التحقق من صحة الاستجابة. يرجى التواصل مع الدعم."
    : reason === "config_error"  ? "خطأ في إعدادات بوابة الدفع. يرجى التواصل مع الدعم."
    : reason === "server_error"  ? "خطأ في الخادم. يرجى التواصل مع الدعم إذا تم خصم المبلغ."
    : "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.";

  const assocName = settings?.associationName || "جمعية طويق للخدمات الإنسانية";
  const logoUrl   = settings?.logoUrl || "";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 bg-white"
      dir="rtl"
    >
      <div className="w-full max-w-md">

        {/* ══════════════════ POLLING / PENDING ══════════════════ */}
        {(status === "polling") && (
          <div className="animate-in fade-in duration-500 space-y-4">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

              {/* Header */}
              <div className="bg-gradient-to-b from-emerald-600 to-emerald-700 px-8 py-8 text-center relative overflow-hidden">
                {/* Subtle circle decorations */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

                {/* Logo */}
                <div className="flex justify-center mb-4 relative">
                  {logoUrl ? (
                    <img src={logoUrl} alt={assocName}
                      className="h-14 w-14 object-contain rounded-full bg-white p-1.5 shadow-md"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-emerald-100 text-xs mb-3">{assocName}</p>

                {/* Spinner */}
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {seconds < POLL_MAX_SECONDS
                    ? <Loader2 className="w-9 h-9 text-white animate-spin" />
                    : <Clock className="w-9 h-9 text-white" />
                  }
                </div>
                <h1 className="text-white text-xl font-bold mb-1">
                  {seconds < POLL_MAX_SECONDS ? "جاري التحقق من الدفع..." : "العملية قيد المعالجة"}
                </h1>
                <p className="text-emerald-100 text-sm">
                  {seconds < POLL_MAX_SECONDS
                    ? "لا تغلق الصفحة — سيتم التحديث تلقائياً"
                    : "يستغرق التحقق وقتاً أطول من المعتاد"}
                </p>
              </div>

              {/* Body */}
              <div className="px-7 py-6 space-y-4">
                {seconds < POLL_MAX_SECONDS ? (
                  <>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                      <p className="text-emerald-800 text-sm leading-relaxed">
                        نتحقق الآن من نتيجة عملية الدفع مع مصرف الراجحي.<br />
                        يستغرق ذلك عادةً بضع ثوانٍ.
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((seconds / POLL_MAX_SECONDS) * 100, 95)}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center space-y-2">
                    <p className="text-amber-800 text-sm font-medium">
                      إذا تم خصم المبلغ من حسابك، لن يضيع تبرعك.
                    </p>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      يرجى التواصل معنا مع الرقم المرجعي لعمليتك حتى نؤكد تبرعك يدوياً.
                    </p>
                    {donationId && (
                      <div className="mt-2 bg-white rounded-xl p-2.5 border border-amber-100">
                        <p className="text-xs text-gray-500 mb-0.5">الرقم المرجعي</p>
                        <p className="font-mono text-xs text-gray-700 break-all">{donationId}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  {donationId && (
                    <button
                      onClick={checkNow}
                      disabled={checking}
                      className="flex items-center justify-center gap-2 w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-bold transition-colors text-sm"
                      data-testid="button-check-now"
                    >
                      {checking
                        ? <><RotateCcw className="w-4 h-4 animate-spin" /> جارٍ التحقق...</>
                        : <><RotateCcw className="w-4 h-4" /> تحقق الآن</>
                      }
                    </button>
                  )}
                  {seconds >= POLL_MAX_SECONDS && (
                    <a
                      href="https://wa.me/966505793012"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors text-sm"
                      data-testid="button-whatsapp-support"
                    >
                      <Phone className="w-4 h-4" />
                      تواصل معنا عبر واتساب
                    </a>
                  )}
                  <Link href="/">
                    <Button variant="ghost" className="w-full h-10 text-muted-foreground" data-testid="button-home-pending">
                      <Home className="w-4 h-4 ml-2" />
                      الصفحة الرئيسية
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>جميع المدفوعات مؤمّنة عبر بوابة مصرف الراجحي</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ LOADING (brief intro before success) ══════════════════ */}
        {status === "loading" && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
              {logoUrl ? (
                <img src={logoUrl} alt={assocName}
                  className="h-12 w-12 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <Heart className="w-10 h-10 text-emerald-500" />
              )}
            </div>
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        )}

        {/* ══════════════════ SUCCESS ══════════════════ */}
        {status === "success" && (
          <div className="animate-in zoom-in-95 fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

              {/* Green header */}
              <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 px-8 py-8 text-center relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

                {/* Logo */}
                <div className="flex justify-center mb-3 relative">
                  {logoUrl ? (
                    <img src={logoUrl} alt={assocName}
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

                {/* Animated checkmark */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: "1.4s" }} />
                  <div className="relative w-20 h-20 rounded-full bg-white/25 flex items-center justify-center animate-bounce" style={{ animationDuration: "0.8s", animationIterationCount: 1 }}>
                    <CheckCircle2 className="w-11 h-11 text-white" />
                  </div>
                </div>

                <h1 className="text-white text-2xl font-bold mb-1">شكراً لتبرعكم</h1>
                <p className="text-emerald-100 text-sm font-medium">كتب الله أجركم</p>
              </div>

              {/* Donation details */}
              <div className="px-7 py-6 space-y-5">

                {donationData && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                    {/* Amount — large */}
                    <div className="text-center">
                      <p className="text-xs text-emerald-600 mb-0.5">المبلغ المتبرع به</p>
                      <p className="text-3xl font-extrabold text-emerald-700">
                        {Number(donationData.amount).toLocaleString("ar-SA")}
                        <span className="text-lg font-medium mr-1">ر.س</span>
                      </p>
                    </div>

                    <div className="h-px bg-emerald-100" />

                    {/* Details grid */}
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

                    {/* Receipt ID */}
                    {donationData.receiptId && (
                      <div className="bg-white rounded-xl p-2.5 border border-emerald-100 text-center">
                        <p className="text-xs text-gray-500 mb-0.5">رقم الإيصال</p>
                        <p className="font-mono text-xs text-gray-700">{donationData.receiptId}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Hadith */}
                <p className="text-center text-muted-foreground text-xs leading-relaxed border-r-2 border-emerald-200 pr-3">
                  «مَنْ فَرَّجَ عَنْ مُسْلِمٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا فَرَّجَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ»
                </p>

                {/* Guest email to receive PDF certificate + invoice */}
                {donationId && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-sm font-semibold text-emerald-800">احصل على شهادتك وفاتورتك</p>
                    </div>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      أدخل بريدك الإلكتروني لاستلام شهادة التبرع والفاتورة بصيغة PDF مباشرة.
                    </p>
                    {pdfSent ? (
                      <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-xs text-emerald-700 font-medium">
                          تم إرسال الوثائق إلى بريدك الإلكتروني بنجاح ✓
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="example@email.com"
                            value={guestEmail}
                            onChange={e => setGuestEmail(e.target.value)}
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
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Send className="w-3.5 h-3.5" />
                            }
                            إرسال
                          </button>
                        </div>
                        {pdfError && (
                          <p className="text-xs text-red-600">{pdfError}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2.5 pt-1">
                  <Link href="/certificates">
                    <Button
                      className="w-full h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-700"
                      data-testid="button-view-certificate"
                    >
                      <Award className="w-4 h-4 ml-2" />
                      عرض شهادة التبرع
                    </Button>
                  </Link>
                  <Link href="/certificates">
                    <Button
                      variant="outline"
                      className="w-full h-11 text-sm border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      data-testid="button-view-invoice"
                    >
                      <FileText className="w-4 h-4 ml-2" />
                      عرض الفاتورة وتحميلها
                    </Button>
                  </Link>
                  <Link href="/donate">
                    <Button variant="ghost" className="w-full h-10 text-muted-foreground text-sm" data-testid="button-donate-again">
                      <Heart className="w-4 h-4 ml-2 text-red-400" />
                      تبرع مرة أخرى
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" className="w-full h-10 text-muted-foreground text-sm" data-testid="button-home-success">
                      <Home className="w-4 h-4 ml-2" />
                      الصفحة الرئيسية
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>جميع المدفوعات مؤمّنة عبر بوابة مصرف الراجحي</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ FAILED ══════════════════ */}
        {status === "failed" && (
          <div className="animate-in zoom-in-95 fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

              <div className="bg-gradient-to-b from-red-500 to-red-600 px-8 py-8 text-center relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

                <div className="flex justify-center mb-3 relative">
                  {logoUrl ? (
                    <img src={logoUrl} alt={assocName}
                      className="h-14 w-14 object-contain rounded-full bg-white p-1.5 shadow-md"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-red-100 text-xs mb-4">{assocName}</p>

                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-11 h-11 text-white" />
                </div>
                <h1 className="text-white text-2xl font-bold mb-1">لم تكتمل عملية الدفع</h1>
                <p className="text-red-100 text-sm">
                  {donationId
                    ? "إذا تم خصم مبلغ من حسابك، يرجى التواصل معنا فوراً"
                    : "لم يتم خصم أي مبلغ من حسابك"}
                </p>
              </div>

              <div className="px-7 py-6 space-y-5">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                  <p className="text-red-700 text-sm leading-relaxed">{failReason}</p>
                </div>

                {/* If payment went through gateway, show recovery options */}
                {donationId && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <p className="text-amber-800 text-sm font-semibold text-center">
                      هل تم خصم المبلغ من حسابك؟
                    </p>
                    <p className="text-amber-700 text-xs leading-relaxed text-center">
                      يرجى التواصل معنا مع الرقم المرجعي أدناه وسنتأكد من تبرعك فوراً.
                    </p>
                    <div className="bg-white rounded-xl p-2.5 border border-amber-100 text-center">
                      <p className="text-xs text-gray-500 mb-0.5">الرقم المرجعي</p>
                      <p className="font-mono text-xs text-gray-700 break-all">{donationId}</p>
                    </div>
                    <a
                      href="https://wa.me/966505793012"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors text-sm mt-1"
                      data-testid="button-whatsapp-failed"
                    >
                      <Phone className="w-4 h-4" />
                      تواصل معنا عبر واتساب
                    </a>
                  </div>
                )}

                <div className="space-y-2.5">
                  <Link href="/donate">
                    <Button className="w-full h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-700" data-testid="button-retry-donate">
                      <RotateCcw className="w-4 h-4 ml-2" />
                      حاول مرة أخرى
                    </Button>
                  </Link>
                  <Link href="/bank-accounts">
                    <Button variant="outline" className="w-full h-11 text-sm" data-testid="button-bank-transfer">
                      <Building2 className="w-4 h-4 ml-2" />
                      التحويل البنكي بديلاً
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" className="w-full h-10 text-muted-foreground text-sm" data-testid="button-home-failed">
                      <Home className="w-4 h-4 ml-2" />
                      الصفحة الرئيسية
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>
                  {donationId
                    ? "تواصل معنا إذا تم خصم أي مبلغ من حسابك"
                    : "لم يتم خصم أي مبلغ من حسابك"}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
