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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-white/80 backdrop-blur-xl"
    >
      {/* Centered Logo */}
      <div className="relative z-10 flex flex-col items-center space-y-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative group"
        >
          <div className="relative p-1 rounded-full bg-emerald-500/10">
            <div className="bg-white rounded-full p-6 shadow-xl">
              <motion.img 
                src={logo} 
                alt="الجمعية" 
                className="w-32 h-32 md:w-44 md:h-44 object-contain"
                animate={{ 
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>

        {/* Minimalist Loading */}
        <div className="w-64 space-y-3">
          <div className="h-[2px] w-full bg-emerald-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${loading}%` }}
              className="h-full bg-emerald-600"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
