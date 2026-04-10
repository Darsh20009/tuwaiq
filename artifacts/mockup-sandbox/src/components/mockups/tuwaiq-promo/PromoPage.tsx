import { useState, useEffect } from "react";

const EMERALD = "#059669";
const EMERALD_DARK = "#047857";
const EMERALD_DEEPER = "#065f46";
const GOLD = "#d97706";
const GOLD_LIGHT = "#fbbf24";

function PhoneFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: 220, height: 440 }}>
      <div
        className="absolute inset-0 rounded-[36px] shadow-2xl"
        style={{
          background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          border: "2px solid rgba(255,255,255,0.15)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      />
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-5 rounded-full" style={{ background: "#0a0a0a" }} />
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-700 translate-x-5" />
      <div
        className="absolute rounded-[28px] overflow-hidden"
        style={{ top: 14, left: 8, right: 8, bottom: 14 }}
      >
        {children}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/30" />
    </div>
  );
}

function TabletFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: 300, height: 400 }}>
      <div
        className="absolute inset-0 rounded-[20px] shadow-2xl"
        style={{
          background: "linear-gradient(145deg, #1c1c1e 0%, #2c2c2e 100%)",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      />
      <div className="absolute top-3 right-5 w-2 h-2 rounded-full bg-gray-600" />
      <div
        className="absolute overflow-hidden rounded-[14px]"
        style={{ top: 12, left: 12, right: 12, bottom: 14 }}
      >
        {children}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-white/20" />
    </div>
  );
}

function LaptopFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: 520, height: 340 }}>
      <div
        className="absolute rounded-t-[12px] shadow-xl overflow-hidden"
        style={{
          top: 0, left: 0, right: 0, height: 290,
          background: "#1a1a2e",
          border: "3px solid #2d2d44",
          borderBottom: "none",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-6 flex items-center px-3 gap-1.5" style={{ background: "#111" }}>
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <div className="flex-1 mx-2 h-3.5 rounded-sm bg-gray-700 text-[7px] text-gray-400 flex items-center justify-center">
            tuwaiqassociation.sa
          </div>
        </div>
        <div className="absolute inset-0 pt-6 overflow-hidden">
          {children}
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 rounded-b-[8px]"
        style={{
          height: 50,
          background: "linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
          border: "3px solid #2d2d44",
          borderTop: "4px solid #333",
        }}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-2 rounded-sm bg-gray-600/60" />
      </div>
    </div>
  );
}

function PhoneScreen() {
  return (
    <div className="w-full h-full text-white overflow-hidden" style={{ background: `linear-gradient(160deg, ${EMERALD_DEEPER} 0%, ${EMERALD_DARK} 60%, #052e16 100%)` }} dir="rtl">
      <div className="px-3 pt-3 pb-2" style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="flex justify-between items-center">
          <span className="text-[8px] text-emerald-300 font-bold">طويق</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="text-[9px] text-emerald-200 mb-1">تبرع سريع</div>
        <div className="text-[7px] text-white/60 mb-3">اختر نوع التبرع</div>
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {["صدقة عامة", "زكاة مال", "كفالة أسرة", "وقف"].map((t) => (
            <div key={t} className="rounded-lg p-1.5 text-center text-[7px]" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
              {t}
            </div>
          ))}
        </div>
        <div className="rounded-xl p-2 mb-2" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${EMERALD}` }}>
          <div className="text-[7px] text-emerald-300 mb-1">المبلغ</div>
          <div className="flex gap-1 flex-wrap">
            {["50", "100", "200", "500"].map((a) => (
              <div key={a} className={`rounded-md px-1.5 py-0.5 text-[7px] ${a === "100" ? "text-white" : "text-white/60"}`}
                style={{ background: a === "100" ? EMERALD : "rgba(255,255,255,0.08)" }}>
                {a}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full py-2 rounded-xl text-center text-[8px] font-bold text-white" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }}>
          تبرع الآن ⚡
        </div>
      </div>
      <div className="px-3 mt-1">
        <div className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="text-[8px] text-emerald-300">﴿ وَمَا تُنفِقُوا مِنْ خَيْرٍ فَلِأَنفُسِكُمْ ﴾</div>
        </div>
      </div>
    </div>
  );
}

function TabletScreen() {
  return (
    <div className="w-full h-full text-white overflow-hidden" style={{ background: `linear-gradient(135deg, ${EMERALD_DEEPER} 0%, #052e16 100%)` }} dir="rtl">
      <div className="flex h-full">
        <div className="w-20 h-full flex flex-col items-center py-4 gap-4" style={{ background: "rgba(0,0,0,0.3)" }}>
          {["🏠", "💚", "📋", "🔔", "👤"].map((icon) => (
            <div key={icon} className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              {icon}
            </div>
          ))}
        </div>
        <div className="flex-1 p-3 overflow-hidden">
          <div className="text-[9px] font-bold text-white mb-2">لوحة التبرعات</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {[
              { label: "إجمالي التبرعات", val: "٢٣٤,٥٠٠ ر.س", icon: "💰" },
              { label: "المستفيدون", val: "١,٢٣٤ أسرة", icon: "👨‍👩‍👧" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="text-xs mb-0.5">{s.icon}</div>
                <div className="text-[8px] text-white font-bold">{s.val}</div>
                <div className="text-[6px] text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.07)", border: `1px solid rgba(${EMERALD},0.3)` }}>
            <div className="text-[7px] text-emerald-300 mb-1.5 font-bold">آخر التبرعات</div>
            {["فاعل خير — ٥٠٠ ر.س", "محمد أحمد — ٢٠٠ ر.س", "أم عبدالله — ١٠٠ ر.س"].map((d) => (
              <div key={d} className="flex items-center gap-1.5 py-0.5 border-b border-white/10">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[6px] text-white/80">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LaptopScreen() {
  return (
    <div className="w-full h-full text-white overflow-hidden" style={{ background: `linear-gradient(160deg, #0a1628 0%, #0d2137 50%, #052e16 100%)` }} dir="rtl">
      <div className="flex h-full">
        <div className="w-32 flex flex-col py-3 px-2" style={{ background: "rgba(0,0,0,0.4)", borderLeft: `1px solid rgba(255,255,255,0.08)` }}>
          <div className="flex items-center gap-1 mb-3">
            <div className="w-5 h-5 rounded-md" style={{ background: EMERALD }} />
            <span className="text-[7px] font-bold text-white">جمعية طويق</span>
          </div>
          {["الرئيسية", "التبرعات", "الحملات", "المستفيدون", "التقارير", "الإعدادات"].map((item, i) => (
            <div key={item} className={`py-1 px-2 rounded-md text-[7px] mb-0.5 ${i === 1 ? "text-white font-bold" : "text-white/50"}`}
              style={{ background: i === 1 ? EMERALD : "transparent" }}>
              {item}
            </div>
          ))}
        </div>
        <div className="flex-1 p-3">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { icon: "💰", val: "٢.٣M", label: "إجمالي" },
              { icon: "✅", val: "١٢٣٤", label: "مؤكد" },
              { icon: "⏳", val: "٢٣", label: "معلق" },
              { icon: "👥", val: "٨٩١", label: "متبرع" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-base mb-0.5">{s.icon}</div>
                <div className="text-[9px] font-bold text-emerald-300">{s.val}</div>
                <div className="text-[6px] text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-[7px] text-emerald-300 mb-1.5 font-bold">آخر التبرعات</div>
            <div className="grid grid-cols-4 text-[5px] text-white/40 pb-1 border-b border-white/10">
              <span>المتبرع</span><span>المبلغ</span><span>النوع</span><span>الحالة</span>
            </div>
            {[
              ["فاعل خير", "١,٠٠٠ ر.س", "زكاة", "✅ مؤكد"],
              ["محمد العمري", "٥٠٠ ر.س", "صدقة", "✅ مؤكد"],
              ["أم عبدالله", "٢٠٠ ر.س", "وقف", "⏳ معلق"],
            ].map(([n, a, t, s]) => (
              <div key={n} className="grid grid-cols-4 py-1 border-b border-white/5 text-[6px] text-white/70">
                <span>{n}</span><span className="text-emerald-300">{a}</span><span>{t}</span><span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingBadge({ text, x, y, delay = 0 }: { text: string; x: number; y: number; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className="absolute z-20 px-3 py-1.5 rounded-full text-xs font-bold shadow-xl transition-all duration-700"
      style={{
        left: x, top: y,
        background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.25)",
        color: "white",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
      }}
    >
      {text}
    </div>
  );
}

export function PromoPage() {
  const [activeQuote, setActiveQuote] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveQuote((p) => (p + 1) % 3), 3000);
    return () => clearInterval(t);
  }, []);

  const quotes = [
    { text: "﴿ مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ ﴾", ref: "سورة البقرة — ٢٦١" },
    { text: "قال رسول الله ﷺ: «الصدقة تطفئ الخطيئة كما يطفئ الماء النار»", ref: "رواه الترمذي" },
    { text: "﴿ وَمَا تُنفِقُوا مِنْ خَيْرٍ فَإِنَّ اللَّهَ بِهِ عَلِيمٌ ﴾", ref: "سورة البقرة — ٢٧٣" },
  ];

  return (
    <div
      className="w-full overflow-y-auto"
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse 120% 100% at 50% -10%, #064e3b 0%, #0d1117 60%, #0a1628 100%)`,
        fontFamily: "'Cairo', 'Noto Naskh Arabic', sans-serif",
      }}
      dir="rtl"
    >
      {/* Stars Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative px-8 pt-12 pb-8 text-center">
        {/* Glow behind */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${EMERALD} 0%, transparent 70%)` }} />

        {/* Logo area */}
        <div className="flex justify-center items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`, border: "2px solid rgba(255,255,255,0.2)" }}>
            <span className="text-white text-xl font-bold">ط</span>
          </div>
          <div className="text-right">
            <div className="text-white text-xl font-bold leading-tight">جمعية طويق</div>
            <div className="text-emerald-400 text-xs">للخدمات الإنسانية</div>
          </div>
        </div>

        {/* Bismillah */}
        <div className="inline-block px-6 py-2 rounded-full mb-6 text-sm"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#a7f3d0" }}>
          ﷽
        </div>

        {/* Main headline */}
        <h1 className="text-5xl font-black text-white mb-4 leading-tight">
          تبرّعك صار{" "}
          <span style={{
            background: `linear-gradient(90deg, ${GOLD_LIGHT}, ${GOLD}, #f59e0b)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>أسهل</span>
          <br />مع{" "}
          <span style={{
            background: `linear-gradient(90deg, #6ee7b7, ${EMERALD}, #059669)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>طويق</span>
        </h1>

        <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
          منصة خيرية متكاملة — تبرع من أي جهاز، في أي وقت، بثقة واطمئنان تام
        </p>

        {/* Feature badges row */}
        <div className="flex justify-center gap-3 flex-wrap mb-10">
          {[
            { icon: "⚡", text: "سرعة عالية" },
            { icon: "🛡️", text: "استقرار عالي" },
            { icon: "🔒", text: "دفع آمن ١٠٠%" },
            { icon: "✅", text: "مرخّصة رسمياً" },
          ].map((b) => (
            <div key={b.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white font-medium"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}>
              <span>{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ANIMATED QUOTE ── */}
      <section className="px-8 mb-10">
        <div className="max-w-3xl mx-auto rounded-2xl p-6 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(5,150,105,0.15), rgba(4,120,87,0.08))",
            border: "1px solid rgba(5,150,105,0.3)",
          }}>
          <div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(90deg, transparent, ${EMERALD}, transparent)` }} />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl opacity-20">☪</div>

          <div className="text-2xl mb-1 text-white/20">❝</div>
          <p className="text-emerald-200 text-base leading-relaxed mb-3 font-medium transition-all duration-500" key={activeQuote}>
            {quotes[activeQuote].text}
          </p>
          <p className="text-emerald-400/60 text-xs">{quotes[activeQuote].ref}</p>

          <div className="flex justify-center gap-2 mt-4">
            {quotes.map((_, i) => (
              <div key={i}
                className="rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  width: i === activeQuote ? 24 : 6,
                  height: 6,
                  background: i === activeQuote ? EMERALD : "rgba(255,255,255,0.2)",
                }}
                onClick={() => setActiveQuote(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── DEVICES SECTION ── */}
      <section className="px-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">متاح على جميع أجهزتك</h2>
          <p className="text-white/50 text-sm">تجربة سلسة على الهاتف والتابلت واللابتوب</p>
        </div>

        {/* Devices showcase */}
        <div className="relative flex items-end justify-center gap-6">

          {/* Phone (Android) */}
          <div className="flex flex-col items-center gap-3" style={{ transform: "translateY(30px)" }}>
            <div className="text-xs text-white/40 font-medium">📱 Android</div>
            <PhoneFrame>
              <PhoneScreen />
            </PhoneFrame>
          </div>

          {/* Laptop — center, tallest */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-white/40 font-medium">💻 Desktop</div>
            <LaptopFrame>
              <LaptopScreen />
            </LaptopFrame>
          </div>

          {/* iPad */}
          <div className="flex flex-col items-center gap-3" style={{ transform: "translateY(20px)" }}>
            <div className="text-xs text-white/40 font-medium">📟 iPad</div>
            <TabletFrame>
              <TabletScreen />
            </TabletFrame>
          </div>

          {/* iPhone */}
          <div className="flex flex-col items-center gap-3" style={{ transform: "translateY(40px)" }}>
            <div className="text-xs text-white/40 font-medium">📱 iPhone</div>
            <PhoneFrame>
              <PhoneScreen />
            </PhoneFrame>
          </div>

          {/* Floating badges */}
          <FloatingBadge text="⚡ أسرع دفع" x={20} y={100} delay={500} />
          <FloatingBadge text="🔔 إشعارات فورية" x={800} y={60} delay={900} />
          <FloatingBadge text="📄 شهادة PDF" x={80} y={320} delay={1300} />
          <FloatingBadge text="🛡️ تشفير بنكي" x={760} y={280} delay={700} />
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">لماذا تختار طويق؟</h2>
            <div className="flex justify-center gap-2 items-center">
              <div className="h-px flex-1 max-w-20" style={{ background: `linear-gradient(to right, transparent, ${EMERALD})` }} />
              <span className="text-emerald-400 text-sm">✦</span>
              <div className="h-px flex-1 max-w-20" style={{ background: `linear-gradient(to left, transparent, ${EMERALD})` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "⚡", title: "سرعة فائقة", desc: "دفع خلال ثوانٍ عبر مصرف الراجحي بدون انتظار", color: GOLD },
              { icon: "🛡️", title: "أمان تام", desc: "تشفير AES-256 بنكي وبروتوكولات حماية دولية", color: "#3b82f6" },
              { icon: "🔔", title: "إشعارات لحظية", desc: "تأكيد فوري على جوالك بمجرد استلام التبرع", color: "#8b5cf6" },
              { icon: "📜", title: "شهادة + فاتورة", desc: "وثائق PDF رسمية تُرسَل لبريدك تلقائياً", color: EMERALD },
              { icon: "🌐", title: "من أي مكان", desc: "متوفر على الهاتف والتابلت والحاسوب والساعة الذكية", color: "#ec4899" },
              { icon: "✅", title: "مرخّصة رسمياً", desc: "جمعية مرخّصة من وزارة الموارد البشرية السعودية", color: "#10b981" },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-5 group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
                  style={{ background: `${f.color}20`, border: `1px solid ${f.color}40` }}>
                  {f.icon}
                </div>
                <h3 className="text-white font-bold mb-1">{f.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section className="px-8 pb-12">
        <div className="max-w-4xl mx-auto rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${EMERALD_DEEPER}, #052e16)`,
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
          <div className="absolute inset-0 opacity-10"
            style={{ background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

          <h3 className="text-center text-white/60 text-sm mb-6 uppercase tracking-wider">أرقام تتحدث عن نفسها</h3>
          <div className="grid grid-cols-4 gap-6 text-center">
            {[
              { val: "٢٣٤,٥٠٠+", label: "ريال تبرعات", icon: "💰" },
              { val: "١,٢٣٤+", label: "أسرة مستفيدة", icon: "🏠" },
              { val: "٨,٩٠١+", label: "متبرع كريم", icon: "❤️" },
              { val: "٩٩.٩٪", label: "استقرار النظام", icon: "⚡" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black text-white mb-1">{s.val}</div>
                <div className="text-emerald-300/70 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="px-8 pb-16 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 rounded-full blur-3xl opacity-30" style={{ background: GOLD }} />
          <h2 className="relative text-4xl font-black text-white mb-4">
            ابدأ رحلة العطاء الآن
          </h2>
        </div>
        <p className="text-white/50 mb-8 max-w-md mx-auto">
          كل ريال تتبرع به يصنع فرقاً حقيقياً في حياة أسرة محتاجة
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              boxShadow: `0 20px 40px ${GOLD}40`,
              color: "#1a1a0a",
            }}>
            ⚡ تبرع الآن
          </button>
          <button
            className="px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              backdropFilter: "blur(8px)",
            }}>
            🤝 انضم متطوعاً
          </button>
        </div>

        {/* Decorative bottom */}
        <div className="mt-12 flex justify-center items-center gap-4 text-white/20 text-sm">
          <span>جمعية طويق للخدمات الإنسانية</span>
          <span>•</span>
          <span>الرياض، المملكة العربية السعودية</span>
          <span>•</span>
          <span>رقم الترخيص: ١٧٦٦٠</span>
        </div>

        {/* Islamic geometric ornament */}
        <div className="mt-6 flex justify-center gap-3 text-emerald-800 text-2xl">
          <span>✦</span><span>☪</span><span>✦</span>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
