import { motion, AnimatePresence } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";

export function WhatsAppButton() {
  const phoneNumber = "+966505793012";
  const message = encodeURIComponent("السلام عليكم، أود الاستفسار عن خدماتكم");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: 2,
        type: "spring",
        stiffness: 260,
        damping: 20 
      }}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
    >
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-3 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 p-2 pr-4 rounded-full shadow-2xl border border-emerald-100 dark:border-emerald-900/50 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-whatsapp-floating"
      >
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-muted-foreground font-medium leading-none mb-1">نسعد بخدمتكم</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">تواصل معنا</span>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 group-hover:opacity-40" />
          <div className="relative bg-emerald-500 text-white p-2.5 rounded-full shadow-lg transition-transform group-hover:rotate-12">
            <SiWhatsapp className="w-5 h-5" />
          </div>
        </div>
      </motion.a>
    </motion.div>
  );
}
