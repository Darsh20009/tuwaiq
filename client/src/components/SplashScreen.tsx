import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "@assets/targeted_element_1770060379720.png";

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
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Layered Background with Logo Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d3320] via-[#1a4a35] to-[#0a2818]" />
      
      {/* Large Background Logo - Watermark Style */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 0.06, scale: 1.3, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative w-[150vw] h-[150vw] md:w-[80vw] md:h-[80vw]"
        >
          <img 
            src={logo} 
            alt="" 
            className="w-full h-full object-contain filter blur-[1px]"
          />
        </motion.div>
      </div>
      
      {/* Decorative Geometric Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 40%),
                              radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 35%)`
          }}
        />
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="absolute top-0 left-0 w-2/3 h-1 bg-gradient-to-r from-emerald-400/50 to-transparent"
        />
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="absolute bottom-0 right-0 w-2/3 h-1 bg-gradient-to-l from-emerald-400/50 to-transparent"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 max-w-lg w-full px-6">
        {/* Floating Logo with Glow */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Outer Glow Ring */}
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 60px 20px rgba(16,185,129,0.2)",
                "0 0 80px 30px rgba(16,185,129,0.3)",
                "0 0 60px 20px rgba(16,185,129,0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
          />
          
          {/* Logo Container */}
          <div className="relative bg-white rounded-full p-5 shadow-2xl">
            <img 
              src={logo} 
              alt="جمعية طويق" 
              className="w-28 h-28 md:w-36 md:h-36 object-contain"
            />
          </div>
        </motion.div>

        {/* Organization Name */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white font-heading"
          >
            جمعية طويق
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-emerald-200/80 text-lg md:text-xl font-medium"
          >
            للخدمات الإنسانية
          </motion.p>
        </div>

        {/* Elegant Loading Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full max-w-xs pt-6"
        >
          <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${loading}%` }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 rounded-full"
              style={{
                boxShadow: "0 0 20px rgba(16,185,129,0.6), 0 0 40px rgba(16,185,129,0.3)"
              }}
            />
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-emerald-200/50 text-sm mt-3 font-medium"
          >
            جاري التحميل...
          </motion.p>
        </motion.div>

        {/* Quran Verse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="pt-8"
        >
          <p className="text-white/40 text-sm text-center leading-relaxed max-w-sm">
            ﴿ وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ ﴾
          </p>
        </motion.div>
      </div>

      {/* Bottom Accent */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
      />
    </motion.div>
  );
}
