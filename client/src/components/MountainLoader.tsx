import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function MountainLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mountain-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(160deg, hsl(152 50% 8%) 0%, hsl(152 45% 16%) 40%, hsl(152 40% 26%) 100%)" }}
        >
          {/* Stars */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 2.5 + 0.5,
                  height: Math.random() * 2.5 + 0.5,
                  top: `${Math.random() * 65}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{ opacity: [0.1, 0.9, 0.1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8 + Math.random() * 2.5,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>

          {/* Moon */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 72,
              height: 72,
              top: "10%",
              right: "18%",
              background: "radial-gradient(circle at 35% 35%, #fffdf0 0%, #e8f5e9 40%, #a5d6a7 100%)",
              boxShadow: "0 0 40px rgba(200,255,220,0.5), 0 0 80px rgba(200,255,220,0.2)",
            }}
            initial={{ opacity: 0, scale: 0.4, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.15, ease: "easeOut" }}
          />

          {/* Crescent shadow on moon */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 72,
              height: 72,
              top: "10%",
              right: "18%",
              background: "radial-gradient(circle at 65% 35%, hsl(152 45% 12% / 0.45) 40%, transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.5 }}
          />

          {/* Far mountains — very slow, faint */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            transition={{ duration: 1.4, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <svg viewBox="0 0 1440 420" preserveAspectRatio="none" className="w-full" style={{ height: 420, display: "block" }}>
              <path
                d="M0,420 L0,300 Q80,180 180,260 Q280,340 380,200 Q480,60 580,180 Q680,300 780,140 Q880,-20 980,120 Q1080,260 1180,160 Q1280,60 1440,210 L1440,420 Z"
                fill="rgba(255,255,255,0.04)"
              />
              <path
                d="M0,420 L0,320 Q120,220 240,290 Q360,360 480,240 Q600,120 720,210 Q840,300 960,170 Q1080,40 1200,180 Q1320,300 1440,240 L1440,420 Z"
                fill="rgba(255,255,255,0.035)"
              />
            </svg>
          </motion.div>

          {/* Back mountains */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            initial={{ y: 260 }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <svg viewBox="0 0 1440 360" preserveAspectRatio="none" className="w-full" style={{ height: 360, display: "block" }}>
              <path
                d="M0,360 L0,280 Q100,180 220,240 Q340,300 460,190 Q580,80 700,170 Q820,260 940,130 Q1060,-10 1180,110 Q1300,230 1440,190 L1440,360 Z"
                fill="hsl(152 42% 20% / 0.9)"
              />
            </svg>
          </motion.div>

          {/* Mid mountains */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            transition={{ duration: 1.05, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="w-full" style={{ height: 300, display: "block" }}>
              <path
                d="M0,300 L0,240 Q60,160 130,210 Q200,260 280,160 Q360,60 460,140 Q560,220 660,100 Q760,-20 860,100 Q960,220 1060,120 Q1160,20 1270,130 Q1350,200 1440,150 L1440,300 Z"
                fill="hsl(152 44% 15% / 1)"
              />
            </svg>
          </motion.div>

          {/* Front mountains */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            initial={{ y: 360 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.95, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <svg viewBox="0 0 1440 240" preserveAspectRatio="none" className="w-full" style={{ height: 240, display: "block" }}>
              <path
                d="M0,240 L0,210 Q35,165 70,192 Q105,220 150,165 Q195,110 250,155 Q305,200 370,130 Q435,60 510,115 Q585,170 660,80 Q735,-10 820,85 Q905,180 990,95 Q1075,10 1160,110 Q1220,175 1295,130 Q1355,95 1440,140 L1440,240 Z"
                fill="hsl(152 46% 10% / 1)"
              />
              <ellipse cx="720" cy="238" rx="820" ry="16" fill="rgba(255,255,255,0.03)" />
            </svg>
          </motion.div>

          {/* Mist layer */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: "60px",
              background: "linear-gradient(to top, hsl(152 46% 10% / 0.6), transparent)",
            }}
          />

          {/* Logo + Text */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-5 mb-24"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45 }}
          >
            <motion.div
              className="relative"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            >
              <div
                className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  border: "2px solid rgba(255,255,255,0.25)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
                }}
              >
                <img
                  src="/images/logo.jpeg"
                  alt="طويق"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute -inset-2 rounded-3xl opacity-30 blur-xl"
                style={{ background: "hsl(152 60% 50% / 0.4)" }}
              />
            </motion.div>

            <div className="text-center">
              <motion.p
                className="text-white font-black text-2xl tracking-wide"
                style={{ fontFamily: "Cairo, Tajawal, sans-serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                جمعية طويق
              </motion.p>
              <motion.p
                className="text-white/65 text-sm mt-1 tracking-widest"
                style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                للخدمات الإنسانية
              </motion.p>
              <motion.div
                className="flex items-center justify-center gap-2 mt-3"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <div className="h-px bg-white/20 w-12" />
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <div className="h-px bg-white/20 w-12" />
              </motion.div>
            </div>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            className="absolute bottom-14 flex items-center gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.1, delay }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
