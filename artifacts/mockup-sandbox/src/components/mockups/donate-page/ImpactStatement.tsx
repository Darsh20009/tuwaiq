import React, { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Users, BadgeCheck, Activity, HandHeart, Droplet, BookOpen, Stethoscope, Baby } from 'lucide-react';

export function ImpactStatement() {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('food');
  const [donorName, setDonorName] = useState<string>('');

  const AMOUNTS = [50, 100, 200, 500, 1000];

  const CATEGORIES = [
    { id: 'food', label: 'سلال غذائية', icon: HandHeart },
    { id: 'water', label: 'سقيا الماء', icon: Droplet },
    { id: 'education', label: 'دعم التعليم', icon: BookOpen },
    { id: 'medical', label: 'العلاج الطبي', icon: Stethoscope },
    { id: 'orphans', label: 'كفالة الأيتام', icon: Baby },
  ];

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    if (val) setAmount(Number(val));
    else setAmount(0);
  };

  const [counter, setCounter] = useState(1247380);
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => prev + Math.floor(Math.random() * 80) + 10);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1510] text-white font-sans selection:bg-[#1a4a33] selection:text-white" dir="rtl">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 25px -5px rgba(41, 102, 71, 0.4); }
          50% { box-shadow: 0 0 40px 10px rgba(41, 102, 71, 0.7); }
        }
        @keyframes rotateText {
          0%, 20% { transform: translateY(0); opacity: 1; }
          25%, 45% { transform: translateY(-25%); opacity: 1; }
          50%, 70% { transform: translateY(-50%); opacity: 1; }
          75%, 95% { transform: translateY(-75%); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pulse-btn { animation: pulseGlow 3s infinite; }
        .ticker-wrap {
          height: 3rem;
          overflow: hidden;
          position: relative;
        }
        .ticker-content {
          animation: rotateText 16s infinite cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .text-gradient {
          background: linear-gradient(135deg, #ffffff 0%, #a0e0c0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}} />

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b-0 border-white/5">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(152,42%,28%)] flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(41,102,71,0.5)]">
              ط
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-wide">جمعية طويق</h1>
              <p className="text-[11px] text-[#a0e0c0]">للخدمات الإنسانية</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-white transition-colors">عن الجمعية</a>
            <a href="#" className="hover:text-white transition-colors">المشاريع</a>
            <a href="#" className="hover:text-white transition-colors">الأثر</a>
            <a href="#" className="hover:text-white transition-colors">التقارير</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-24 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Deep Forest Ambient Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[hsl(152,42%,28%)] opacity-20 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[0%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#102a1e] opacity-50 blur-[120px] pointer-events-none" />
        
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left/Hero Side */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(152,42%,28%)]/20 text-[#a0e0c0] text-xs font-bold w-fit mb-8 border border-[hsl(152,42%,28%)]/50 uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5" />
              <span>مباشر: نبض العطاء</span>
            </div>

            <h2 className="text-5xl md:text-7xl lg:text-[5rem] font-black mb-6 leading-[1.1] tracking-tight">
              أثرك <span className="text-gradient">أكبر</span><br />
              مما تتخيل
            </h2>

            <p className="text-xl text-white/50 mb-10 max-w-lg leading-relaxed font-light">
              تبرعك الآن يترجم فوراً إلى حياة أفضل. كن جزءاً من هذا الأثر المستمر.
            </p>

            {/* Live Counter */}
            <div className="mb-10 p-8 rounded-[2.5rem] bg-[#0f1d16] border border-white/5 relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-[hsl(152,42%,28%)] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700" />
              <p className="text-white/40 text-sm mb-3 font-semibold uppercase tracking-wider">إجمالي التبرعات اليوم</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl md:text-7xl font-bold tracking-tighter tabular-nums font-mono text-[#a0e0c0]">
                  {counter.toLocaleString()}
                </span>
                <span className="text-2xl text-white/40 font-medium">ريال</span>
              </div>
            </div>

            {/* Impact Ticker */}
            <div className="mb-10">
              <p className="text-white/30 text-xs mb-4 font-semibold uppercase tracking-widest pl-2">الأثر المباشر لتبرعك</p>
              <div className="ticker-wrap">
                <div className="ticker-content flex flex-col h-[12rem]">
                  <div className="h-12 flex items-center text-xl md:text-2xl font-light text-white/80">
                    <span className="text-[#a0e0c0] font-bold ml-3 bg-[hsl(152,42%,28%)]/30 px-3 py-1 rounded-lg">كل 100 ريال</span> = سلة غذائية كاملة لأسرة
                  </div>
                  <div className="h-12 flex items-center text-xl md:text-2xl font-light text-white/80">
                    <span className="text-[#a0e0c0] font-bold ml-3 bg-[hsl(152,42%,28%)]/30 px-3 py-1 rounded-lg">كل 50 ريال</span> = كتب دراسية لطالب
                  </div>
                  <div className="h-12 flex items-center text-xl md:text-2xl font-light text-white/80">
                    <span className="text-[#a0e0c0] font-bold ml-3 bg-[hsl(152,42%,28%)]/30 px-3 py-1 rounded-lg">كل 500 ريال</span> = بئر ماء في قرية نائية
                  </div>
                  <div className="h-12 flex items-center text-xl md:text-2xl font-light text-white/80">
                    <span className="text-[#a0e0c0] font-bold ml-3 bg-[hsl(152,42%,28%)]/30 px-3 py-1 rounded-lg">كل 200 ريال</span> = علاج طبي لمريض محتاج
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block mt-4">
              <p className="text-3xl font-serif italic text-white/30 leading-relaxed font-black opacity-80 mix-blend-screen">
                "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ"
              </p>
            </div>
          </div>

          {/* Right/Donation Form Side */}
          <div className="lg:col-span-6 xl:col-span-5 relative z-20">
            <div className="bg-[#12221a]/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] animate-slide-up" style={{ animationDelay: '0.15s' }}>
              
              {/* Category Selection */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-white/80 mb-4">أين تريد أن تضع أثرك؟</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                          isSelected 
                            ? 'bg-[hsl(152,42%,28%)] border-[#a0e0c0]/30 text-white shadow-lg' 
                            : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-3 transition-transform ${isSelected ? 'text-[#a0e0c0] scale-110' : 'text-white/30'}`} />
                        <span className="text-xs font-bold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Selection */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-white/80 mb-4">مبلغ التبرع</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                  {AMOUNTS.map((val) => (
                    <button
                      key={val}
                      onClick={() => handleAmountSelect(val)}
                      className={`py-4 rounded-2xl font-bold text-lg border transition-all duration-300 ${
                        amount === val && !customAmount
                          ? 'bg-white text-[#0a1510] border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                          : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="أو أدخل مبلغاً آخر..."
                    className="w-full bg-[#0a1510]/50 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-[hsl(152,42%,28%)] focus:ring-1 focus:ring-[hsl(152,42%,28%)] transition-all"
                  />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 font-bold">
                    ريال
                  </div>
                </div>
              </div>

              {/* Optional Donor Info */}
              <div className="mb-10">
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="اسم المتبرع (اختياري، يترك فارغاً لفاعل خير)"
                  className="w-full bg-[#0a1510]/50 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(152,42%,28%)] transition-all text-sm"
                />
              </div>

              {/* Submit Button */}
              <button className="w-full bg-[hsl(152,42%,28%)] hover:bg-[#1a4a33] text-white font-black text-2xl py-6 rounded-2xl transition-all duration-300 animate-pulse-btn flex items-center justify-center gap-4 group">
                <span>تبرع الآن وأحدث أثراً</span>
                <Heart className="w-7 h-7 text-[#a0e0c0] group-hover:scale-110 transition-transform" fill="currentColor" />
              </button>

              {/* Trust Signals */}
              <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-white/30" />
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-wide">دفع آمن 100%</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <Users className="w-5 h-5 text-white/30" />
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-wide">+8,350 مستفيد</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <BadgeCheck className="w-5 h-5 text-white/30" />
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-wide">شهادة تبرع</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a1510] py-16 mt-12 relative z-10">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[hsl(152,42%,28%)]/10 text-[hsl(152,42%,28%)] flex items-center justify-center font-black text-3xl mb-6">
            ط
          </div>
          <h3 className="font-bold text-xl mb-3 text-white/90">جمعية طويق للخدمات الإنسانية</h3>
          <p className="text-sm text-white/40 mb-8 max-w-md mx-auto leading-relaxed">
            جمعية خيرية سعودية مرخصة. نسعى لبناء مجتمع متكافل ومترابط من خلال تقديم الخدمات الإنسانية النوعية للمحتاجين.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-white/30 mb-8 font-medium">
            <span>ترخيص رقم: 6573</span>
            <span className="hidden sm:inline">•</span>
            <span>الرياض، المملكة العربية السعودية</span>
          </div>
          <p className="text-[10px] text-white/20 uppercase tracking-widest">
            © {new Date().getFullYear()} جمعية طويق للخدمات الإنسانية
          </p>
        </div>
      </footer>

    </div>
  );
}
