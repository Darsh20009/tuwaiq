import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDonations } from "@/hooks/use-donations";
import { useAuth } from "@/hooks/use-auth";
import { useSearch } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Heart, Loader2, CreditCard, Landmark, ShieldCheck,
  Globe2, Home, Baby, HandHeart, RefreshCw, Zap, Plus, Minus,
  Upload, CheckCircle, X, Copy, Building2, Send, RotateCcw, Lock, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const CAMPAIGN_AMOUNTS: Record<string, number[]> = {
  "":       [15, 50, 100, 200, 500, 1000],
  general:  [15, 50, 100, 200, 500, 1000],
  hajj:     [100, 250, 500, 1250, 5000, 12000],
  families: [15, 50, 100, 200, 500],
  orphan:   [100, 200, 350, 500, 1000],
  relief:   [15, 50, 100, 200, 500],
};

const HAJJ_LABELS: Record<number, string> = {
  100: "مساهمة رمزية", 250: "مساهمة", 500: "مساهمة كبيرة",
  1250: "باقة متوسطة", 5000: "باقة كبيرة", 12000: "كفالة حاج كامل",
};

const CAMPAIGN_OPTIONS = [
  { id: "",        label: "تبرع عام",           icon: Heart,     color: "#059669" },
  { id: "hajj",    label: "كفالة حاج",           icon: Globe2,    color: "#059669" },
  { id: "families",label: "كفالة أسر أرامل",    icon: Home,      color: "#0ea5e9" },
  { id: "orphan",  label: "كفالة يتيم",           icon: Baby,      color: "#f59e0b" },
  { id: "relief",  label: "تفريج كربة",           icon: HandHeart, color: "#8b5cf6" },
];

const BANK_ACCOUNTS: Record<string, { name: string; iban: string }> = {
  hajj:    { name: "مصرف الراجحي",              iban: "SA3080 0005896080195679 23" },
  families:{ name: "البنك العربي الوطني (ANB)", iban: "SA6930 4001080958103900018" },
  orphan:  { name: "بنك البلاد",                iban: "SA2315 0009991461280000007" },
  relief:  { name: "مصرف الراجحي",              iban: "SA3080 0005896080195679 23" },
  general: { name: "مصرف الراجحي",              iban: "SA3080 0005896080195679 23" },
};

const schema = z.object({
  donorName: z.string().min(2, "يرجى إدخال اسمك للشهادة"),
  donorEmail: z.string().email("يرجى إدخال بريد إلكتروني صحيح").optional().or(z.literal("")),
  donorPhone: z.string().optional().or(z.literal("")),
  amount: z.coerce.number()
    .min(1, "الحد الأدنى ريال واحد")
    .max(1000000, "الحد الأقصى مليون ريال"),
  campaignId: z.string().optional().default(""),
});

type FormValues = z.infer<typeof schema>;
type DonationType = "once" | "daily" | "monthly";

export function DonationCard() {
  const { donate, isDonating } = useDonations();
  const { user } = useAuth();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const { toast } = useToast();

  const initialCampaign = params.get("campaignId") || "";
  const campaignAmounts = CAMPAIGN_AMOUNTS[initialCampaign] || CAMPAIGN_AMOUNTS[""];
  const initialAmount = parseInt(params.get("amount") || "") || campaignAmounts[0] || 15;

  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount);
  const [selectedCampaign, setSelectedCampaign] = useState<string>(initialCampaign);
  const [payMethod, setPayMethod] = useState<"rajhi" | "transfer">("rajhi");
  const [donationType, setDonationType] = useState<DonationType>("once");
  const [duration, setDuration] = useState<number>(3);
  const [isSubmittingRecurring, setIsSubmittingRecurring] = useState(false);

  // ─── Inline bank transfer state ───────────────────────────
  const [btPanel, setBtPanel] = useState<"hidden" | "upload" | "success">("hidden");
  const [btReceiptFile, setBtReceiptFile] = useState<File | null>(null);
  const [btReceiptPreview, setBtReceiptPreview] = useState<string | null>(null);
  const [btIsUploading, setBtIsUploading] = useState(false);
  const [btTransferId, setBtTransferId] = useState<string | null>(null);
  const [btEmail, setBtEmail] = useState("");
  const [btEmailSent, setBtEmailSent] = useState(false);
  const [btIsSendingEmail, setBtIsSendingEmail] = useState(false);
  const btFileRef = useRef<HTMLInputElement>(null);

  // ─── Phone collection dialog (for Google users without mobile) ──
  const queryClient = useQueryClient();
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [phoneDialogInput, setPhoneDialogInput] = useState("");
  const [phoneDialogError, setPhoneDialogError] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<any>(null);

  const handleBtFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBtReceiptFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setBtReceiptPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleBtSubmitTransfer = async () => {
    if (!btReceiptFile) {
      toast({ title: "خطأ", description: "يرجى رفع صورة إيصال التحويل", variant: "destructive" });
      return;
    }
    setBtIsUploading(true);
    try {
      const formData = new FormData();
      const vals = form.getValues();
      const bankKey = campaignToType[vals.campaignId || ""] || "general";
      const bankInfo = BANK_ACCOUNTS[bankKey] || BANK_ACCOUNTS.general;
      formData.append("amount", String(vals.amount));
      formData.append("type", bankKey);
      formData.append("donorName", vals.donorName || "فاعل خير");
      formData.append("donorPhone", vals.donorPhone || "");
      formData.append("donorEmail", vals.donorEmail || "");
      formData.append("bankName", bankInfo.name);
      formData.append("transferDate", new Date().toISOString());
      formData.append("file", btReceiptFile);
      const res = await fetch("/api/bank-transfers", { method: "POST", body: formData, credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setBtTransferId(String(data.id));
        if (vals.donorEmail) setBtEmail(vals.donorEmail);
        setBtPanel("success");
      } else {
        toast({ title: "خطأ", description: data.message || "فشل إرسال الطلب", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ", description: "تعذر الاتصال بالخادم", variant: "destructive" });
    } finally {
      setBtIsUploading(false);
    }
  };

  const handleBtSendEmail = async () => {
    if (!btEmail || !btEmail.includes("@")) {
      toast({ title: "خطأ", description: "يرجى إدخال بريد إلكتروني صحيح", variant: "destructive" });
      return;
    }
    if (!btTransferId) return;
    setBtIsSendingEmail(true);
    try {
      const vals = form.getValues();
      const res = await fetch(`/api/bank-transfers/${btTransferId}/send-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: btEmail, donorName: vals.donorName }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setBtEmailSent(true);
        toast({ title: "✅ تم إرسال الإيصال", description: `وصل إلى ${btEmail}` });
      } else {
        toast({ title: "خطأ", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ", description: "تعذر إرسال البريد", variant: "destructive" });
    } finally {
      setBtIsSendingEmail(false);
    }
  };

  const resetBtPanel = () => {
    setBtPanel("hidden");
    setBtReceiptFile(null);
    setBtReceiptPreview(null);
    setBtTransferId(null);
    setBtEmail("");
    setBtEmailSent(false);
  };

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const r = await fetch("/api/settings");
      return r.ok ? r.json() : {};
    },
  });

  const { data: hajjStats } = useQuery<any>({
    queryKey: ["/api/donations/hajj-stats"],
    queryFn: async () => {
      const r = await fetch("/api/donations/hajj-stats");
      return r.ok ? r.json() : null;
    },
    enabled: selectedCampaign === "hajj",
    staleTime: 60_000,
  });

  const enableTransfer = settings ? settings.enableBankTransfer !== false : true;
  const enableRajhiPayment = settings ? settings.enableRajhiPayment === true : false;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      donorName: user?.name || "",
      donorEmail: user?.email || "",
      donorPhone: user?.mobile || "",
      amount: initialAmount,
      campaignId: initialCampaign,
    },
  });

  useEffect(() => {
    if (!user) return;
    if (user.name) form.setValue("donorName", user.name, { shouldDirty: false });
    if (user.email) form.setValue("donorEmail", user.email, { shouldDirty: false });
    if (user.mobile) form.setValue("donorPhone", user.mobile, { shouldDirty: false });
  }, [user?.name, user?.email, user?.mobile]);

  useEffect(() => { form.setValue("amount", selectedAmount as any); }, [selectedAmount]);
  useEffect(() => {
    form.setValue("campaignId", selectedCampaign);
    // Auto-pick the first valid amount when switching campaigns
    const amounts = CAMPAIGN_AMOUNTS[selectedCampaign] || CAMPAIGN_AMOUNTS[""];
    if (!amounts.includes(selectedAmount)) {
      setSelectedAmount(amounts[0]);
    }
  }, [selectedCampaign]);

  const campaignToType: Record<string, string> = {
    hajj: "hajj",
    families: "families",
    orphan: "orphan",
    relief: "relief",
    "": "general",
  };

  // ─── Save phone for Google users ────────────────────────
  const handleSavePhone = async () => {
    setPhoneDialogError("");
    const raw = phoneDialogInput.trim();
    if (!raw) { setPhoneDialogError("يرجى إدخال رقم الجوال"); return; }
    setIsSavingPhone(true);
    try {
      const res = await fetch("/api/user/update-mobile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mobile: raw }),
      });
      const json = await res.json();
      if (!res.ok) { setPhoneDialogError(json.message || "فشل حفظ الجوال"); return; }
      // Update cached user
      queryClient.setQueryData(["/api/auth/me"], json);
      // Fill phone field in form
      const clean = json.mobile || raw;
      form.setValue("donorPhone", clean, { shouldDirty: false });
      setShowPhoneDialog(false);
      // Re-run submit with pending data
      if (pendingSubmitData) {
        const dataWithPhone = { ...pendingSubmitData, donorPhone: clean };
        setPendingSubmitData(null);
        onSubmit(dataWithPhone);
      }
    } catch {
      setPhoneDialogError("تعذر الاتصال بالخادم");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    // If user is logged in but has no mobile, collect it first
    if (user && !user.mobile && !data.donorPhone) {
      setPendingSubmitData(data);
      setPhoneDialogInput("");
      setPhoneDialogError("");
      setShowPhoneDialog(true);
      return;
    }
    try {
      if (payMethod === "transfer") {
        setBtPanel("upload");
        return;
      }

      if (!enableRajhiPayment) return;

      if (donationType !== "once") {
        // Recurring donation: register in system then initiate first payment
        setIsSubmittingRecurring(true);
        try {
          const resp = await fetch("/api/recurring", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              amount: data.amount,
              type: campaignToType[data.campaignId || ""] || "general",
              campaignId: data.campaignId || undefined,
              frequency: donationType,
              duration,
              paymentMethod: "rajhi",
              donorName: data.donorName,
              donorEmail: data.donorEmail || "",
              donorPhone: data.donorPhone || "",
            }),
          });

          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.message || "فشل تسجيل التبرع المتكرر");
          }
        } finally {
          setIsSubmittingRecurring(false);
        }
      }

      // Always proceed with first payment via Al Rajhi
      // Note: campaignId must be a valid MongoDB ObjectId — slugs like "hajj" are NOT valid.
      // Only pass campaignId if it looks like a real ObjectId (24 hex chars).
      const isValidObjectId = /^[a-f\d]{24}$/i.test(data.campaignId || "");
      await (donate as any)({
        amount: data.amount,
        campaignId: isValidObjectId ? data.campaignId : undefined,
        donorName: data.donorName,
        donorEmail: data.donorEmail || user?.email || "",
        donorPhone: data.donorPhone || user?.mobile || "",
        type: campaignToType[data.campaignId || ""] || "general",
        gateway: "rajhi",
        recurring: donationType !== "once" ? donationType : undefined,
      });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "حدث خطأ، يرجى المحاولة لاحقاً", variant: "destructive" });
    }
  };

  const DONATION_TYPES: { id: DonationType; label: string; icon: any; desc: string }[] = [
    { id: "once", label: "مرة واحدة", icon: Zap, desc: "تبرع فوري" },
    { id: "monthly", label: "شهري", icon: RefreshCw, desc: "كل شهر" },
    { id: "daily", label: "يومي", icon: RefreshCw, desc: "كل يوم" },
  ];

  const maxDuration = donationType === "daily" ? 365 : 24;
  const durationLabel = donationType === "daily" ? "يوم" : "شهر";
  const totalAmount = donationType !== "once" ? (form.watch("amount") || 0) * duration : 0;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: "1px solid hsl(35 15% 86%)", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
      dir="rtl"
    >
      {/* Header */}
      <div className="p-5 pb-4" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%) 0%, hsl(152 42% 36%) 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-black font-heading text-lg leading-none">تبرع الآن</h3>
            <p className="text-white/70 text-xs mt-0.5">مساهمتك تصنع الأثر</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-5 space-y-5">

          {/* Donation frequency */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: "hsl(215 15% 42%)" }}>نوع التبرع</p>
            <div className="grid grid-cols-3 gap-1.5">
              {DONATION_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setDonationType(t.id); setDuration(t.id === "daily" ? 7 : 3); }}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all",
                    donationType === t.id
                      ? "border-[hsl(152_42%_28%)] bg-[hsl(152_42%_95%)] text-[hsl(152_42%_22%)]"
                      : "border-[hsl(35_15%_88%)] bg-white hover:border-[hsl(152_42%_50%)] text-[hsl(215_15%_42%)]"
                  )}
                  data-testid={`donation-type-${t.id}`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Duration selector */}
            {donationType !== "once" && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-bold" style={{ color: "hsl(215 15% 42%)" }}>
                  عدد {durationLabel === "يوم" ? "الأيام" : "الأشهر"}
                </p>
                <div className="flex items-center gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setDuration(Math.max(1, duration - 1))}
                    className="w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all hover:border-[hsl(152_42%_28%)]"
                    style={{ borderColor: "hsl(35 15% 88%)" }}
                    data-testid="duration-decrease"
                  >
                    <Minus className="w-4 h-4" style={{ color: "hsl(152 42% 28%)" }} />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-black" style={{ color: "hsl(152 42% 28%)" }}>{duration}</span>
                    <span className="text-sm font-bold mr-1.5" style={{ color: "hsl(215 15% 52%)" }}>{durationLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDuration(Math.min(maxDuration, duration + 1))}
                    className="w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all hover:border-[hsl(152_42%_28%)]"
                    style={{ borderColor: "hsl(35 15% 88%)" }}
                    data-testid="duration-increase"
                  >
                    <Plus className="w-4 h-4" style={{ color: "hsl(152 42% 28%)" }} />
                  </button>
                </div>

                {/* Quick durations */}
                <div className="flex gap-1.5 justify-center">
                  {(donationType === "daily" ? [7, 14, 30, 90] : [3, 6, 12]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all",
                        duration === d
                          ? "border-[hsl(152_42%_28%)] bg-[hsl(152_42%_95%)] text-[hsl(152_42%_22%)]"
                          : "border-[hsl(35_15%_88%)] text-[hsl(215_15%_48%)]"
                      )}
                      data-testid={`duration-preset-${d}`}
                    >
                      {d} {durationLabel}
                    </button>
                  ))}
                </div>

                <div className="px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "hsl(38 85% 95%)", color: "hsl(38 85% 30%)" }}>
                  📧 سيصلك رابط دفع الراجحي تلقائياً على بريدك في كل موعد — الإجمالي: <strong>{totalAmount.toLocaleString("ar-SA")} ر.س</strong>
                </div>
              </div>
            )}
          </div>

          {/* Campaign selection */}
          <div>
            <p className="text-xs font-bold mb-3" style={{ color: "hsl(215 15% 42%)" }}>اختر وجهة التبرع</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAMPAIGN_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCampaign(c.id)}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border-2 text-sm font-bold text-right transition-all",
                    selectedCampaign === c.id
                      ? "border-[hsl(152_42%_28%)] bg-[hsl(152_42%_95%)]"
                      : "border-[hsl(35_15%_88%)] bg-white hover:border-[hsl(152_42%_50%)]"
                  )}
                  data-testid={`campaign-${c.id || "general"}`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${c.color}18` }}
                  >
                    <c.icon className="w-3.5 h-3.5" style={{ color: c.color }} />
                  </div>
                  <span className="text-xs leading-tight" style={{ color: "hsl(210 22% 14%)" }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold" style={{ color: "hsl(215 15% 42%)" }}>
                  المبلغ (ريال سعودي){donationType !== "once" ? ` — ${donationType === "monthly" ? "شهرياً" : "يومياً"}` : ""}
                </FormLabel>
                {/* Hajj Progress Bar */}
                {selectedCampaign === "hajj" && hajjStats && (
                  <div className="rounded-xl px-4 py-3 border mb-3" style={{ background: "hsl(152 40% 97%)", borderColor: "hsl(152 40% 82%)" }}>
                    <div className="flex items-center justify-between mb-2 text-xs font-bold" style={{ color: "hsl(152 42% 28%)" }}>
                      <span>🕋 تقدم كفالة الحجاج</span>
                      <span style={{ color: "hsl(35 80% 45%)" }}>
                        {hajjStats.completedPilgrims} حاج مكتمل
                        {hajjStats.completedPilgrims > 0 && " ✅"}
                      </span>
                    </div>
                    <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "hsl(152 40% 88%)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(2, hajjStats.currentProgressPercent)}%`,
                          background: "linear-gradient(90deg, hsl(152 52% 38%) 0%, hsl(175 52% 34%) 100%)",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-[11px]" style={{ color: "hsl(152 30% 45%)" }}>
                      <span>{hajjStats.currentProgress.toLocaleString("ar-SA")} ر.س نحو الحاج القادم</span>
                      <span className="font-bold">{hajjStats.currentProgressPercent}% من 12,000 ر.س</span>
                    </div>
                  </div>
                )}

                {(() => {
                  const amts = CAMPAIGN_AMOUNTS[selectedCampaign] || CAMPAIGN_AMOUNTS[""];
                  return (
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      {amts.map((a) => {
                        const active = selectedAmount === a && (field.value as any) == a;
                        const isFullHajj = selectedCampaign === "hajj" && a === 12000;
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => { setSelectedAmount(a); field.onChange(a); }}
                            className={cn(
                              "py-2 text-xs font-bold rounded-lg border-2 transition-all flex flex-col items-center leading-tight",
                              active
                                ? "text-white"
                                : isFullHajj
                                  ? "border-[hsl(35_80%_45%)] text-white"
                                  : "border-[hsl(35_15%_88%)] hover:border-[hsl(152_42%_50%)]"
                            )}
                            style={{
                              backgroundColor: active
                                ? isFullHajj ? "hsl(35 80% 45%)" : "hsl(152 42% 28%)"
                                : isFullHajj ? "hsl(35 80% 45%)" : "white",
                              borderColor: active
                                ? isFullHajj ? "hsl(35 80% 45%)" : "hsl(152 42% 28%)"
                                : isFullHajj ? "hsl(35 80% 45%)" : undefined,
                              color: active || isFullHajj ? "white" : "hsl(152 42% 28%)",
                            }}
                            data-testid={`amount-${a}`}
                          >
                            <span>{a.toLocaleString("ar-SA")}</span>
                            {selectedCampaign === "hajj" && HAJJ_LABELS[a] && (
                              <span className="text-[9px] opacity-80">{HAJJ_LABELS[a]}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {selectedCampaign !== "hajj" && (
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="1"
                        min="1"
                        max="1000000"
                        className="h-12 text-xl font-bold text-center pr-4 border-2 focus:border-[hsl(152_42%_28%)] rounded-xl"
                        placeholder="أو أدخل مبلغاً آخر"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setSelectedAmount(parseFloat(e.target.value) || 0);
                        }}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: "hsl(215 15% 52%)" }}>ر.س</span>
                    </div>
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Donor Name */}
          <FormField
            control={form.control}
            name="donorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold" style={{ color: "hsl(215 15% 42%)" }}>الاسم للشهادة</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل اسمك الكريم"
                    className="h-11 border-2 rounded-xl focus:border-[hsl(152_42%_28%)]"
                    {...field}
                    data-testid="input-donor-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email — always shown when logged in, or in recurring mode */}
          {(donationType !== "once" || !!user) && (
            <FormField
              control={form.control}
              name="donorEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold" style={{ color: "hsl(215 15% 42%)" }}>
                    البريد الإلكتروني{donationType !== "once" && <span style={{ color: "hsl(152 42% 28%)" }}> *</span>}
                    {donationType !== "once" && " (لإرسال روابط الدفع)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      className="h-11 border-2 rounded-xl focus:border-[hsl(152_42%_28%)]"
                      {...field}
                      data-testid="input-donor-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Phone — always shown when logged in, or in recurring mode */}
          {(donationType !== "once" || !!user) && (
            <FormField
              control={form.control}
              name="donorPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold" style={{ color: "hsl(215 15% 42%)" }}>
                    رقم الجوال (اختياري)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="05xxxxxxxx"
                      className="h-11 border-2 rounded-xl focus:border-[hsl(152_42%_28%)]"
                      {...field}
                      data-testid="input-donor-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Payment Method Toggle */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: "hsl(215 15% 42%)" }}>طريقة الدفع</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => enableRajhiPayment && setPayMethod("rajhi")}
                disabled={!enableRajhiPayment}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all",
                  !enableRajhiPayment
                    ? "border-[hsl(35_15%_88%)] text-[hsl(215_15%_65%)] opacity-50 cursor-not-allowed"
                    : payMethod === "rajhi"
                    ? "border-[hsl(152_42%_28%)] bg-[hsl(152_42%_95%)] text-[hsl(152_42%_22%)]"
                    : "border-[hsl(35_15%_88%)] text-[hsl(215_15%_48%)] hover:border-[hsl(152_42%_50%)]"
                )}
                data-testid="method-rajhi"
              >
                <CreditCard className="w-4 h-4" />
                بطاقة — الراجحي
              </button>
              {enableTransfer && (
                <button
                  type="button"
                  onClick={() => setPayMethod("transfer")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all",
                    payMethod === "transfer"
                      ? "border-[hsl(152_42%_28%)] bg-[hsl(152_42%_95%)] text-[hsl(152_42%_22%)]"
                      : "border-[hsl(35_15%_88%)] text-[hsl(215_15%_48%)] hover:border-[hsl(152_42%_50%)]"
                  )}
                  data-testid="method-transfer"
                >
                  <Landmark className="w-4 h-4" />
                  تحويل بنكي
                </button>
              )}
            </div>

            {payMethod === "rajhi" && (
              <div
                className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ backgroundColor: "hsl(152 42% 95%)", color: "hsl(152 42% 30%)" }}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>ستُحوَّل لبوابة مصرف الراجحي الآمنة لإتمام الدفع</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isDonating || isSubmittingRecurring || (payMethod === "rajhi" && !enableRajhiPayment)}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-black font-heading text-lg text-white transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
            style={{ backgroundColor: payMethod === "rajhi" ? "hsl(28 44% 59%)" : "hsl(152 42% 28%)" }}
            data-testid="button-donate-submit"
          >
            {(isDonating || isSubmittingRecurring) ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : payMethod === "rajhi" ? (
              <>
                <CreditCard className="w-5 h-5" />
                {donationType === "monthly"
                  ? `سجّل تبرعي الشهري (${duration} شهر)`
                  : donationType === "daily"
                  ? `سجّل تبرعي اليومي (${duration} يوم)`
                  : "تبرع وادفع الآن"}
              </>
            ) : (
              <>
                <Landmark className="w-5 h-5" />
                عرض بيانات التحويل البنكي
              </>
            )}
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 text-[11px]" style={{ color: "hsl(215 15% 60%)" }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            دفع آمن مشفر بالكامل — جمعية طويق رقم السجل 1000820300
          </div>
        </form>
      </Form>

      {/* ─── Inline Bank Transfer Panel ─────────────────────────── */}
      {btPanel !== "hidden" && (() => {
        const vals = form.getValues();
        const bankKey = campaignToType[vals.campaignId || ""] || "general";
        const bankInfo = BANK_ACCOUNTS[bankKey] || BANK_ACCOUNTS.general;
        const campaignLabel = CAMPAIGN_OPTIONS.find(c => c.id === vals.campaignId)?.label || "التبرع";
        return (
          <div className="border-t" style={{ borderColor: "hsl(35 15% 88%)" }}>
            {btPanel === "upload" && (
              <div className="p-5 space-y-4" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(152 42% 12%)" }}>
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "hsl(210 22% 14%)" }}>التحويل البنكي</p>
                      <p className="text-xs" style={{ color: "hsl(215 15% 52%)" }}>{vals.amount?.toLocaleString("ar-SA")} ر.س — {campaignLabel}</p>
                    </div>
                  </div>
                  <button onClick={resetBtPanel} className="p-1.5 rounded-lg hover:bg-gray-100" data-testid="bt-close">
                    <X className="w-4 h-4" style={{ color: "hsl(215 15% 52%)" }} />
                  </button>
                </div>

                {/* Bank info box */}
                <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "hsl(152 42% 95%)", border: "1px solid hsl(152 42% 80%)" }}>
                  <p className="text-xs font-bold" style={{ color: "hsl(152 42% 30%)" }}>حوّل المبلغ إلى الحساب التالي:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: "hsl(215 15% 52%)" }}>البنك</span>
                      <span className="text-sm font-bold" style={{ color: "hsl(210 22% 14%)" }}>{bankInfo.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: "hsl(215 15% 52%)" }}>اسم المستفيد</span>
                      <span className="text-sm font-bold" style={{ color: "hsl(210 22% 14%)" }}>جمعية طويق للخدمات الإنسانية</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs" style={{ color: "hsl(215 15% 52%)" }}>رقم الآيبان</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold tracking-wider" style={{ color: "hsl(152 42% 22%)" }} dir="ltr">{bankInfo.iban}</span>
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(bankInfo.iban.replace(/\s/g, "")); toast({ title: "✅ تم النسخ" }); }}
                          className="p-1 rounded hover:bg-white/60 transition-colors"
                          data-testid="bt-copy-iban"
                        >
                          <Copy className="w-3.5 h-3.5" style={{ color: "hsl(152 42% 35%)" }} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: "hsl(215 15% 52%)" }}>المبلغ</span>
                      <span className="text-sm font-black" style={{ color: "hsl(152 42% 28%)" }}>{vals.amount?.toLocaleString("ar-SA")} ر.س</span>
                    </div>
                  </div>
                </div>

                {/* Receipt upload */}
                <div className="space-y-2">
                  <p className="text-xs font-bold" style={{ color: "hsl(215 15% 42%)" }}>ارفع إيصال التحويل</p>
                  <input ref={btFileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleBtFileChange} data-testid="bt-file-input" />
                  {btReceiptPreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2" style={{ borderColor: "hsl(152 42% 60%)" }}>
                      {btReceiptFile?.type === "application/pdf" ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2" style={{ backgroundColor: "hsl(152 42% 95%)" }}>
                          <Landmark className="w-8 h-8" style={{ color: "hsl(152 42% 35%)" }} />
                          <p className="text-xs font-bold" style={{ color: "hsl(152 42% 28%)" }}>{btReceiptFile.name}</p>
                        </div>
                      ) : (
                        <img src={btReceiptPreview} alt="إيصال" className="w-full max-h-40 object-contain" style={{ backgroundColor: "hsl(35 15% 95%)" }} />
                      )}
                      <button
                        type="button"
                        onClick={() => { setBtReceiptFile(null); setBtReceiptPreview(null); if (btFileRef.current) btFileRef.current.value = ""; }}
                        className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        data-testid="bt-remove-file"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => btFileRef.current?.click()}
                      className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed transition-all hover:border-[hsl(152_42%_50%)]"
                      style={{ borderColor: "hsl(35 15% 82%)", backgroundColor: "hsl(35 15% 97%)" }}
                      data-testid="bt-upload-btn"
                    >
                      <Upload className="w-6 h-6" style={{ color: "hsl(152 42% 40%)" }} />
                      <span className="text-xs font-bold" style={{ color: "hsl(215 15% 48%)" }}>اضغط لرفع الإيصال</span>
                      <span className="text-[10px]" style={{ color: "hsl(215 15% 62%)" }}>PNG، JPG، PDF</span>
                    </button>
                  )}
                </div>

                {/* Confirm button */}
                <button
                  type="button"
                  onClick={handleBtSubmitTransfer}
                  disabled={!btReceiptFile || btIsUploading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white text-base transition-all disabled:opacity-50"
                  style={{ backgroundColor: "hsl(152 42% 28%)" }}
                  data-testid="bt-confirm-btn"
                >
                  {btIsUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {btIsUploading ? "جارٍ الإرسال…" : "تأكيد التحويل"}
                </button>
              </div>
            )}

            {btPanel === "success" && (
              <div className="p-5 space-y-4" dir="rtl">
                {/* Success header */}
                <div className="flex flex-col items-center gap-2 py-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(152 42% 93%)" }}>
                    <CheckCircle className="w-8 h-8" style={{ color: "hsl(152 42% 35%)" }} />
                  </div>
                  <p className="font-black text-lg text-center" style={{ color: "hsl(152 42% 22%)" }}>تم استلام طلبك!</p>
                  <p className="text-xs text-center leading-relaxed" style={{ color: "hsl(215 15% 48%)" }}>
                    سيتم مراجعة التحويل وتأكيده خلال 24 ساعة — جزاك الله خيرًا
                  </p>
                </div>

                {/* Email receipt */}
                <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "hsl(38 85% 97%)", border: "1px solid hsl(38 85% 85%)" }}>
                  <p className="text-xs font-bold" style={{ color: "hsl(38 85% 28%)" }}>أرسل الإيصال على بريدك الإلكتروني (اختياري)</p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={btEmail}
                      onChange={(e) => setBtEmail(e.target.value)}
                      disabled={btEmailSent}
                      className="h-10 border-2 rounded-xl text-sm flex-1 focus:border-[hsl(152_42%_28%)]"
                      dir="ltr"
                      data-testid="bt-email-input"
                    />
                    <button
                      type="button"
                      onClick={handleBtSendEmail}
                      disabled={btIsSendingEmail || btEmailSent || !btEmail}
                      className="h-10 px-4 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                      style={{ backgroundColor: btEmailSent ? "hsl(152 42% 45%)" : "hsl(152 42% 28%)" }}
                      data-testid="bt-send-email-btn"
                    >
                      {btIsSendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : btEmailSent ? <CheckCircle className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                      {btEmailSent ? "أُرسل" : "إرسال"}
                    </button>
                  </div>
                  {btEmailSent && (
                    <p className="text-xs" style={{ color: "hsl(152 42% 35%)" }}>✅ تم إرسال الإيصال إلى {btEmail}</p>
                  )}
                </div>

                {/* New donation button */}
                <button
                  type="button"
                  onClick={resetBtPanel}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all hover:border-[hsl(152_42%_50%)]"
                  style={{ borderColor: "hsl(35 15% 82%)", color: "hsl(152 42% 28%)" }}
                  data-testid="bt-new-donation-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  تبرع مرة أخرى
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Phone collection dialog for Google users ── */}
      <Dialog open={showPhoneDialog} onOpenChange={(open) => { if (!open) { setShowPhoneDialog(false); setPendingSubmitData(null); } }}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-lg font-black" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
                أضف رقم جوالك
              </DialogTitle>
            </div>
            <DialogDescription style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
              رقم الجوال مطلوب لإتمام عملية التبرع وإرسال إيصال الاستلام، وسيُحفظ في حسابك للمرات القادمة.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-3 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground shrink-0">
                +966
              </div>
              <Input
                type="tel"
                placeholder="5XXXXXXXX"
                value={phoneDialogInput}
                onChange={(e) => { setPhoneDialogInput(e.target.value); setPhoneDialogError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSavePhone()}
                className="text-left ltr flex-1"
                dir="ltr"
                data-testid="input-phone-dialog"
                autoFocus
              />
            </div>
            {phoneDialogError && (
              <p className="text-sm text-destructive font-medium">{phoneDialogError}</p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSavePhone}
              disabled={isSavingPhone}
              className="flex-1 font-bold"
              data-testid="btn-save-phone"
            >
              {isSavingPhone ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              حفظ ومتابعة التبرع
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowPhoneDialog(false); setPendingSubmitData(null); }}
              disabled={isSavingPhone}
              data-testid="btn-cancel-phone"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
