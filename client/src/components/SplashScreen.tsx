import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "@assets/image_1770243307526.png";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoading((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 25);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#041a11]"
    >
      {/* Luxurious Gold/Emerald Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0d3320] via-[#041a11] to-[#020d08]" />
      
      {/* Animated Light Rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-[100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(16,185,129,0.1)_180deg,transparent_360deg)]"
        />
      </div>

      {/* Decorative Gold Border Elements */}
      <div className="absolute inset-12 border border-emerald-500/10 rounded-[2rem] pointer-events-none" />
      <div className="absolute inset-16 border border-emerald-500/5 rounded-[1.5rem] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center space-y-12">
        {/* Centered Logo with Premium Effects */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative group"
        >
          {/* Multi-layered Glow */}
          <div className="absolute -inset-8 bg-emerald-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute -inset-4 bg-emerald-400/10 rounded-full blur-2xl" />
          
          {/* Logo with White/Gold Frame */}
          <div className="relative p-1 rounded-full bg-gradient-to-b from-emerald-400/30 to-transparent">
            <div className="bg-white rounded-full p-6 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
              <motion.img 
                src={logo} 
                alt="طويق" 
                className="w-32 h-32 md:w-44 md:h-44 object-contain"
                animate={{ 
                  filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>

        {/* Text Typography */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.1em" }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white font-heading tracking-widest drop-shadow-2xl">
              طويق
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-emerald-500/50" />
            <span className="text-emerald-400 text-xl md:text-2xl font-light tracking-[0.3em] uppercase">
              الخدمات الإنسانية
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-emerald-500/50" />
          </motion.div>
        </div>

        {/* Minimalist Loading */}
        <div className="w-64 space-y-3">
          <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${loading}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600"
            />
          </div>
          <motion.p 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center text-emerald-500/40 text-[10px] tracking-[0.2em] font-medium"
          >
            جاري تهيئة النظام
          </motion.p>
        </div>

        {/* Quran Verse with Premium Styling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="pt-4"
        >
          <p className="text-emerald-100/30 text-sm text-center italic font-serif leading-relaxed max-w-xs">
            ﴿ وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ ﴾
          </p>
        </motion.div>
      </div>
    </motion.div>

  );
}
