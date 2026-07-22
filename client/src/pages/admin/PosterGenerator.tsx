import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download, Printer, ArrowRight, Sparkles,
  Droplet, Utensils, Moon, Share2, RefreshCw, Heart, Baby
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

const TEMPLATES = [
  {
    id: "water",
    name: "سقيا الماء",
    icon: Droplet,
    emoji: "💧",
    bg: "linear-gradient(160deg, #0a2a4a 0%, #0d4a7a 40%, #0a6a9a 70%, #0a5a8a 100%)",
    accentColor: "#00d4ff",
    accentGlow: "rgba(0,212,255,0.4)",
    titleColor: "#ffffff",
    subtitleColor: "rgba(0,212,255,0.9)",
    cardBg: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)",
    cardShadow: "0 12px 40px rgba(0,180,216,0.5)",
    pattern: "waves",
    footerBg: "rgba(0,0,0,0.5)",
    badgeBg: "rgba(0,212,255,0.15)",
    badgeBorder: "rgba(0,212,255,0.4)",
    defaultTitle: "سقيا الماء",
    defaultSubtitle: "قال رسول الله ﷺ\n«أفضل الصدقة سقى الماء»",
    defaultTiers: [
      { label: "سهم الفرد", amount: "50 ريال" },
      { label: "سهم الوالدين", amount: "100 ريال" },
      { label: "شهر كامل", amount: "1,500 ريال" },
    ],
    defaultBank: "مصرف الراجحي",
    defaultIban: "SA3080 0005896080195679 23",
  },
  {
    id: "basket",
    name: "السلة الرمضانية",
    icon: Moon,
    emoji: "🌙",
    bg: "linear-gradient(160deg, #0a1a0a 0%, #0d3a1a 35%, #0a5a2a 65%, #1a4a0a 100%)",
    accentColor: "#2ecc71",
    accentGlow: "rgba(46,204,113,0.4)",
    titleColor: "#ffffff",
    subtitleColor: "rgba(46,204,113,0.9)",
    cardBg: "linear-gradient(135deg, #27ae60 0%, #1a7a40 100%)",
    cardShadow: "0 12px 40px rgba(46,204,113,0.45)",
    pattern: "stars",
    footerBg: "rgba(0,0,0,0.6)",
    badgeBg: "rgba(46,204,113,0.15)",
    badgeBorder: "rgba(46,204,113,0.4)",
    defaultTitle: "السلة الرمضانية",
    defaultSubtitle: "قال رسول الله ﷺ\n«اتقوا النار ولو بشق تمرة»",
    defaultTiers: [
      { label: "سهم الفرد", amount: "150 ريال" },
      { label: "سهم الوالدين", amount: "300 ريال" },
      { label: "سلة كاملة", amount: "750 ريال" },
    ],
    defaultBank: "البنك العربي الوطني",
    defaultIban: "SA6930 4001809581039 0018",
  },
  {
    id: "iftar",
    name: "إفطار صائم",
    icon: Utensils,
    emoji: "🕌",
    bg: "linear-gradient(160deg, #1a0a00 0%, #3d1a00 30%, #6b2d00 60%, #4a1a00 100%)",
    accentColor: "#f0c040",
    accentGlow: "rgba(240,192,64,0.45)",
    titleColor: "#f0c040",
    subtitleColor: "rgba(255,220,120,0.9)",
    cardBg: "linear-gradient(135deg, #c8860a 0%, #8a5000 100%)",
    cardShadow: "0 12px 40px rgba(240,192,64,0.4)",
    pattern: "geometric",
    footerBg: "rgba(0,0,0,0.7)",
    badgeBg: "rgba(240,192,64,0.12)",
    badgeBorder: "rgba(240,192,64,0.35)",
    defaultTitle: "إفطار صائم",
    defaultSubtitle: "قال رسول الله ﷺ\n«من فطّر صائماً كان له مثل أجره»",
    defaultTiers: [
      { label: "وجبة واحدة", amount: "15 ريال" },
      { label: "أسبوع كامل", amount: "105 ريال" },
      { label: "شهر كامل", amount: "450 ريال" },
    ],
    defaultBank: "بنك البلاد",
    defaultIban: "SA2315 0009999146128000007",
  },
  {
    id: "umrah",
    name: "كفالة عمرة",
    icon: Heart,
    emoji: "🕋",
    bg: "linear-gradient(160deg, #0d0d1a 0%, #1a1040 35%, #2d1a6a 65%, #1a0d4a 100%)",
    accentColor: "#a78bfa",
    accentGlow: "rgba(167,139,250,0.45)",
    titleColor: "#ffffff",
    subtitleColor: "rgba(167,139,250,0.9)",
    cardBg: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
    cardShadow: "0 12px 40px rgba(124,58,237,0.5)",
    pattern: "kaaba",
    footerBg: "rgba(0,0,0,0.65)",
    badgeBg: "rgba(167,139,250,0.12)",
    badgeBorder: "rgba(167,139,250,0.35)",
    defaultTitle: "كفالة عمرة",
    defaultSubtitle: "العمرة إلى العمرة كفارة لما بينهما\n«وتقبّل الله منكم ومن المعتمرين»",
    defaultTiers: [
      { label: "مساهمة", amount: "300 ريال" },
      { label: "نصف كفالة", amount: "1,500 ريال" },
      { label: "كفالة معتمر", amount: "3,000 ريال" },
    ],
    defaultBank: "مصرف الراجحي",
    defaultIban: "SA3080 0005896080195679 23",
  },
  {
    id: "orphan",
    name: "كفالة يتيم",
    icon: Baby,
    emoji: "👶",
    bg: "linear-gradient(160deg, #1a0a0d 0%, #3a1020 35%, #6a1a35 65%, #4a0d1a 100%)",
    accentColor: "#f472b6",
    accentGlow: "rgba(244,114,182,0.4)",
    titleColor: "#ffffff",
    subtitleColor: "rgba(244,114,182,0.9)",
    cardBg: "linear-gradient(135deg, #db2777 0%, #9d174d 100%)",
    cardShadow: "0 12px 40px rgba(219,39,119,0.5)",
    pattern: "hearts",
    footerBg: "rgba(0,0,0,0.65)",
    badgeBg: "rgba(244,114,182,0.12)",
    badgeBorder: "rgba(244,114,182,0.35)",
    defaultTitle: "كفالة يتيم",
    defaultSubtitle: "قال رسول الله ﷺ\n«أنا وكافل اليتيم كهاتين في الجنة»",
    defaultTiers: [
      { label: "مساهمة شهرية", amount: "100 ريال" },
      { label: "كفالة ربع سنة", amount: "350 ريال" },
      { label: "كفالة سنة كاملة", amount: "1,200 ريال" },
    ],
    defaultBank: "بنك البلاد",
    defaultIban: "SA2315 0009991461280000007",
  },
];

const RATIOS = [
  { id: "portrait", label: "عمودي 4:5", w: 600, h: 900 },
  { id: "story", label: "ستوري 9:16", w: 600, h: 1067 },
  { id: "square", label: "مربع 1:1", w: 600, h: 600 },
];

// SVG pattern overlays
function PatternOverlay({ pattern, accent }: { pattern: string; accent: string }) {
  if (pattern === "waves") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
      {[0,1,2,3,4,5,6].map(i => (
        <ellipse key={i} cx="300" cy={i * 150 - 50} rx="350" ry="80" fill="none" stroke={accent} strokeWidth="1.5" />
      ))}
    </svg>
  );
  if (pattern === "stars") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
      {[[60,80],[540,120],[100,400],[500,380],[80,720],[520,680],[300,200],[300,680],[200,550],[400,550]].map(([x,y],i) => (
        <polygon key={i} points={`${x},${y-18} ${x+6},${y-6} ${x+20},${y-6} ${x+10},${y+4} ${x+14},${y+18} ${x},${y+8} ${x-14},${y+18} ${x-10},${y+4} ${x-20},${y-6} ${x-6},${y-6}`} fill={accent} />
      ))}
    </svg>
  );
  if (pattern === "geometric") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
      {[0,1,2,3,4,5].map(row => [0,1,2,3].map(col => (
        <polygon key={`${row}-${col}`} points={`${col*160+80},${row*160+0} ${col*160+160},${row*160+80} ${col*160+80},${row*160+160} ${col*160+0},${row*160+80}`} fill="none" stroke={accent} strokeWidth="1" />
      )))}
    </svg>
  );
  if (pattern === "kaaba") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
      <circle cx="300" cy="450" r="280" fill="none" stroke={accent} strokeWidth="1" />
      <circle cx="300" cy="450" r="200" fill="none" stroke={accent} strokeWidth="1" />
      <circle cx="300" cy="450" r="120" fill="none" stroke={accent} strokeWidth="1" />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
        const rad = a * Math.PI / 180;
        return <line key={a} x1="300" y1="450" x2={300 + 280 * Math.cos(rad)} y2={450 + 280 * Math.sin(rad)} stroke={accent} strokeWidth="0.5" />;
      })}
    </svg>
  );
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
      {[0,1,2,3,4,5,6,7,8].map(i => [0,1,2,3].map(j => (
        <circle key={`${i}-${j}`} cx={j*180+90} cy={i*120+60} r={i%2===0?30:20} fill="none" stroke={accent} strokeWidth="0.8" />
      )))}
    </svg>
  );
}

export default function PosterGenerator() {
  const { toast } = useToast();
  const posterRef = useRef<HTMLDivElement>(null);
  const [tpl, setTpl] = useState(TEMPLATES[0]);
  const [ratio, setRatio] = useState(RATIOS[0]);
  const [config, setConfig] = useState({
    title: TEMPLATES[0].defaultTitle,
    subtitle: TEMPLATES[0].defaultSubtitle,
    tiers: TEMPLATES[0].defaultTiers.map(t => ({ ...t })),
    bank: TEMPLATES[0].defaultBank,
    iban: TEMPLATES[0].defaultIban,
    phone: "+966505793012",
    social: "tuwaiq_2o3o",
    regNo: "1000820300",
    license: "6573",
    website: "tuwaiqassociation.sa",
  });

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setTpl(t);
    setConfig(prev => ({
      ...prev,
      title: t.defaultTitle,
      subtitle: t.defaultSubtitle,
      tiers: t.defaultTiers.map(x => ({ ...x })),
      bank: t.defaultBank,
      iban: t.defaultIban,
    }));
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      toast({ title: "⏳ جاري التصدير بجودة عالية..." });
      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        allowTaint: true,
      });
      const link = document.createElement("a");
      link.download = `tuwaiq-${tpl.id}-${ratio.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "✅ تم التصدير بنجاح — جاهز للنشر" });
    } catch {
      toast({ title: "خطأ في التصدير", variant: "destructive" });
    }
  };

  const handleShareWA = () => {
    const text = `🤲 ساهم معنا في "${config.title}"\nجمعية طويق للخدمات الإنسانية\n${config.subtitle.replace('\n', ' ')}\n📞 ${config.phone}\n🌐 ${config.website}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const posterH = ratio.id === "portrait" ? 900 : ratio.id === "story" ? 1067 : 600;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir="rtl">
      <div className="max-w-[1500px] mx-auto p-4 md:p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-white/60 hover:text-white" />
            <Button variant="ghost" size="icon" asChild className="rounded-full text-white hover:bg-white/10">
              <a href="/admin"><ArrowRight className="h-5 w-5" /></a>
            </Button>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                منشئ البوسترات الاحترافي
              </h1>
              <p className="text-slate-400 text-xs">5 قوالب احترافية • جودة طباعة عالية • متعدد الأحجام</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleShareWA} className="border-white/20 text-white hover:bg-white/10 gap-1 rounded-xl">
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">واتساب</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="border-white/20 text-white hover:bg-white/10 gap-1 rounded-xl">
              <Printer className="w-4 h-4" /> <span className="hidden sm:inline">طباعة</span>
            </Button>
            <Button size="sm" onClick={handleDownload} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold gap-1 rounded-xl px-5 shadow-lg shadow-amber-500/30">
              <Download className="w-4 h-4" /> تحميل بجودة عالية
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">
          {/* Controls */}
          <div className="space-y-4">

            {/* Template Selector */}
            <Card className="bg-slate-800/60 border-slate-700/60 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                  <RefreshCw className="w-4 h-4 text-amber-400" /> نوع الحملة
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t)}
                      className={`p-2 rounded-xl text-center border-2 transition-all text-xs font-bold flex flex-col items-center gap-1 ${
                        tpl.id === t.id
                          ? "border-amber-400 bg-amber-400/15 text-amber-400"
                          : "border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50"
                      }`}
                    >
                      <span className="text-lg">{t.emoji}</span>
                      <span className="text-[10px] leading-tight">{t.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ratio Selector */}
            <Card className="bg-slate-800/60 border-slate-700/60 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-white font-bold text-sm">حجم البوستر</h3>
                <div className="grid grid-cols-3 gap-2">
                  {RATIOS.map((r) => (
                    <button key={r.id} onClick={() => setRatio(r)} className={`p-2 rounded-lg text-xs font-bold border-2 transition-all ${
                      ratio.id === r.id ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-slate-600 text-slate-400 hover:border-slate-500"
                    }`}>{r.label}</button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Campaign Details */}
            <Card className="bg-slate-800/60 border-slate-700/60 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-white font-bold text-sm">تفاصيل الحملة</h3>
                <div>
                  <Label className="text-slate-400 text-xs mb-1 block">العنوان الرئيسي</Label>
                  <Input value={config.title} onChange={e => setConfig(p => ({ ...p, title: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white text-right h-9 font-bold" dir="rtl" />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs mb-1 block">الحديث / الاقتباس</Label>
                  <Textarea value={config.subtitle} onChange={e => setConfig(p => ({ ...p, subtitle: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white text-right min-h-[65px] text-sm" dir="rtl" />
                </div>
              </CardContent>
            </Card>

            {/* Tiers */}
            <Card className="bg-slate-800/60 border-slate-700/60 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-white font-bold text-sm">خيارات التبرع</h3>
                {config.tiers.map((tier, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-500 text-xs mb-1 block">تسمية {i + 1}</Label>
                      <Input value={tier.label} onChange={e => {
                        const t = [...config.tiers]; t[i] = { ...t[i], label: e.target.value };
                        setConfig(p => ({ ...p, tiers: t }));
                      }} className="bg-slate-700 border-slate-600 text-white text-sm text-right h-8" dir="rtl" />
                    </div>
                    <div>
                      <Label className="text-slate-500 text-xs mb-1 block">المبلغ</Label>
                      <Input value={tier.amount} onChange={e => {
                        const t = [...config.tiers]; t[i] = { ...t[i], amount: e.target.value };
                        setConfig(p => ({ ...p, tiers: t }));
                      }} className="bg-slate-700 border-slate-600 text-white text-sm text-right h-8" dir="rtl" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Bank & Contact */}
            <Card className="bg-slate-800/60 border-slate-700/60 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-white font-bold text-sm">بيانات التحويل والتواصل</h3>
                <div>
                  <Label className="text-slate-400 text-xs mb-1 block">اسم البنك</Label>
                  <Input value={config.bank} onChange={e => setConfig(p => ({ ...p, bank: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white text-right h-9" dir="rtl" />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs mb-1 block">رقم IBAN</Label>
                  <Input value={config.iban} onChange={e => setConfig(p => ({ ...p, iban: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white font-mono h-9 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-400 text-xs mb-1 block">الهاتف</Label>
                    <Input value={config.phone} onChange={e => setConfig(p => ({ ...p, phone: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white font-mono h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1 block">حساب التواصل</Label>
                    <Input value={config.social} onChange={e => setConfig(p => ({ ...p, social: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white h-9" />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-400 text-xs mb-1 block">الموقع الإلكتروني</Label>
                  <Input value={config.website} onChange={e => setConfig(p => ({ ...p, website: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white h-9" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
              <span className="text-slate-400 text-xs">معاينة مباشرة — {ratio.label} — {ratio.w}×{posterH}px</span>
            </div>

            {/* POSTER */}
            <div
              ref={posterRef}
              style={{
                width: ratio.w,
                height: posterH,
                background: tpl.bg,
                fontFamily: "'Cairo', 'Tajawal', 'Noto Sans Arabic', Arial, sans-serif",
                direction: "rtl",
                position: "relative",
                overflow: "hidden",
                borderRadius: 24,
                display: "flex",
                flexDirection: "column",
                boxShadow: `0 40px 120px ${tpl.accentGlow}`,
              }}
            >
              {/* Pattern overlay */}
              <PatternOverlay pattern={tpl.pattern} accent={tpl.accentColor} />

              {/* Top glow */}
              <div style={{ position: "absolute", top: -100, right: "50%", transform: "translateX(50%)", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${tpl.accentGlow} 0%, transparent 70%)`, zIndex: 0, pointerEvents: "none" }} />

              {/* Header */}
              <div style={{ position: "relative", zIndex: 2, padding: "28px 32px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: `1px solid ${tpl.accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
                    <img src="/images/logo.jpeg" alt="طويق" crossOrigin="anonymous" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>جمعية طويق</div>
                    <div style={{ fontSize: 11, color: tpl.accentColor, opacity: 0.9, marginTop: 1 }}>للخدمات الإنسانية</div>
                  </div>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 32 }}>{tpl.emoji}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>رقم {config.regNo}</div>
                </div>
              </div>

              {/* Main Title */}
              <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "10px 32px 0" }}>
                <div style={{
                  fontSize: posterH > 800 ? 72 : 56,
                  fontWeight: 900,
                  color: tpl.titleColor,
                  lineHeight: 1.0,
                  letterSpacing: -1,
                  textShadow: `0 0 60px ${tpl.accentGlow}, 0 4px 20px rgba(0,0,0,0.5)`,
                  marginBottom: 8,
                }}>
                  {config.title}
                </div>
                {/* Accent underline */}
                <div style={{ width: 80, height: 4, background: `linear-gradient(90deg, transparent, ${tpl.accentColor}, transparent)`, margin: "0 auto 18px", borderRadius: 2 }} />
              </div>

              {/* Hadith Quote */}
              <div style={{
                position: "relative",
                zIndex: 2,
                margin: "0 28px 20px",
                background: `${tpl.badgeBg}`,
                border: `1px solid ${tpl.badgeBorder}`,
                borderRadius: 18,
                padding: "16px 20px",
                textAlign: "center",
                backdropFilter: "blur(10px)",
              }}>
                <div style={{ fontSize: 13.5, color: tpl.subtitleColor, lineHeight: 1.9, fontStyle: "italic", whiteSpace: "pre-line" }}>
                  {config.subtitle}
                </div>
              </div>

              {/* Donation Tiers */}
              <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 12, padding: "0 24px 16px", flex: 1 }}>
                {config.tiers.map((tier, i) => (
                  <div key={i} style={{
                    flex: 1,
                    background: i === config.tiers.length - 1 ? tpl.cardBg : "rgba(255,255,255,0.07)",
                    borderRadius: 20,
                    padding: "18px 12px",
                    textAlign: "center",
                    border: i === config.tiers.length - 1 ? "none" : `1px solid ${tpl.accentColor}25`,
                    boxShadow: i === config.tiers.length - 1 ? tpl.cardShadow : "none",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}>
                    {i === config.tiers.length - 1 && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase" }}>
                        ★ المميز
                      </div>
                    )}
                    <div style={{ fontSize: 23, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{tier.amount}</div>
                    <div style={{ fontSize: 12, color: i === config.tiers.length - 1 ? "rgba(255,255,255,0.8)" : tpl.accentColor, lineHeight: 1.4 }}>{tier.label}</div>
                  </div>
                ))}
              </div>

              {/* Bank + QR */}
              <div style={{
                position: "relative",
                zIndex: 2,
                margin: "0 24px 16px",
                background: "rgba(0,0,0,0.35)",
                border: `1px solid ${tpl.accentColor}20`,
                borderRadius: 18,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                backdropFilter: "blur(12px)",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4, letterSpacing: 0.5 }}>التحويل المباشر</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: tpl.accentColor, marginBottom: 4 }}>{config.bank}</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.7)", letterSpacing: 0.8 }}>{config.iban}</div>
                </div>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: 14,
                  background: "#fff",
                  padding: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: `0 0 20px ${tpl.accentGlow}`,
                }}>
                  <img src="/images/qr-code.png" alt="QR" crossOrigin="anonymous" style={{ width: 70, height: 70, objectFit: "contain" }} />
                </div>
              </div>

              {/* Footer */}
              <div style={{
                position: "relative",
                zIndex: 2,
                background: tpl.footerBg,
                backdropFilter: "blur(20px)",
                padding: "14px 28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: `1px solid ${tpl.accentColor}20`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>📞</span>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{config.phone}</span>
                </div>
                <div style={{ color: tpl.accentColor, fontSize: 12, fontWeight: 600 }}>🌐 {config.website}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>@{config.social}</div>
              </div>
            </div>

            {/* Download buttons */}
            <div className="mt-5 flex gap-3 flex-wrap justify-center">
              <Button onClick={handleDownload} size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold gap-2 rounded-xl px-8 shadow-lg shadow-amber-500/30">
                <Download className="w-5 h-5" /> تحميل PNG عالي الجودة
              </Button>
              <Button variant="outline" onClick={handleShareWA} size="lg" className="border-white/20 text-white hover:bg-white/10 gap-2 rounded-xl px-5">
                <Share2 className="w-5 h-5" /> نشر واتساب
              </Button>
            </div>
            <p className="text-slate-500 text-xs mt-2 text-center">
              دقة التحميل: {ratio.w * 3}×{posterH * 3} بكسل (3×) — مناسب للطباعة والنشر على جميع منصات التواصل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
