import { motion } from "framer-motion";
import { useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const phoneNumber = "966505793012";
  const message = encodeURIComponent("السلام عليكم، أود الاستفسار عن خدماتكم");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[min(18rem,calc(100vw-2rem))] mb-2"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <SiWhatsapp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">طويق للخدمات الإنسانية</p>
                <p className="text-xs text-emerald-600">متاح الآن</p>
              </div>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              مرحباً بكم! 👋
              <br />
              كيف يمكننا مساعدتكم اليوم؟
            </p>
          </div>
          
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            ابدأ المحادثة
          </a>
          
          <p className="text-center text-xs text-gray-400 mt-2">
            نرد عادة خلال دقائق
          </p>
        </motion.div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative group"
        data-testid="button-whatsapp-floating"
      >
        <div className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white pl-4 pr-3 py-3 rounded-full shadow-lg transition-colors duration-200">
          <span className="text-sm font-bold hidden sm:block">تواصل معنا</span>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <SiWhatsapp className="w-5 h-5" />
          </div>
        </div>
      </button>
    </div>
  );
}
