import { useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DonationCard } from "@/components/DonationCard";
import { QuickDonateStrip } from "@/components/QuickDonateStrip";
import { ShieldCheck, Heart, Users, HandHeart } from "lucide-react";
import { Link } from "wouter";
import { useLocation, useSearch } from "wouter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useSEO } from "@/hooks/use-seo";
import applePayLogo from "@assets/image_1774519414670.png";
import madaVisaMcLogo from "@assets/image_1774519438042.png";
import alRajhiLogo from "@assets/image_1774519457437.png";

const BENEFITS = [
  { icon: ShieldCheck, title: "دفع آمن 100%", desc: "جميع المعاملات مشفرة ومؤمّنة" },
  { icon: Heart, title: "يصل لمستحقيه", desc: "شفافية تامة في كل ريال تتبرع به" },
  { icon: Users, title: "+8,350 مستفيد", desc: "أثر حقيقي في حياة المحتاجين" },
  { icon: HandHeart, title: "شهادة تبرع", desc: "احتفظ بشهادتك لكل تبرع" },
];

export default function Donate() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const cardRef = useRef<HTMLDivElement>(null);

  useSEO({
    title: "تبرع الآن",
    description: "ساهم في دعم المحتاجين عبر بوابة التبرع الآمنة — Visa / Mastercard / Apple Pay / Google Pay / مدى",
    image: "/images/og-banner2.png",
  });

  const handleAmountSelect = (amount: number, serviceSlug: string) => {
    const url = serviceSlug
      ? `/donate?amount=${amount}&campaignId=${serviceSlug}`
      : amount > 0 ? `/donate?amount=${amount}` : `/donate?campaignId=${serviceSlug}`;
    setLocation(url);
    setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "hsl(35 28% 97%)" }}>
      <Navbar />

      <main className="flex-1" dir="rtl">

        {/* ── Hero band ── */}
        <div
          className="py-10 md:py-16 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(152 42% 26%) 0%, hsl(152 42% 36%) 100%)" }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-5 border"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.25)", color: "white" }}
            >
              <Heart className="w-4 h-4" />
              لكل تبرع أثر لا يُمحى
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-heading text-white mb-3 leading-tight">
              اصنع فرقاً اليوم
            </h1>
            <p className="text-white/75 text-base md:text-lg max-w-lg mx-auto">
              مساهمتك مهما كانت بسيطة، تصنع أثراً عظيماً في حياة المحتاجين
            </p>

            {/* Payment badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <div className="flex items-center px-3 py-1.5 rounded-lg" style={{ backgroundColor: "white" }}>
                <img src={madaVisaMcLogo} alt="مدى / Visa / Mastercard" className="h-6 object-contain" />
              </div>
              <div className="flex items-center px-3 py-1.5 rounded-lg" style={{ backgroundColor: "white" }}>
                <img src={applePayLogo} alt="Apple Pay" className="h-6 object-contain" />
              </div>
              <div className="flex items-center px-3 py-1.5 rounded-lg" style={{ backgroundColor: "white" }}>
                <img src={alRajhiLogo} alt="مصرف الراجحي" className="h-6 object-contain" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Donate Strip ── */}
        <QuickDonateStrip onAmountSelect={handleAmountSelect} />

        {/* ── Content ── */}
        <div ref={cardRef} className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">

            {/* Left: info (desktop only) */}
            <div className="hidden lg:flex lg:col-span-2 flex-col gap-6">
              <div>
                <p className="section-label mb-2">لماذا طويق؟</p>
                <h2 className="text-2xl font-black font-heading mb-4 leading-tight" style={{ color: "hsl(210 22% 14%)" }}>
                  ثقتكم أمانة<br />نحملها بمسؤولية
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(215 15% 42%)" }}>
                  جمعية طويق للخدمات الإنسانية جمعية سعودية مرخصة تضمن وصول تبرعاتكم لمستحقيها مباشرة وبكل شفافية.
                </p>
              </div>

              <div className="space-y-3">
                {BENEFITS.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white"
                    style={{ border: "1px solid hsl(35 15% 88%)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "hsl(152 42% 93%)" }}
                    >
                      <b.icon className="w-5 h-5" style={{ color: "hsl(152 42% 28%)" }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "hsl(210 22% 14%)" }}>{b.title}</p>
                      <p className="text-xs" style={{ color: "hsl(215 15% 52%)" }}>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* License info */}
              <div
                className="p-4 rounded-xl text-xs leading-relaxed"
                style={{ backgroundColor: "hsl(152 42% 95%)", border: "1px solid hsl(152 42% 84%)", color: "hsl(152 42% 28%)" }}
              >
                <p className="font-bold mb-1">جمعية طويق للخدمات الإنسانية</p>
                <p>رقم السجل: 1000820300</p>
                <p>ترخيص: 6573 — المقر: الرياض</p>
                <p className="mt-2">
                  <Link href="/bank-transfer" className="underline font-bold">التحويل البنكي المباشر ←</Link>
                </p>
              </div>
            </div>

            {/* Right: Donation Card — key=search forces remount when URL params change */}
            <div className="lg:col-span-3">
              <DonationCard key={search} />

              {/* Mobile-only benefits */}
              <div className="lg:hidden mt-6 grid grid-cols-2 gap-3">
                {BENEFITS.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white"
                    style={{ border: "1px solid hsl(35 15% 88%)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "hsl(152 42% 93%)" }}
                    >
                      <b.icon className="w-4 h-4" style={{ color: "hsl(152 42% 28%)" }} />
                    </div>
                    <div>
                      <p className="font-bold text-xs" style={{ color: "hsl(210 22% 14%)" }}>{b.title}</p>
                      <p className="text-[10px]" style={{ color: "hsl(215 15% 52%)" }}>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
