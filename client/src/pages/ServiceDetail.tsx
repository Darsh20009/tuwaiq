import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2, Home, Baby, HandHeart, ArrowLeft, Users, Target,
  CheckCircle2, X, Download, Copy, Heart,
  Quote, Building2, CreditCard, ExternalLink, Sparkles,
  ChevronRight, Upload, Send, RotateCcw, CheckCircle, Loader2,
  Banknote, Lock,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";

const SERVICES_DETAILS: Record<string, any> = {
  hajj: {
    title: "كفالة حاج",
    titlePromo: "تبرع لكفالة حاج",
    icon: Globe2,
    color: "bg-emerald-500",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-green-400",
    bgGradient: "from-emerald-600 to-green-500",
    poster: "/posters/poster-hajj.png",
    hadith: "الحج المبرور ليس له جزاء إلا الجنة — رواه البخاري",
    hadithPromo: "صَدَقَتُكَ بِوَابَتُهُم لِبَيْتِ الله\nتَخَيَّل فَرحة حاج بَكفَلك\nسابق إلى الخير في بقاع الأرض",
    seoDescription: "اكفل حاجاً مسلماً ليؤدي فريضته ويدعو لك — جمعية طويق للخدمات الإنسانية",
    bank: {
      name: "مصرف الراجحي",
      iban: "SA3080 00058960801956792 3",
      display: "SA3080\n00058960801956793",
      logo: "🏦",
    },
    description: `الحج ركن من أركان الإسلام، وكثير من المسلمين يعجزون عن أدائه لضيق ذات اليد.\nمن خلال برنامج كفالة حاج، نمنح هذه الفرصة لمن عجز عن توفير تكاليف الحج بمفرده.\n\nيشمل البرنامج:\n• تسجيل الحاج وتأمين الإجراءات الرسمية\n• تغطية تكاليف الانتقال والإقامة\n• التنسيق مع البعثات الرسمية\n• متابعة الحاج طوال رحلته المباركة`,
    amounts: [100, 250, 500, 1250, 5000, 12000],
    stats: { beneficiaries: 320, projects: 18, targetAmount: 500000, currentAmount: 215000 },
    impacts: [
      { amount: 100, description: "مساهمة رمزية في كفالة حاج" },
      { amount: 250, description: "مساهمة في رحلة الحاج" },
      { amount: 500, description: "إسهام في كفالة حاج" },
      { amount: 1250, description: "إسهام في تكاليف رحلة الحاج" },
      { amount: 5000, description: "كفالة جزئية شاملة للحاج" },
      { amount: 12000, description: "كفالة حاج كاملة لحاج واحد" },
    ],
  },
  families: {
    title: "كفالة أسر أرامل ومطلقات",
    titlePromo: "كفالة أسر أرامل ومطلقات",
    icon: Home,
    color: "bg-sky-500",
    gradientFrom: "from-sky-500",
    gradientTo: "to-blue-400",
    bgGradient: "from-sky-600 to-blue-500",
    poster: "/posters/poster-families.png",
    hadith: "الساعي على الأرملة والمسكين كالمجاهد في سبيل الله — رواه مسلم",
    hadithPromo: "أدخل السرور على قلوبهم\nبتبرع بسيط",
    seoDescription: "أعن أسرة أرملة أو مطلقة لتعيش بكرامة — جمعية طويق للخدمات الإنسانية",
    bank: {
      name: "البنك العربي الوطني (ANB)",
      iban: "SA6930 4001080958103900018",
      display: "SA6930\n4001080958103900018",
      logo: "🏦",
    },
    description: `الأرملة والمطلقة تحمل عبء رعاية أسرتها وحدها، وكثيراً ما تعجز عن توفير الاحتياجات الأساسية.\nبرنامج كفالة الأسر يضمن دعماً منتظماً ومستمراً للأسر المحتاجة.\n\nيشمل البرنامج:\n• دعم مالي شهري منتظم للأسرة\n• تأمين الاحتياجات الأساسية من غذاء وكساء\n• دعم الأبناء في مسيرتهم التعليمية\n• متابعة الحالة الأسرية وتقديم الرعاية المستمرة`,
    amounts: [15, 100, 550, 1250],
    stats: { beneficiaries: 850, projects: 64, targetAmount: 800000, currentAmount: 420000 },
    impacts: [
      { amount: 15, description: "أقل مساهمة لدعم أسرة" },
      { amount: 100, description: "إسهام شهري لأسرة محتاجة" },
      { amount: 550, description: "كفالة ربعية جزئية" },
      { amount: 1250, description: "كفالة شاملة للأسرة" },
    ],
  },
  orphan: {
    title: "كفالة يتيم",
    titlePromo: "كفالة يتيم",
    icon: Baby,
    color: "bg-amber-500",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-400",
    bgGradient: "from-amber-500 to-orange-400",
    poster: "/posters/poster-orphan.png",
    hadith: "أنا وكافل اليتيم في الجنة كهاتين — رواه البخاري",
    hadithPromo: "صدقتك الجارية.. بوابةٌ لمستقبل مُشرق",
    seoDescription: "تكفّل بيتيم وكن قريباً من النبي ﷺ في الجنة — جمعية طويق للخدمات الإنسانية",
    bank: {
      name: "بنك البلاد",
      iban: "SA2315 0009991461280000007",
      display: "SA2315\n0009991461280000007",
      logo: "🏦",
    },
    description: `قال رسول الله ﷺ: "أنا وكافل اليتيم في الجنة كهاتين" — وأشار بإصبعيه.\nبرنامج كفالة اليتيم يوفر الرعاية الشاملة للأيتام ويضمن لهم حياة كريمة ومستقبلاً مشرقاً.\n\nيشمل البرنامج:\n• دعم مالي شهري منتظم لليتيم وأسرته\n• تأمين متطلبات التعليم والكتب والقرطاسية\n• الرعاية الصحية والنفسية\n• برامج تنمية المهارات والتطوير الشخصي`,
    amounts: [100, 350, 550, 1250],
    stats: { beneficiaries: 1200, projects: 95, targetAmount: 600000, currentAmount: 380000 },
    impacts: [
      { amount: 100, description: "أقل مساهمة في كفالة يتيم" },
      { amount: 350, description: "كفالة يتيم لشهر كامل" },
      { amount: 550, description: "كفالة يتيم شاملة لشهر" },
      { amount: 1250, description: "كفالة يتيم لربع سنة" },
    ],
  },
  relief: {
    title: "تفريج كربة",
    titlePromo: "تفريج كربة",
    icon: HandHeart,
    color: "bg-violet-500",
    gradientFrom: "from-violet-500",
    gradientTo: "to-purple-400",
    bgGradient: "from-violet-600 to-purple-500",
    poster: "/posters/poster-relief.png",
    hadith: "من نفّس عن مؤمن كربة من كرب الدنيا نفّس الله عنه كربة من كرب يوم القيامة",
    hadithPromo: "أثرك يمتد... عطاءٌ يدوم",
    seoDescription: "فرّج كربة مسلم وينفّس الله عنك كربة يوم القيامة — جمعية طويق للخدمات الإنسانية",
    bank: {
      name: "مصرف الراجحي",
      iban: "SA3080 00058960801956793",
      display: "SA3080\n00058960801956793",
      logo: "🏦",
    },
    description: `قال رسول الله ﷺ: "من نفّس عن مؤمن كربة من كرب الدنيا، نفّس الله عنه كربة من كرب يوم القيامة"\n\nبرنامج تفريج الكربة يدعم الأسر التي تمر بضائقة مالية طارئة أو وضع صعب يحتاج تدخلاً عاجلاً.\n\nيشمل البرنامج:\n• دعم الأسر في الأزمات المالية الطارئة\n• مساعدة أصحاب الديون في تسديد ما بذمتهم\n• دعم المرضى في تكاليف العلاج\n• مساندة الأسر في الكوارث والطوارئ`,
    amounts: [15, 50, 100, 350],
    stats: { beneficiaries: 2100, projects: 140, targetAmount: 400000, currentAmount: 285000 },
    impacts: [
      { amount: 15, description: "أقل إسهام في تفريج كربة" },
      { amount: 50, description: "إسهام في تخفيف ضائقة" },
      { amount: 100, description: "دعم عاجل لأسرة محتاجة" },
      { amount: 350, description: "مشاركة جوهرية في تفريج الكرب" },
    ],
  },
};

function buildWhatsappMessage(service: any, slug: string, siteUrl: string) {
  const url = `${siteUrl}/services/${slug}`;
  const donateUrl = `${siteUrl}/donate?type=${slug}`;

  const msgs: Record<string, string> = {
    hajj: `🕋✨ *تبرع لكفالة حاج* ✨🕋

"الحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الْجَنَّةُ" 🤍

كفالة حاج تعني أنك تفتح له باب الجنة وهو يدعو لك بظهر الغيب 💚

📌 *طريقة التبرع السريع:*
🏦 مصرف الراجحي
🔢 SA3080 00058960801956793

🔗 أو عبر الموقع:
${donateUrl}

🤝 *جمعية طويق للخدمات الإنسانية*
رقم السجل: 1000820300 | ترخيص: 6573

شارك البوستر مع أهلك وأصدقاؤك وكن سبباً في خير كثير 🌿`,

    families: `👨‍👩‍👧‍👦💙 *كفالة أسر أرامل ومطلقات* 💙👨‍👩‍👧‍👦

"الساعي على الأرملة والمسكين كالمجاهد في سبيل الله" 💙

أسرة كاملة تنتظر يدك الكريمة — تبرعك صدقة جارية ونور في الحياة ✨

📌 *التبرع السريع:*
🏦 بنك البلاد
🔢 SA6930 4001080958103900018

🔗 أو عبر الموقع:
${donateUrl}

🤝 *جمعية طويق للخدمات الإنسانية*
رقم السجل: 1000820300 | ترخيص: 6573

أدفع بأمان عبر بوابتنا الإلكترونية 💳`,

    orphan: `🤲💛 *كفالة يتيم — أعلى درجات العطاء* 💛🤲

قال ﷺ: "أنا وكافل اليتيم في الجنة كهاتين 🤞" 

صدقتك الجارية.. بوابةٌ لمستقبل مُشرق 🌟
كفالة يتيم تجمعك بالنبي ﷺ في الجنة 💛

📌 *التبرع السريع:*
🏦 بنك البلاد (BANK ALBILAD)
🔢 SA2315 0009991461280000007

🔗 أو عبر الموقع:
${donateUrl}

🤝 *جمعية طويق للخدمات الإنسانية*
رقم السجل: 1000820300 | ترخيص: 6573

لأن الإنسان أثمن — معًا لكفالة ورعاية يتيم 💛`,

    relief: `🌿💜 *تفريج كربة — عطاء يدوم* 💜🌿

قال ﷺ: "من نفَّس عن مؤمن كربةً من كُرَب الدنيا، نفَّس الله عنه كربةً من كُرَب يوم القيامة" 🤍

أثرك يمتد... حين تفرج كربةً أسرة في ضائقة ✨

📌 *التبرع السريع:*
🏦 مصرف الراجحي
🔢 SA3080 00058960801956793

🔗 أو عبر الموقع:
${donateUrl}

🤝 *جمعية طويق للخدمات الإنسانية*
رقم السجل: 1000820300 | ترخيص: 6573

شارك لتعم الفائدة — لمسة عطاء منك تملأ دنياه بالابتسامة 🌱`,
  };

  return msgs[slug] || `ساهم في ${service.title} - جمعية طويق\n${url}`;
}

export default function ServiceDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const service = SERVICES_DETAILS[slug];
  const { toast } = useToast();
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [posterModal, setPosterModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  // ─── Inline Payment States ──────────────────────────────
  type PayStep = "amount" | "info" | "method" | "success";
  const [payStep, setPayStep] = useState<PayStep>("amount");
  const [payMethod, setPayMethod] = useState<"card" | "apple" | "bank">("card");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTransferId, setCreatedTransferId] = useState<string | null>(null);
  const [pdfEmail, setPdfEmail] = useState("");
  const [pdfSent, setPdfSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useSEO({
    title: service ? service.title : "خدمة",
    description: service?.seoDescription,
    image: service?.poster ? service.poster : "/images/og-banner1.png",
  });

  const { data: siteSettings } = useQuery<any>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) return {};
      return res.json();
    },
  });

  const showDonationStats = !!siteSettings?.showDonationStats;

  const { data: hajjStats } = useQuery<any>({
    queryKey: ["/api/donations/hajj-stats"],
    enabled: slug === "hajj",
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">الخدمة غير موجودة</h1>
            <Link href="/services"><Button>العودة للخدمات</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = service.icon;
  const progress = (service.stats.currentAmount / service.stats.targetAmount) * 100;
  const finalAmount = selectedAmount || (customAmount ? Number(customAmount) : 0);
  const siteUrl = window.location.origin;
  const whatsappMsg = buildWhatsappMessage(service, slug, siteUrl);

  const handleShareWhatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`, "_blank");
  };

  const handleDownloadPoster = async () => {
    try {
      const response = await fetch(service.poster);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `بوستر-${service.title}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "✅ تم تحميل البوستر", description: "يمكنك مشاركته على واتساب الآن" });
    } catch {
      toast({ title: "خطأ في التحميل", variant: "destructive" });
    }
  };

  const handleSharePosterWhatsapp = async () => {
    try {
      const response = await fetch(service.poster);
      const blob = await response.blob();
      const file = new File([blob], `poster-${slug}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: service.title,
          text: whatsappMsg,
        });
      } else {
        handleShareWhatsapp();
      }
    } catch {
      handleShareWhatsapp();
    }
  };

  const handleCopyMsg = () => {
    navigator.clipboard.writeText(whatsappMsg);
    toast({ title: "✅ تم نسخ الرسالة", description: "الصقها في واتساب الآن" });
  };

  // ─── Payment Handlers ────────────────────────────────────
  const handleProceedToInfo = () => {
    if (!finalAmount || finalAmount < 1) {
      toast({ title: "خطأ", description: "الرجاء اختيار مبلغ التبرع أولاً", variant: "destructive" });
      return;
    }
    setPayStep("info");
  };

  const handleProceedToMethod = () => {
    if (!donorName.trim()) {
      setNameError("الاسم مطلوب");
      return;
    }
    setNameError("");
    setPayStep("method");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCardPayment = async () => {
    if (!finalAmount || finalAmount < 1) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          type: slug,
          donorName: donorName || "فاعل خير",
          donorPhone,
          paymentMethod: "online",
          gateway: "rajhi",
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast({ title: "خطأ", description: data.message || "فشل إنشاء عملية الدفع", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ", description: "تعذر الاتصال بالخادم", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankTransfer = async () => {
    if (!receiptFile) {
      toast({ title: "خطأ", description: "يرجى رفع صورة إيصال التحويل", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("amount", String(finalAmount));
      formData.append("type", slug);
      formData.append("donorName", donorName || "فاعل خير");
      formData.append("donorPhone", donorPhone);
      formData.append("donorEmail", donorEmail);
      formData.append("bankName", service.bank.name);
      formData.append("transferDate", new Date().toISOString());
      formData.append("file", receiptFile);
      const res = await fetch("/api/bank-transfers", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedTransferId(String(data.id));
        if (donorEmail) setPdfEmail(donorEmail);
        setPayStep("success");
      } else {
        toast({ title: "خطأ", description: data.message || "فشل إرسال الطلب", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ", description: "تعذر الاتصال بالخادم", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReceipt = async () => {
    if (!pdfEmail || !pdfEmail.includes("@")) {
      toast({ title: "خطأ", description: "يرجى إدخال بريد إلكتروني صحيح", variant: "destructive" });
      return;
    }
    if (!createdTransferId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bank-transfers/${createdTransferId}/send-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pdfEmail, donorName }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setPdfSent(true);
        toast({ title: "✅ تم الإرسال", description: "وصل إيصال الاستلام إلى بريدك الإلكتروني" });
      } else {
        toast({ title: "خطأ", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ", description: "تعذر إرسال البريد", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPayment = () => {
    setPayStep("amount");
    setSelectedAmount(null);
    setCustomAmount("");
    setDonorName("");
    setDonorPhone("");
    setDonorEmail("");
    setNameError("");
    setReceiptFile(null);
    setReceiptPreview(null);
    setCreatedTransferId(null);
    setPdfEmail("");
    setPdfSent(false);
    setPayMethod("card");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* ═══ Hero — Mountain Parallax + Poster ═══ */}
        <div className="relative overflow-hidden" style={{ height: "520px" }}>

          {/* Sky gradient */}
          <div className={`absolute inset-0 bg-gradient-to-b ${service.bgGradient}`} />

          {/* Stars / light orbs */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { size: 180, top: "8%",  left: "15%", delay: 0 },
              { size: 120, top: "60%", left: "5%",  delay: 0.8 },
              { size: 90,  top: "20%", left: "55%", delay: 1.4 },
            ].map((o, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/8"
                style={{ width: o.size, height: o.size, top: o.top, left: o.left, filter: "blur(40px)" }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
                transition={{ repeat: Infinity, duration: 4 + i, delay: o.delay }}
              />
            ))}
          </div>

          {/* ── Mountain Layer 1 — back, distant ── */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ transform: `translateY(${scrollY * 0.18}px)`, willChange: "transform" }}
          >
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full" style={{ height: 320 }}>
              <path
                d="M0,320 L0,200 Q80,100 160,180 Q240,260 320,140 Q400,20 480,120 Q560,220 640,100 Q720,-20 800,80 Q880,180 960,60 Q1040,-60 1120,80 Q1200,220 1280,120 Q1360,20 1440,160 L1440,320 Z"
                fill="rgba(255,255,255,0.06)"
              />
            </svg>
          </div>

          {/* ── Mountain Layer 2 — mid ── */}
          <motion.div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ translateY: scrollY * 0.28 }}
          >
            <svg viewBox="0 0 1440 280" preserveAspectRatio="none" className="w-full" style={{ height: 280 }}>
              <path
                d="M0,280 L0,220 Q60,160 120,200 Q180,240 240,160 Q300,80 380,140 Q460,200 540,80 Q620,-40 700,60 Q780,160 860,40 Q940,-80 1020,60 Q1100,200 1180,100 Q1260,0 1340,120 Q1380,180 1440,140 L1440,280 Z"
                fill="rgba(255,255,255,0.10)"
              />
            </svg>
          </motion.div>

          {/* ── Mountain Layer 3 — close, detailed ── */}
          <motion.div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ translateY: scrollY * 0.4 }}
          >
            <svg viewBox="0 0 1440 240" preserveAspectRatio="none" className="w-full" style={{ height: 240 }}>
              <path
                d="M0,240 L0,200 Q40,160 80,190 Q120,220 170,150 Q220,80 280,130 Q340,180 400,100 Q460,20 530,80 Q600,140 660,60 Q720,-20 790,50 Q860,120 930,40 Q1000,-40 1080,70 Q1160,180 1240,90 Q1300,30 1360,100 Q1400,150 1440,120 L1440,240 Z"
                fill="rgba(0,0,0,0.20)"
              />
              {/* Mist at mountain base */}
              <ellipse cx="720" cy="240" rx="760" ry="30" fill="rgba(255,255,255,0.07)" />
            </svg>
          </motion.div>

          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />

          {/* ── Content grid ── */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between gap-8" dir="rtl">

                {/* Text side (right in RTL) */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="text-white flex-1 max-w-lg"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 mb-5 shadow-lg"
                  >
                    <Icon className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold tracking-wide text-white/95">{service.title}</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-5xl md:text-6xl font-black font-heading mb-5 leading-tight drop-shadow-2xl"
                    style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
                  >
                    {service.title}
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="flex items-start gap-2.5 bg-white/12 backdrop-blur-md rounded-2xl px-5 py-3.5 border border-white/20 max-w-sm shadow-lg mb-6"
                  >
                    <Quote className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                    <p className="text-white/90 text-sm leading-relaxed">{service.hadith}</p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => setPosterModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all border border-white/25 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105"
                    data-testid="button-open-poster"
                  >
                    <Sparkles className="w-4 h-4" />
                    شاهد البوستر الترويجي
                  </motion.button>
                </motion.div>

                {/* Poster floating card (left in RTL = visual right) */}
                <motion.div
                  initial={{ opacity: 0, x: -50, rotateY: -20, scale: 0.85 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
                  className="hidden lg:block shrink-0"
                  style={{ perspective: 1000 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    className="relative cursor-pointer"
                    onClick={() => setPosterModal(true)}
                    style={{ transform: "rotate(-4deg)" }}
                    whileHover={{ rotate: 0, scale: 1.04, transition: { duration: 0.3 } }}
                  >
                    {/* Poster glow */}
                    <div
                      className="absolute -inset-3 rounded-3xl blur-2xl opacity-60"
                      style={{ background: `radial-gradient(ellipse at center, rgba(255,255,255,0.4), transparent 70%)` }}
                    />
                    {/* Poster image */}
                    <img
                      src={service.poster}
                      alt={`بوستر ${service.title}`}
                      className="w-48 xl:w-56 rounded-2xl shadow-2xl border-2 border-white/30 relative z-10"
                      style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.15)" }}
                    />
                    {/* Shine overlay */}
                    <div className="absolute inset-0 rounded-2xl z-20 pointer-events-none"
                      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)" }}
                    />
                    {/* Click hint badge */}
                    <div className="absolute -bottom-3 -right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg" style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "hsl(152 42% 22%)" }}>
                      <Download className="w-3 h-3" />
                      شارك
                    </div>
                  </motion.div>
                </motion.div>

              </div>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="bg-amber-50 border-b border-amber-100" dir="rtl">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-amber-800">
              <Heart className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
              <p className="text-sm font-semibold">كل ريال تتبرع به يصل لمستحقيه بأمانة وشفافية — جمعية طويق مرخصة رقم 1000820300</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold font-heading mb-4">عن البرنامج</h2>
                  <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-line leading-relaxed" dir="rtl">
                    {service.description}
                  </div>
                </CardContent>
              </Card>

              {/* Impact cards */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold font-heading mb-6">أثر تبرعك</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.impacts.map((impact: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer
                          ${selectedAmount === impact.amount
                            ? `border-transparent ${service.color} text-white`
                            : "border-gray-100 bg-accent/20 hover:bg-accent/40 hover:border-primary/20"
                          }`}
                        onClick={() => { setSelectedAmount(impact.amount); setCustomAmount(""); }}
                        data-testid={`card-impact-${impact.amount}`}
                      >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0
                          ${selectedAmount === impact.amount ? "bg-white/20" : service.color}`}>
                          <span className={`font-black text-sm ${selectedAmount === impact.amount ? "text-white" : "text-white"}`}>{impact.amount}</span>
                        </div>
                        <div>
                          <p className={`font-bold ${selectedAmount === impact.amount ? "text-white" : "text-foreground"}`}>
                            {impact.amount.toLocaleString()} ريال
                          </p>
                          <p className={`text-sm ${selectedAmount === impact.amount ? "text-white/80" : "text-muted-foreground"}`}>
                            {impact.description}
                          </p>
                          <p className={`text-xs font-semibold mt-1 ${selectedAmount === impact.amount ? "text-white/70" : "text-primary"}`}>
                            اضغط للاختيار ←
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bank info card */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo}`} />
                <CardContent className="p-8" dir="rtl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 ${service.color} rounded-xl flex items-center justify-center`}>
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-heading">التبرع المباشر عبر البنك</h2>
                      <p className="text-xs text-muted-foreground">حوّل مباشرةً إلى حساب الجمعية</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground font-medium">البنك</span>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold text-foreground">{service.bank.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium">رقم الآيبان</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-foreground tracking-wide">{service.bank.iban.split("\n")[0]}</span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(service.bank.iban.replace(/\s/g, "").replace(/\n/g, "")); toast({ title: "✅ تم نسخ رقم الآيبان" }); }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          data-testid="button-copy-iban"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    {service.bank.iban.includes(" ") && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono text-left dir-ltr" dir="ltr">
                        {service.bank.iban}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              {showDonationStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "مستفيد", value: service.stats.beneficiaries, icon: Users },
                    { label: "مشروع", value: service.stats.projects, icon: CheckCircle2 },
                    { label: "المستهدف (ر.س)", value: `${(service.stats.targetAmount / 1000).toFixed(0)}K`, icon: Target },
                    { label: "تم جمعه (ر.س)", value: `${(service.stats.currentAmount / 1000).toFixed(0)}K`, icon: Heart },
                  ].map((stat, i) => (
                    <Card key={i} className="border-0 shadow-md">
                      <CardContent className="p-4 text-center">
                        <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold font-heading">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar — Inline Payment Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-3">
                <AnimatePresence mode="wait">

                  {/* ── STEP 1: اختر المبلغ ── */}
                  {payStep === "amount" && (
                    <motion.div key="step-amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <Card className="border-0 shadow-xl overflow-hidden">
                        <div className={`h-1.5 bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo}`} />
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-5">
                            <div className={`w-9 h-9 ${service.color} rounded-xl flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold font-heading leading-none">تبرع الآن</h3>
                              <p className="text-xs text-muted-foreground">{service.title}</p>
                            </div>
                          </div>

                          {showDonationStats && (
                            <div className="mb-5">
                              <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-muted-foreground">تم جمع</span>
                                <span className="font-bold">{service.stats.currentAmount.toLocaleString()} ر.س</span>
                              </div>
                              <Progress value={progress} className="h-2.5" />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>{progress.toFixed(0)}%</span>
                                <span>الهدف: {service.stats.targetAmount.toLocaleString()} ر.س</span>
                              </div>
                            </div>
                          )}

                          {/* Hajj Progress Bar */}
                          {slug === "hajj" && hajjStats && (
                            <div className="mb-5 rounded-xl border p-3.5" style={{ background: "hsl(152 40% 97%)", borderColor: "hsl(152 40% 82%)" }}>
                              <div className="flex items-center justify-between mb-2 text-xs font-bold" style={{ color: "hsl(152 42% 25%)" }}>
                                <span>🕋 تقدم كفالة الحجاج</span>
                                <span style={{ color: "hsl(35 80% 42%)" }}>
                                  {hajjStats.completedPilgrims > 0
                                    ? `${hajjStats.completedPilgrims} حاج مكتمل ✅`
                                    : hajjStats.totalPilgrims > 0
                                    ? `${hajjStats.totalPilgrims} حاج في الطريق ⏳`
                                    : "نحو أول حاج"}
                                </span>
                              </div>
                              <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "hsl(152 40% 86%)" }}>
                                {/* Pending layer */}
                                {hajjStats.pendingAmount > 0 && (
                                  <div
                                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                                    style={{
                                      width: `${Math.min(100, Math.round(((hajjStats.confirmedAmount || 0) + hajjStats.pendingAmount) % hajjStats.hajjCost / hajjStats.hajjCost * 100))}%`,
                                      background: "hsl(152 40% 66%)",
                                    }}
                                  />
                                )}
                                {/* Confirmed layer */}
                                <div
                                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                                  style={{
                                    width: `${hajjStats.currentProgressPercent}%`,
                                    background: "linear-gradient(90deg, hsl(152 52% 36%) 0%, hsl(175 52% 32%) 100%)",
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-between mt-1.5 text-[11px]" style={{ color: "hsl(152 30% 42%)" }}>
                                <span>
                                  {hajjStats.currentProgress > 0
                                    ? `${hajjStats.currentProgress.toLocaleString("ar-SA")} ر.س نحو الحاج القادم`
                                    : "لم تتجمع تبرعات بعد"}
                                  {hajjStats.pendingAmount > 0 && (
                                    <span className="mr-1 text-amber-600">(+ {hajjStats.pendingAmount.toLocaleString("ar-SA")} ر.س قيد المراجعة)</span>
                                  )}
                                </span>
                                <span className="font-bold">{hajjStats.currentProgressPercent}% من 12,000 ر.س</span>
                              </div>
                            </div>
                          )}

                          <Label className="text-sm font-semibold mb-3 block">اختر مبلغ التبرع</Label>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {service.amounts.map((amount: number) => (
                              <button
                                key={amount}
                                onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                                className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${selectedAmount === amount ? `border-transparent ${service.color} text-white shadow-lg` : "border-gray-200 hover:border-primary/50 hover:bg-accent/30"}`}
                                data-testid={`button-amount-${amount}`}
                              >
                                {amount.toLocaleString()} ر.س
                              </button>
                            ))}
                          </div>
                          <div className="relative mb-4">
                            <Input
                              type="number"
                              placeholder="مبلغ آخر (من 1 ريال)"
                              value={customAmount}
                              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                              className="pr-4"
                              data-testid="input-custom-amount"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">ريال</span>
                          </div>

                          {finalAmount > 0 && (
                            <div className={`p-3 rounded-xl ${service.color} text-white mb-4 flex items-center justify-between`}>
                              <span className="text-sm opacity-80">مبلغ التبرع</span>
                              <span className="text-2xl font-black">{finalAmount.toLocaleString()} ر.س</span>
                            </div>
                          )}

                          <Button
                            onClick={handleProceedToInfo}
                            className={`w-full h-13 text-base font-bold bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo} shadow-lg`}
                            disabled={!finalAmount}
                            data-testid="button-proceed-to-info"
                          >
                            متابعة للتبرع
                            <ChevronRight className="w-5 h-5 mr-2" />
                          </Button>
                          <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> دفع آمن ومشفر — جمعية طويق رقم السجل 1000820300
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* ── STEP 2: بياناتك ── */}
                  {payStep === "info" && (
                    <motion.div key="step-info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <Card className="border-0 shadow-xl overflow-hidden">
                        <div className={`h-1.5 bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo}`} />
                        <CardContent className="p-6 space-y-4">
                          <button onClick={() => setPayStep("amount")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-to-amount">
                            <ArrowLeft className="w-3.5 h-3.5 rotate-180" /> رجوع
                          </button>
                          <div>
                            <h3 className="text-lg font-bold font-heading">بياناتك</h3>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-white ${service.color} mt-1`}>
                              <span>المبلغ: {finalAmount.toLocaleString()} ر.س</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm mb-1.5 block">الاسم الكريم <span className="text-red-500">*</span></Label>
                              <Input
                                placeholder="أدخل اسمك"
                                value={donorName}
                                onChange={(e) => { setDonorName(e.target.value); setNameError(""); }}
                                className={nameError ? "border-red-400" : ""}
                                data-testid="input-donor-name"
                              />
                              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                            </div>
                            <div>
                              <Label className="text-sm mb-1.5 block">رقم الجوال <span className="text-muted-foreground text-xs">(اختياري — للتذكير)</span></Label>
                              <Input
                                placeholder="05xxxxxxxx"
                                value={donorPhone}
                                onChange={(e) => setDonorPhone(e.target.value)}
                                dir="ltr"
                                data-testid="input-donor-phone"
                              />
                            </div>
                            <div>
                              <Label className="text-sm mb-1.5 block">
                                البريد الإلكتروني{" "}
                                <span className="text-xs font-semibold" style={{ color: "hsl(28 44% 50%)" }}>
                                  (موصى به — لإرسال الإيصال)
                                </span>
                              </Label>
                              <Input
                                type="email"
                                placeholder="example@email.com"
                                value={donorEmail}
                                onChange={(e) => setDonorEmail(e.target.value)}
                                dir="ltr"
                                data-testid="input-donor-email"
                              />
                            </div>
                          </div>

                          <Button
                            onClick={handleProceedToMethod}
                            className={`w-full h-12 text-base font-bold bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo}`}
                            data-testid="button-proceed-to-method"
                          >
                            التالي — اختر طريقة الدفع
                            <ChevronRight className="w-5 h-5 mr-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* ── STEP 3: طريقة الدفع ── */}
                  {payStep === "method" && (
                    <motion.div key="step-method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <Card className="border-0 shadow-xl overflow-hidden">
                        <div className={`h-1.5 bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo}`} />
                        <CardContent className="p-6 space-y-4">
                          <button onClick={() => setPayStep("info")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-to-info">
                            <ArrowLeft className="w-3.5 h-3.5 rotate-180" /> رجوع
                          </button>

                          {/* Summary */}
                          <div className="flex items-center justify-between bg-accent/40 rounded-xl p-3">
                            <div>
                              <p className="text-xs text-muted-foreground">المتبرع</p>
                              <p className="font-bold text-sm">{donorName}</p>
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl text-white ${service.color} text-sm font-bold`}>
                              {finalAmount.toLocaleString()} ر.س
                            </div>
                          </div>

                          {/* Method tabs */}
                          <div>
                            <h3 className="text-base font-bold mb-3">اختر طريقة الدفع</h3>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <button
                                onClick={() => setPayMethod("card")}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${payMethod === "card" ? "border-primary bg-primary/10 text-primary" : "border-gray-200 hover:border-gray-300"}`}
                                data-testid="button-method-card"
                              >
                                <CreditCard className="w-5 h-5" />
                                بطاقة
                              </button>
                              <button
                                onClick={() => setPayMethod("apple")}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${payMethod === "apple" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-300"}`}
                                data-testid="button-method-apple"
                              >
                                <span className="text-lg leading-none">🍎</span>
                                Apple Pay
                              </button>
                              <button
                                onClick={() => setPayMethod("bank")}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${payMethod === "bank" ? "border-primary bg-primary/10 text-primary" : "border-gray-200 hover:border-gray-300"}`}
                                data-testid="button-method-bank"
                              >
                                <Banknote className="w-5 h-5" />
                                تحويل
                              </button>
                            </div>

                            {/* Card payment */}
                            {payMethod === "card" && (
                              <div className="space-y-3">
                                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 text-center border border-emerald-100 dark:border-emerald-900">
                                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">بوابة الدفع الآمنة عبر مصرف الراجحي</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">سيتم توجيهك لإتمام الدفع على منصة الراجحي الآمنة</p>
                                </div>
                                <Button
                                  onClick={handleCardPayment}
                                  disabled={isSubmitting}
                                  className={`w-full h-12 text-base font-bold bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo} shadow-lg`}
                                  data-testid="button-card-pay"
                                >
                                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري التحضير...</> : <><Lock className="w-4 h-4 ml-2" />ادفع الآن بأمان</>}
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                                  <Lock className="w-3 h-3" /> مدفوعات مشفرة SSL — مصرف الراجحي
                                </p>
                              </div>
                            )}

                            {/* Apple Pay — same Rajhi gateway */}
                            {payMethod === "apple" && (
                              <div className="space-y-3">
                                <div className="rounded-xl p-3 text-center border" style={{ backgroundColor: "hsl(0 0% 5%)", borderColor: "hsl(0 0% 20%)" }}>
                                  <p className="text-xs font-medium text-white">ادفع بـ Apple Pay عبر بوابة مصرف الراجحي</p>
                                  <p className="text-[10px] mt-0.5" style={{ color: "hsl(0 0% 60%)" }}>سيتم توجيهك لإتمام الدفع بأمان</p>
                                </div>
                                <Button
                                  onClick={handleCardPayment}
                                  disabled={isSubmitting}
                                  className="w-full h-12 text-base font-bold text-white shadow-lg"
                                  style={{ backgroundColor: "#000000" }}
                                  data-testid="button-apple-pay"
                                >
                                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري التحضير...</> : <><span className="text-xl leading-none ml-2">🍎</span>ادفع بـ Apple Pay</>}
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                                  <Lock className="w-3 h-3" /> مدفوعات مشفرة SSL — مصرف الراجحي
                                </p>
                              </div>
                            )}

                            {/* Bank transfer */}
                            {payMethod === "bank" && (
                              <div className="space-y-3">
                                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 dark:bg-gray-800/50 p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-bold text-sm">{service.bank.name}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-sm font-bold tracking-wide text-foreground" dir="ltr">{service.bank.iban}</span>
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(service.bank.iban.replace(/\s/g, "")); toast({ title: "✅ تم نسخ رقم الآيبان" }); }}
                                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                      data-testid="button-copy-iban-method"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">اسم المستفيد: جمعية طويق للخدمات الإنسانية</p>
                                </div>

                                {/* Receipt upload */}
                                <div>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    data-testid="input-receipt-file"
                                  />
                                  {!receiptFile ? (
                                    <button
                                      onClick={() => fileInputRef.current?.click()}
                                      className="w-full border-2 border-dashed border-primary/40 hover:border-primary/70 rounded-xl p-4 text-center transition-all hover:bg-primary/5"
                                      data-testid="button-upload-receipt"
                                    >
                                      <Upload className="w-6 h-6 mx-auto mb-1.5 text-primary/60" />
                                      <p className="text-sm font-semibold text-primary/80">ارفع صورة إيصال التحويل</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">صورة أو PDF — حتى 10MB</p>
                                    </button>
                                  ) : (
                                    <div className="rounded-xl border-2 border-green-300 bg-green-50 dark:bg-green-950/30 p-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="w-5 h-5 text-green-600" />
                                          <div>
                                            <p className="text-sm font-semibold text-green-800 dark:text-green-400">تم رفع الإيصال</p>
                                            <p className="text-xs text-green-600 truncate max-w-[140px]">{receiptFile.name}</p>
                                          </div>
                                        </div>
                                        <button onClick={() => { setReceiptFile(null); setReceiptPreview(null); }} className="text-xs text-muted-foreground hover:text-red-500" data-testid="button-remove-receipt">
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                      {receiptPreview && receiptFile.type.startsWith("image/") && (
                                        <img src={receiptPreview} alt="preview" className="w-full h-24 object-cover rounded-lg mt-2" />
                                      )}
                                    </div>
                                  )}
                                </div>

                                <Button
                                  onClick={handleBankTransfer}
                                  disabled={!receiptFile || isSubmitting}
                                  className={`w-full h-12 text-base font-bold bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo}`}
                                  data-testid="button-confirm-transfer"
                                >
                                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الإرسال...</> : <>تأكيد التحويل</>}
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* ── STEP 4: نجاح ── */}
                  {payStep === "success" && (
                    <motion.div key="step-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                      <Card className="border-0 shadow-xl overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-l from-green-500 to-emerald-400" />
                        <CardContent className="p-6 space-y-4 text-center">
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-9 h-9 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold font-heading text-green-700 dark:text-green-400">شكراً لك {donorName}!</h3>
                            <p className="text-sm text-muted-foreground mt-1">تم استلام إيصال تحويلكم بنجاح وسيتم مراجعته خلال 24 ساعة. جزاكم الله خيراً.</p>
                          </div>

                          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-100 dark:border-amber-900 text-right">
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">مبلغ التبرع: {finalAmount.toLocaleString()} ر.س</p>
                            <p className="text-xs text-amber-600 dark:text-amber-500">القطاع: {service.title}</p>
                          </div>

                          {!pdfSent ? (
                            <div className="space-y-2 text-right">
                              <Label className="text-sm font-semibold block">استلم إيصال الاستلام بريدياً</Label>
                              <Input
                                type="email"
                                placeholder="بريدك الإلكتروني"
                                value={pdfEmail}
                                onChange={(e) => setPdfEmail(e.target.value)}
                                dir="ltr"
                                data-testid="input-pdf-email"
                              />
                              <Button
                                onClick={handleSendReceipt}
                                disabled={isSubmitting || !pdfEmail}
                                className="w-full h-11 font-bold bg-emerald-600 hover:bg-emerald-700"
                                data-testid="button-send-receipt"
                              >
                                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الإرسال...</> : <><Send className="w-4 h-4 ml-2" />إرسال الإيصال</>}
                              </Button>
                            </div>
                          ) : (
                            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-3 border border-green-200 dark:border-green-800">
                              <p className="text-sm text-green-700 dark:text-green-400 font-semibold flex items-center gap-2 justify-center">
                                <CheckCircle className="w-4 h-4" /> تم إرسال الإيصال إلى {pdfEmail}
                              </p>
                            </div>
                          )}

                          <button
                            onClick={handleResetPayment}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mx-auto transition-colors"
                            data-testid="button-new-donation"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> إضافة تبرع آخر
                          </button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Share buttons — always visible */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs text-center text-muted-foreground font-medium">شارك وادعُ الآخرين للخير</p>
                    <button
                      onClick={handleSharePosterWhatsapp}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5C] transition-colors text-white font-bold text-sm"
                      data-testid="button-share-whatsapp"
                    >
                      <SiWhatsapp className="w-4 h-4" />
                      مشاركة البوستر عبر واتساب
                    </button>
                    <button
                      onClick={() => setPosterModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border-2 border-gray-200 hover:border-primary/40 transition-colors text-sm font-semibold text-muted-foreground hover:text-foreground"
                      data-testid="button-view-poster"
                    >
                      <Sparkles className="w-4 h-4" />
                      عرض البوستر الترويجي
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Poster Modal */}
      <AnimatePresence>
        {posterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setPosterModal(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative z-10 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-bold text-lg">البوستر الترويجي</span>
                </div>
                <button
                  onClick={() => setPosterModal(false)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                  data-testid="button-close-poster"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Poster image */}
              <div className="rounded-2xl overflow-hidden shadow-2xl mb-4 ring-2 ring-white/20">
                <img
                  src={service.poster}
                  alt={`بوستر ${service.title}`}
                  className="w-full h-auto"
                  data-testid="img-service-poster"
                />
              </div>

              {/* Promo message preview */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20">
                <p className="text-white/70 text-xs font-medium mb-2">رسالة الترويج الجاهزة</p>
                <p className="text-white text-sm leading-relaxed whitespace-pre-line line-clamp-5">{whatsappMsg}</p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleSharePosterWhatsapp}
                  className="flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20BD5C] transition-all active:scale-95 text-white font-bold text-base shadow-lg shadow-green-900/30"
                  data-testid="button-modal-share-whatsapp"
                >
                  <SiWhatsapp className="w-6 h-6" />
                  مشاركة البوستر + الرسالة عبر واتساب
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadPoster}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 transition-all active:scale-95 text-white font-semibold text-sm border border-white/20"
                    data-testid="button-download-poster"
                  >
                    <Download className="w-4 h-4" />
                    تحميل البوستر
                  </button>
                  <button
                    onClick={handleCopyMsg}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 transition-all active:scale-95 text-white font-semibold text-sm border border-white/20"
                    data-testid="button-copy-promo-msg"
                  >
                    <Copy className="w-4 h-4" />
                    نسخ الرسالة
                  </button>
                </div>
                <button
                  onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`, "_blank"); }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/80 font-medium text-sm border border-white/10"
                  data-testid="button-modal-whatsapp-textonly"
                >
                  <ExternalLink className="w-4 h-4" />
                  فتح واتساب برسالة النص فقط
                </button>
              </div>

              <p className="text-center text-white/40 text-xs mt-3">
                اضغط خارج الإطار للإغلاق
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
