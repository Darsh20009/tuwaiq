import React, { useState, useEffect } from "react";
import { Heart, HandHeart, ShieldCheck, Users, Droplets, BookOpen, Stethoscope, Gift, ArrowLeft } from "lucide-react";

const QUOTES = [
  "مَثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ",
  "الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ",
  "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
  "كُلُّ امْرِئٍ فِي ظِلِّ صَدَقَتِهِ حَتَّى يُقْضَى بَيْنَ النَّاسِ",
  "أَفْضَلُ الصَّدَقَةِ جُهْدُ الْمُقِلِّ"
];

const AMOUNTS = [50, 100, 200, 500, 1000];

const CATEGORIES = [
  { id: "food", label: "السلال الغذائية", icon: Gift },
  { id: "medical", label: "العلاج الطبي", icon: Stethoscope },
  { id: "education", label: "كفالة التعليم", icon: BookOpen },
  { id: "water", label: "سقيا الماء", icon: Droplets },
  { id: "orphans", label: "كفالة الأيتام", icon: Users },
];

export default function SpiritualJourney() {
  const [activeQuote, setActiveQuote] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("food");
  const [donorName, setDonorName] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  return (
    <div dir="rtl" className="min-h-[100dvh] flex flex-col font-sans relative overflow-hidden" style={{ backgroundColor: "#06140d", color: "#f8f9fa" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap');

        .font-amiri { font-family: 'Amiri', serif; }
        .font-tajawal { font-family: 'Tajawal', sans-serif; }

        .glow-text {
          text-shadow: 0 0 30px rgba(212, 175, 55, 0.6);
        }

        .lantern-glow {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(6, 20, 13, 0) 65%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: breathe 8s ease-in-out infinite alternate;
        }

        @keyframes breathe {
          0% { transform: scale(1) translate(-50%, -50%); opacity: 0.7; }
          100% { transform: scale(1.15) translate(-50%, -50%); opacity: 1; }
        }

        .gold-border {
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .gold-border-active {
          border: 1px solid rgba(212, 175, 55, 0.8);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.15), inset 0 0 15px rgba(212, 175, 55, 0.05);
        }

        .btn-gold {
          background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%);
          color: #06140d;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-gold:hover {
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
        }

        .noise-bg {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          z-index: 50;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        /* Subtle repeating pattern */
        .islamic-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4af37' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
          z-index: 0;
          pointer-events: none;
        }
      `}} />

      <div className="noise-bg" />
      <div className="islamic-pattern" />

      {/* Decorative Glows - position shifted slightly for better balance */}
      <div className="lantern-glow top-[10%] left-[50%]" />
      <div className="lantern-glow bottom-[-20%] right-[-10%]" style={{ animationDelay: '-4s' }} />

      {/* Navbar */}
      <nav className="relative z-10 w-full py-6 px-6 md:px-12 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#aa8c2c] flex items-center justify-center text-[#06140d]">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-tajawal font-bold text-lg text-[#d4af37] tracking-wide">جمعية طويق</h1>
            <p className="text-[10px] text-white/50 font-tajawal tracking-wider">للخدمات الإنسانية</p>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-tajawal text-white/60">
          <a href="#" className="hover:text-[#d4af37] transition-colors">عن الجمعية</a>
          <a href="#" className="hover:text-[#d4af37] transition-colors">مشاريعنا</a>
          <a href="#" className="hover:text-[#d4af37] transition-colors">التقارير</a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center py-12 px-4 md:px-8">
        
        {/* Sacred Quote Header */}
        <div className="w-full max-w-4xl mx-auto text-center mb-16 mt-8 h-32 flex flex-col items-center justify-center relative">
          {QUOTES.map((quote, idx) => (
            <div 
              key={idx} 
              className={`absolute transition-all duration-1000 ease-in-out w-full px-4 ${
                idx === activeQuote ? 'opacity-100 transform-none z-10' : 'opacity-0 translate-y-4 -z-10'
              }`}
            >
              <p className="font-amiri text-2xl md:text-4xl lg:text-5xl leading-relaxed text-[#d4af37] glow-text">
                "{quote}"
              </p>
            </div>
          ))}
        </div>

        {/* Donation Form Container */}
        <div className="w-full max-w-xl mx-auto bg-[#0a1f14]/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 gold-border shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>

          <h2 className="font-tajawal text-2xl text-center mb-8 font-medium text-white/90">
            اختر مسار عطائك
          </h2>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
                  selectedCategory === cat.id 
                    ? 'bg-[#d4af37]/10 gold-border-active text-[#d4af37]' 
                    : 'bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white/90 hover:border-white/20'
                }`}
              >
                <cat.icon className="w-6 h-6 mb-3 stroke-[1.5]" />
                <span className="text-xs font-tajawal">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#d4af37]"></div>
            <div className="w-2 h-2 rotate-45 bg-[#d4af37]"></div>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#d4af37]"></div>
          </div>

          {/* Amount Selection */}
          <h3 className="font-tajawal text-sm text-white/70 mb-4 text-center">مبلغ التبرع (ر.س)</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {AMOUNTS.map(amount => (
              <button
                key={amount}
                onClick={() => handleAmountClick(amount)}
                className={`py-3.5 rounded-2xl font-tajawal font-bold text-lg transition-all duration-300 ${
                  selectedAmount === amount
                    ? 'bg-gradient-to-b from-[#d4af37] to-[#b8952b] text-[#06140d] shadow-[0_4px_20px_rgba(212,175,55,0.4)] transform -translate-y-1'
                    : 'bg-white/5 border border-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {amount}
              </button>
            ))}
          </div>

          <div className="relative mb-10">
            <input
              type="number"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="أو أدخل مبلغاً آخر..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-tajawal outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all text-center text-lg placeholder:text-white/30"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#d4af37] font-tajawal text-sm">ر.س</span>
          </div>

          {/* Optional Name */}
          <div className="mb-10">
             <label className="block font-tajawal text-sm text-white/60 mb-3 text-center">اسم المتبرع (اختياري)</label>
             <input
              type="text"
              value={donorName}
              onChange={e => setDonorName(e.target.value)}
              placeholder="فاعل خير"
              className="w-full bg-transparent border-b border-white/10 py-3 px-2 text-white font-tajawal outline-none focus:border-[#d4af37]/50 transition-colors text-center placeholder:text-white/20"
            />
          </div>

          {/* Submit */}
          <button className="w-full btn-gold rounded-2xl py-5 font-tajawal font-bold text-lg flex items-center justify-center gap-3 group relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10">إتمام التبرع بالخير</span>
            <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />
          </button>

          {/* Trust Signals */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-center gap-6 md:gap-8 opacity-70">
            <div className="flex items-center gap-2 text-sm font-tajawal text-white/80">
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              <span>دفع آمن 100%</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-tajawal text-white/80">
              <HandHeart className="w-4 h-4 text-[#d4af37]" />
              <span>شهادة تبرع</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-tajawal text-white/80">
              <Users className="w-4 h-4 text-[#d4af37]" />
              <span>+8,350 مستفيد</span>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 text-center border-t border-white/5 mt-auto bg-[#06140d]/80 backdrop-blur-md">
        <p className="font-tajawal text-white/30 text-xs md:text-sm tracking-wide">
          جمعية طويق للخدمات الإنسانية © {new Date().getFullYear()} — مسجلة بوزارة الموارد البشرية برقم 6573
        </p>
      </footer>
    </div>
  );
}
