import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "@assets/targeted_element_1770060379720.png";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoading((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 800);
          return 100;
        }
        return prev + 1;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#1a4731] via-[#2d5a42] to-[#1a4731] overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center space-y-8 max-w-md w-full px-8">
        {/* Logo Container with Elevation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-3xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10">
            <img 
              src={logo} 
              alt="Twaq Logo" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
            />
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white font-heading tracking-tight"
          >
            طويق
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-white/70 text-lg md:text-xl font-medium tracking-wide"
          >
            للخدمات الإنسانية
          </motion.p>
        </div>

        {/* Creative Loading Section */}
        <div className="w-full space-y-4 pt-8">
          <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${loading}%` }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/40 via-white to-white/40 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            />
          </div>
          
          <div className="flex justify-between items-center text-white/40 text-xs font-mono tracking-widest uppercase">
            <span>Loading Experience</span>
            <span className="text-white/60 font-bold">{loading}%</span>
          </div>
        </div>

        {/* Decorative Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-white/30 text-sm font-medium pt-12 italic"
        >
          ( وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ )
        </motion.p>
      </div>
      
      {/* Golden Highlight Line */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 1.5, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
    </motion.div>
  );
}
