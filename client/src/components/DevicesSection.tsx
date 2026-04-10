import { motion } from "framer-motion";
import { SiVisa, SiMastercard, SiApplepay } from "react-icons/si";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

// ─── SVG Device Frames ─────────────────────────────────────────

function LaptopFrame() {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      {/* Screen body */}
      <rect x="20" y="10" width="280" height="180" rx="12" fill="#1a2332" stroke="#2d4a6b" strokeWidth="2.5"/>
      {/* Screen inner */}
      <rect x="30" y="20" width="260" height="160" rx="8" fill="#0d1821"/>
      {/* Glow inside screen */}
      <rect x="30" y="20" width="260" height="160" rx="8" fill="url(#laptopGlow)" opacity="0.7"/>
      {/* Fake browser bar */}
      <rect x="30" y="20" width="260" height="22" rx="8" fill="#152030"/>
      <rect x="30" y="28" width="260" height="14" fill="#152030"/>
      <circle cx="46" cy="31" r="5" fill="#ef4444" opacity="0.8"/>
      <circle cx="61" cy="31" r="5" fill="#f59e0b" opacity="0.8"/>
      <circle cx="76" cy="31" r="5" fill="#22c55e" opacity="0.8"/>
      <rect x="96" y="26" width="148" height="10" rx="5" fill="#1e3248"/>
      {/* Logo inside screen */}
      <text x="160" y="105" textAnchor="middle" fontSize="13" fontWeight="bold" fill="rgba(255,255,255,0.15)" fontFamily="system-ui">tuwaiq.org</text>
      {/* Green nav bar */}
      <rect x="30" y="42" width="260" height="28" fill="#1e4d3a" opacity="0.9"/>
      <rect x="42" y="52" width="40" height="8" rx="4" fill="#4ade80" opacity="0.5"/>
      <rect x="96" y="52" width="30" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
      <rect x="134" y="52" width="30" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
      {/* Card blocks */}
      <rect x="42" y="80" width="80" height="55" rx="8" fill="#1e4d3a" opacity="0.6"/>
      <rect x="132" y="80" width="80" height="55" rx="8" fill="#1e3a4d" opacity="0.6"/>
      <rect x="222" y="80" width="58" height="55" rx="8" fill="#3d2a1e" opacity="0.6"/>
      <rect x="42" y="145" width="238" height="20" rx="6" fill="#1a3a2a" opacity="0.5"/>
      {/* Hinge */}
      <rect x="20" y="190" width="280" height="6" rx="2" fill="#1a2332"/>
      {/* Base */}
      <path d="M0 196 Q10 200 20 196 L20 210 Q10 216 0 210 Z" fill="#152030"/>
      <path d="M320 196 Q310 200 300 196 L300 210 Q310 216 320 210 Z" fill="#152030"/>
      <rect x="20" y="196" width="280" height="16" rx="2" fill="#1a2a3a"/>
      <rect x="120" y="205" width="80" height="4" rx="2" fill="#0d1821"/>
      <defs>
        <linearGradient id="laptopGlow" x1="160" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.04"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function TabletFrame() {
  return (
    <svg viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      {/* Body */}
      <rect x="4" y="4" width="152" height="212" rx="16" fill="#1a2332" stroke="#2d4a6b" strokeWidth="2"/>
      {/* Screen */}
      <rect x="12" y="20" width="136" height="172" rx="8" fill="#0d1821"/>
      <rect x="12" y="20" width="136" height="172" rx="8" fill="url(#tabletGlow)" opacity="0.8"/>
      {/* Status bar */}
      <rect x="12" y="20" width="136" height="18" rx="4" fill="#152030"/>
      <rect x="12" y="30" width="136" height="8" fill="#152030"/>
      <rect x="20" y="25" width="20" height="6" rx="3" fill="#1e3248"/>
      <rect x="114" y="25" width="26" height="6" rx="3" fill="#1e3248"/>
      {/* Notch */}
      <rect x="64" y="4" width="32" height="10" rx="3" fill="#152030"/>
      {/* Green header */}
      <rect x="12" y="38" width="136" height="24" fill="#1e4d3a" opacity="0.9"/>
      <rect x="20" y="46" width="28" height="8" rx="4" fill="#4ade80" opacity="0.6"/>
      {/* Cards */}
      <rect x="18" y="72" width="58" height="65" rx="8" fill="#1e4d3a" opacity="0.55"/>
      <rect x="84" y="72" width="58" height="65" rx="8" fill="#1e3a4d" opacity="0.55"/>
      <rect x="18" y="146" width="124" height="16" rx="6" fill="#22c55e" opacity="0.25"/>
      <rect x="18" y="170" width="58" height="12" rx="4" fill="#1e3248" opacity="0.6"/>
      <rect x="84" y="170" width="58" height="12" rx="4" fill="#1e3248" opacity="0.6"/>
      {/* Home button */}
      <circle cx="80" cy="204" r="7" stroke="#2d4a6b" strokeWidth="1.5"/>
      <defs>
        <linearGradient id="tabletGlow" x1="80" y1="20" x2="80" y2="192" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function PhoneFrame() {
  return (
    <svg viewBox="0 0 100 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      {/* Body */}
      <rect x="3" y="3" width="94" height="204" rx="20" fill="#1a2332" stroke="#2d4a6b" strokeWidth="2"/>
      {/* Screen */}
      <rect x="8" y="14" width="84" height="180" rx="14" fill="#0d1821"/>
      <rect x="8" y="14" width="84" height="180" rx="14" fill="url(#phoneGlow)" opacity="0.9"/>
      {/* Dynamic island */}
      <rect x="32" y="20" width="36" height="10" rx="5" fill="#0a1420"/>
      {/* Status bar */}
      <rect x="16" y="35" width="25" height="5" rx="2.5" fill="#1e3248" opacity="0.8"/>
      <rect x="68" y="35" width="16" height="5" rx="2.5" fill="#1e3248" opacity="0.8"/>
      {/* Green header */}
      <rect x="8" y="45" width="84" height="20" fill="#1e4d3a" opacity="0.95"/>
      <rect x="16" y="51" width="20" height="8" rx="4" fill="#4ade80" opacity="0.7"/>
      {/* Cards */}
      <rect x="14" y="72" width="72" height="55" rx="10" fill="#1e4d3a" opacity="0.6"/>
      <rect x="22" y="82" width="56" height="8" rx="4" fill="#22c55e" opacity="0.3"/>
      <rect x="22" y="96" width="40" height="6" rx="3" fill="rgba(255,255,255,0.1)"/>
      <rect x="14" y="136" width="34" height="45" rx="8" fill="#1e3a4d" opacity="0.55"/>
      <rect x="54" y="136" width="32" height="45" rx="8" fill="#3d2a1e" opacity="0.55"/>
      {/* Pay button */}
      <rect x="14" y="152" width="72" height="22" rx="11" fill="#22c55e" opacity="0.2"/>
      <rect x="16" y="153" width="68" height="20" rx="10" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.4"/>
      {/* Home indicator */}
      <rect x="35" y="198" width="30" height="4" rx="2" fill="#2d4a6b"/>
      {/* Side buttons */}
      <rect x="0" y="60" width="3" height="20" rx="1.5" fill="#2d4a6b"/>
      <rect x="97" y="55" width="3" height="14" rx="1.5" fill="#2d4a6b"/>
      <rect x="97" y="74" width="3" height="14" rx="1.5" fill="#2d4a6b"/>
      <defs>
        <linearGradient id="phoneGlow" x1="50" y1="14" x2="50" y2="194" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.06"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Main Section ──────────────────────────────────────────────

export function DevicesSection() {
  return (
    <section className="relative py-24 overflow-hidden" dir="rtl"
      style={{ background: "linear-gradient(160deg, hsl(210 35% 8%) 0%, hsl(152 40% 10%) 50%, hsl(210 35% 8%) 100%)" }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, hsl(152 60% 30%) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">

        {/* Headline */}
        <motion.div {...fadeUp()} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 border"
            style={{ backgroundColor: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.25)", color: "#4ade80" }}>
            تجربة سلسة في كل مكان
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-heading text-white mb-4 leading-tight">
            متوافق مع كل الأجهزة
          </h2>
          <p className="text-lg md:text-xl font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
            تبرعك صار أسهل
          </p>
        </motion.div>

        {/* Devices */}
        <div className="flex items-end justify-center gap-4 md:gap-8 flex-nowrap overflow-hidden">

          {/* Laptop */}
          <motion.div {...fadeUp(0.1)} className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-[260px] md:w-[320px]">
              <LaptopFrame />
            </div>
            <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              حاسوب
            </span>
          </motion.div>

          {/* Tablet */}
          <motion.div {...fadeUp(0.2)} className="flex flex-col items-center gap-4 shrink-0 mb-8">
            <div className="w-[100px] md:w-[130px]">
              <TabletFrame />
            </div>
            <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              آيباد
            </span>
          </motion.div>

          {/* Phone */}
          <motion.div {...fadeUp(0.3)} className="flex flex-col items-center gap-4 shrink-0 mb-14">
            <div className="w-[65px] md:w-[85px]">
              <PhoneFrame />
            </div>
            <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              جوال
            </span>
          </motion.div>

        </div>

        {/* Divider */}
        <motion.div {...fadeUp(0.4)} className="mt-16 mb-10 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
            طرق الدفع المتاحة
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </motion.div>

        {/* Payment logos */}
        <motion.div {...fadeUp(0.5)} className="flex flex-wrap items-center justify-center gap-6 md:gap-10">

          {/* Apple Pay */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-20 h-12 rounded-xl px-3"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <SiApplepay className="text-white" style={{ fontSize: "42px" }} />
            </div>
            <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>Apple Pay</span>
          </div>

          {/* Visa */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-20 h-12 rounded-xl px-3"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <SiVisa className="text-blue-300" style={{ fontSize: "36px" }} />
            </div>
            <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>Visa</span>
          </div>

          {/* Mastercard */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-20 h-12 rounded-xl px-3"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <SiMastercard style={{ fontSize: "36px", color: "#f97316" }} />
            </div>
            <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>Mastercard</span>
          </div>

          {/* Mada */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-20 h-12 rounded-xl px-4"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <svg viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg" width="58" height="22">
                <text x="40" y="22" textAnchor="middle" fontSize="18" fontWeight="900"
                  fontFamily="system-ui, sans-serif" fill="white" letterSpacing="1">mada</text>
              </svg>
            </div>
            <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>مدى</span>
          </div>

          {/* Bank Transfer */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-20 h-12 rounded-xl px-3"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <svg viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="30">
                <rect x="4" y="12" width="32" height="16" rx="3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                <path d="M4 18h32" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                <path d="M20 4 L36 12 H4 Z" fill="rgba(255,255,255,0.5)"/>
                <rect x="14" y="20" width="5" height="6" rx="1" fill="rgba(255,255,255,0.4)"/>
                <rect x="21" y="20" width="5" height="6" rx="1" fill="rgba(255,255,255,0.4)"/>
              </svg>
            </div>
            <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>تحويل بنكي</span>
          </div>

        </motion.div>

        {/* SSL badge */}
        <motion.div {...fadeUp(0.6)} className="text-center mt-10">
          <span className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full"
            style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "rgba(34,197,94,0.7)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 1a4 4 0 00-4 4v1H3a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V7a1 1 0 00-1-1h-1V5a4 4 0 00-4-4zm2 5V5a2 2 0 10-4 0v1h4z"/>
            </svg>
            مدفوعات مشفّرة بـ SSL 256-bit — آمن 100%
          </span>
        </motion.div>

      </div>
    </section>
  );
}
