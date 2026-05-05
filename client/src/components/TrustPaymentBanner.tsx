import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { SiApple, SiVisa, SiMastercard } from "react-icons/si";
import { ShieldCheck, Lock, Zap, Heart, Star, BadgeCheck, ArrowLeft } from "lucide-react";

const ROTATING_FEATURES = [
  { icon: <ShieldCheck className="w-5 h-5" />, text: "بوابة دفع آمنة 100٪ عبر مصرف الراجحي" },
  { icon: <Lock className="w-5 h-5" />, text: "تشفير SSL لجميع معاملاتك" },
  { icon: <Heart className="w-5 h-5" />, text: "تبرعك يصل للمستحقين مباشرة" },
  { icon: <BadgeCheck className="w-5 h-5" />, text: "جمعية مرخّصة — رقم الترخيص: 17660" },
  { icon: <Star className="w-5 h-5" />, text: "أكثر من 10,000 مستفيد سنوياً" },
  { icon: <Zap className="w-5 h-5" />, text: "إتمام التبرع في أقل من 30 ثانية" },
];

const TICKER_ITEMS = [
  "تبرع سريع وآمن",
  "Apple Pay",
  "مدى",
  "فيزا وماستركارد",
  "تحويل بنكي",
  "شهادة ضريبية فورية",
  "بيانات محمية",
  "دفع مشفّر SSL",
  "الراجحي iPayPipe",
  "جمعية مرخّصة",
];

export function TrustPaymentBanner() {
  const [featureIdx, setFeatureIdx] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureIdx((i) => (i + 1) % ROTATING_FEATURES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden" dir="rtl" style={{ background: "linear-gradient(135deg, hsl(152 55% 12%) 0%, hsl(152 48% 18%) 40%, hsl(28 44% 22%) 100%)" }}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(152 60% 40%) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, hsl(28 60% 50%) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] opacity-5" style={{ background: "radial-gradient(ellipse, white 0%, transparent 70%)" }} />
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── Animated ticker strip ── */}
      <div className="border-b overflow-hidden py-2.5" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)" }}>
        <div className="flex items-center gap-0 whitespace-nowrap" style={{ animation: "ticker 28s linear infinite" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-sm font-semibold px-6" style={{ color: "rgba(255,255,255,0.75)" }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: "hsl(152 60% 55%)" }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container mx-auto px-4 py-14 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left — headline + features */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 border" style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)", color: "hsl(152 60% 70%)" }}>
                  <Zap className="w-3.5 h-3.5" />
                  تجربة تبرع استثنائية
                </div>

                <h2 className="text-3xl md:text-4xl font-black font-heading text-white leading-relaxed mb-2">
                  تبرعك صار
                  <span className="relative inline-block mx-2">
                    <span style={{ color: "hsl(152 60% 60%)" }}> أسهل</span>
                    <svg className="absolute -bottom-1 right-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                      <path d="M0 5 Q50 0 100 5" stroke="hsl(28 60% 60%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>
                </h2>
                <p className="text-white/60 text-base mb-8 leading-relaxed">
                  نوفّر لك طرق دفع متعددة وآمنة لإتمام تبرعك في ثوانٍ<br />وشهادة ضريبية فورية بعد كل عملية
                </p>

                {/* Rotating feature */}
                <div className="rounded-2xl p-4 mb-8 min-h-[60px] flex items-center gap-3 border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={featureIdx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                      className="flex items-center gap-3 w-full"
                    >
                      <span className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(152 55% 25%)", color: "hsl(152 60% 65%)" }}>
                        {ROTATING_FEATURES[featureIdx].icon}
                      </span>
                      <span className="text-sm font-semibold text-white/90">{ROTATING_FEATURES[featureIdx].text}</span>
                    </motion.div>
                  </AnimatePresence>
                  {/* Dots indicator */}
                  <div className="flex gap-1 mr-auto flex-shrink-0">
                    {ROTATING_FEATURES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFeatureIdx(i)}
                        className="rounded-full transition-all"
                        style={{
                          width: i === featureIdx ? 16 : 6,
                          height: 6,
                          background: i === featureIdx ? "hsl(152 60% 55%)" : "rgba(255,255,255,0.2)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link href="/donate">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-black text-base font-heading text-white shadow-2xl transition-all"
                    style={{ background: "linear-gradient(135deg, hsl(152 55% 35%) 0%, hsl(152 48% 28%) 100%)", boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)" }}
                    data-testid="button-trust-banner-donate"
                  >
                    <Heart className="w-5 h-5" />
                    تبرع الآن
                    <ArrowLeft className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* Right — payment methods card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="rounded-3xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5" style={{ color: "hsl(152 60% 55%)" }} />
                    <span className="font-black text-white text-base">طرق الدفع المتاحة</span>
                  </div>
                  <p className="text-xs text-white/50">جميع المعاملات مشفّرة ومؤمّنة</p>
                </div>

                <div className="p-6 space-y-3">
                  {/* Apple Pay */}
                  <div className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-white/5" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#000", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <SiApple className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>Apple Pay</p>
                      <p className="text-xs text-white/50 mt-0.5">لأجهزة iPhone و iPad و Mac</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(52,199,89,0.2)", color: "#34C759" }}>متاح</span>
                  </div>

                  {/* mada + cards */}
                  <div className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-white/5" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 gap-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <span className="text-[9px] font-black leading-none" style={{ color: "#00A651" }}>مدى</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-sm">مدى / Visa / Mastercard</p>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">جميع البطاقات البنكية السعودية والدولية</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <SiVisa className="w-7 h-7 text-white/80" />
                      <SiMastercard className="w-6 h-6 text-white/80" />
                    </div>
                  </div>

                  {/* Bank transfer */}
                  <div className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-white/5" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current text-white/80" strokeWidth="1.8" strokeLinecap="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        <path d="M12 12v4M10 14h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">تحويل بنكي مباشر</p>
                      <p className="text-xs text-white/50 mt-0.5">الراجحي · العربي الوطني · بنك البلاد</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(52,199,89,0.2)", color: "#34C759" }}>متاح</span>
                  </div>
                </div>

                {/* Trust footer */}
                <div className="px-6 pb-6">
                  <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(152 55% 20%)" }}>
                      <Lock className="w-4 h-4" style={{ color: "hsl(152 60% 60%)" }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/80">تبرع بأمان تام</p>
                      <p className="text-[10px] text-white/40">مشفّر SSL · بوابة iPayPipe الراجحي · جمعية مرخّصة</p>
                    </div>
                    <div className="mr-auto flex-shrink-0 text-[10px] font-black px-2 py-1 rounded-lg" style={{ background: "rgba(52,199,89,0.15)", color: "#34C759", border: "1px solid rgba(52,199,89,0.3)" }}>
                      SSL 🔒
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ── Bottom logo strip ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 pt-8 border-t"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p className="text-center text-xs text-white/35 mb-6 font-semibold tracking-widest uppercase">شركاؤنا في الدفع الآمن</p>
            <div className="flex items-center justify-center flex-wrap gap-6 md:gap-10">
              {/* Al Rajhi */}
              <div className="flex items-center gap-2 opacity-60 hover:opacity-90 transition-opacity">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  <img src="/images/rajhi-logo.png" alt="الراجحي" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/60 leading-none">مصرف</p>
                  <p className="text-[10px] font-black text-white/60 leading-none">الراجحي</p>
                </div>
              </div>
              {/* Apple Pay */}
              <div className="flex items-center gap-1.5 opacity-60 hover:opacity-90 transition-opacity px-4 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <SiApple className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>Pay</span>
              </div>
              {/* mada */}
              <div className="opacity-60 hover:opacity-90 transition-opacity px-4 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-base font-black" style={{ color: "#00A651" }}>مدى</span>
              </div>
              {/* Visa */}
              <div className="opacity-60 hover:opacity-90 transition-opacity">
                <SiVisa className="w-12 h-8 text-white/70" />
              </div>
              {/* Mastercard */}
              <div className="opacity-60 hover:opacity-90 transition-opacity">
                <SiMastercard className="w-10 h-8 text-white/70" />
              </div>
              {/* SSL */}
              <div className="flex items-center gap-1.5 opacity-60 hover:opacity-90 transition-opacity px-3 py-2 rounded-xl" style={{ background: "rgba(52,199,89,0.1)", border: "1px solid rgba(52,199,89,0.25)" }}>
                <Lock className="w-4 h-4" style={{ color: "#34C759" }} />
                <span className="text-xs font-black" style={{ color: "#34C759" }}>SSL Secured</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
      `}</style>
    </section>
  );
}
