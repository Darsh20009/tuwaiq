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

// SVG pattern overlays — premium Islamic geometric designs
function PatternOverlay({ pattern, accent }: { pattern: string; accent: string }) {
  // Shared 8-point Islamic star tile
  const starPath = (cx: number, cy: number, r: number) => {
    const pts = Array.from({length: 8}, (_,i) => {
      const a = (i * 45 - 22.5) * Math.PI / 180;
      const a2 = (i * 45 + 22.5) * Math.PI / 180;
      const inner = r * 0.4;
      return `${cx + r*Math.cos(a)},${cy + r*Math.sin(a)} ${cx + inner*Math.cos(a2)},${cy + inner*Math.sin(a2)}`;
    });
    return `M ${pts.join(" L ")} Z`;
  };

  if (pattern === "waves") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.09 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
      {/* Arabesque waves */}
      {[0,1,2,3,4,5].map(i => (
        <path key={i} d={`M 0 ${i*160+40} Q 150 ${i*160} 300 ${i*160+40} Q 450 ${i*160+80} 600 ${i*160+40}`}
          fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7" />
      ))}
      {/* Corner stars */}
      {[[50,50],[550,50],[50,850],[550,850]].map(([cx,cy],i) => (
        <path key={`s${i}`} d={starPath(cx,cy,35)} fill={accent} opacity="0.15" />
      ))}
    </svg>
  );
  if (pattern === "stars") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
      {/* Large Islamic star grid */}
      {[0,1,2,3,4].map(row => [0,1,2].map(col => (
        <path key={`${row}-${col}`} d={starPath(col*200+100, row*200+100, 60)} fill="none" stroke={accent} strokeWidth="1" />
      )))}
      {/* Small accent stars at midpoints */}
      {[0,1,2,3].map(row => [0,1].map(col => (
        <path key={`s${row}-${col}`} d={starPath(col*200+200, row*200+200, 25)} fill={accent} opacity="0.2" />
      )))}
    </svg>
  );
  if (pattern === "geometric") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
      {/* Islamic tile: diamond grid */}
      {[0,1,2,3,4,5].map(row => [0,1,2,3].map(col => (
        <g key={`${row}-${col}`}>
          <polygon points={`${col*155+78},${row*155-20} ${col*155+155},${row*155+78} ${col*155+78},${row*155+155} ${col*155},${row*155+78}`}
            fill="none" stroke={accent} strokeWidth="1.2" />
          <circle cx={col*155+78} cy={row*155+78} r="10" fill={accent} opacity="0.12" />
        </g>
      )))}
    </svg>
  );
  if (pattern === "kaaba") return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
      {/* Concentric rings — Tawaf */}
      {[260,200,140,80,40].map((r, i) => (
        <circle key={i} cx="300" cy="450" r={r} fill="none" stroke={accent} strokeWidth={i===0?1.5:1} />
      ))}
      {/* 12 radial lines */}
      {Array.from({length:12},(_,i) => {
        const rad = i*30*Math.PI/180;
        return <line key={i} x1="300" y1="450" x2={300+260*Math.cos(rad)} y2={450+260*Math.sin(rad)} stroke={accent} strokeWidth="0.7" opacity="0.6" />;
      })}
      {/* Center star */}
      <path d={starPath(300, 450, 30)} fill={accent} opacity="0.25" />
      {/* Corner ornaments */}
      {[[40,60],[560,60],[40,840],[560,840]].map(([cx,cy],i) => (
        <path key={`c${i}`} d={starPath(cx,cy,28)} fill="none" stroke={accent} strokeWidth="1.2" />
      ))}
    </svg>
  );
  // hearts / default — Islamic rosette pattern
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
      {[0,1,2,3,4].map(row => [0,1,2].map(col => (
        <g key={`${row}-${col}`}>
          <circle cx={col*200+100} cy={row*200+100} r="60" fill="none" stroke={accent} strokeWidth="1" />
          <circle cx={col*200+100} cy={row*200+100} r="36" fill="none" stroke={accent} strokeWidth="0.7" />
          <path d={starPath(col*200+100, row*200+100, 22)} fill={accent} opacity="0.18" />
        </g>
      )))}
    </svg>
  );
}

// Arabesque corner ornament
function CornerOrnament({ accent, flip }: { accent: string; flip?: boolean }) {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90"
      style={{ position:"absolute", ...(flip ? {top:0,left:0,transform:"scaleX(-1)"} : {top:0,right:0}), opacity:0.35, pointerEvents:"none" }}>
      <path d="M 0 0 L 90 0 L 90 90" fill="none" stroke={accent} strokeWidth="2" />
      <path d="M 20 0 L 90 0 L 90 20" fill="none" stroke={accent} strokeWidth="1" />
      <circle cx="80" cy="10" r="5" fill={accent} opacity="0.6" />
      <circle cx="10" cy="80" r="5" fill={accent} opacity="0.6" />
      <path d="M 45 0 Q 60 30 90 45" fill="none" stroke={accent} strokeWidth="0.8" />
    </svg>
  );
}
function CornerOrnamentBottom({ accent, flip }: { accent: string; flip?: boolean }) {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90"
      style={{ position:"absolute", ...(flip ? {bottom:0,left:0,transform:"scaleX(-1)"} : {bottom:0,right:0}), opacity:0.35, pointerEvents:"none" }}>
      <path d="M 0 90 L 90 90 L 90 0" fill="none" stroke={accent} strokeWidth="2" />
      <path d="M 20 90 L 90 90 L 90 70" fill="none" stroke={accent} strokeWidth="1" />
      <circle cx="80" cy="80" r="5" fill={accent} opacity="0.6" />
      <path d="M 45 90 Q 60 60 90 45" fill="none" stroke={accent} strokeWidth="0.8" />
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

            {/* POSTER — Premium Professional Design */}
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
                boxShadow: `0 40px 120px ${tpl.accentGlow}, 0 0 0 2px ${tpl.accentColor}30`,
              }}
            >
              {/* Full-bleed pattern */}
              <PatternOverlay pattern={tpl.pattern} accent={tpl.accentColor} />

              {/* Ambient top glow */}
              <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 500, height: 380, borderRadius: "50%", background: `radial-gradient(ellipse, ${tpl.accentGlow} 0%, transparent 70%)`, zIndex: 0, pointerEvents: "none" }} />
              {/* Bottom glow */}
              <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: 400, height: 260, borderRadius: "50%", background: `radial-gradient(ellipse, ${tpl.accentGlow} 0%, transparent 70%)`, zIndex: 0, pointerEvents: "none", opacity: 0.5 }} />

              {/* Corner ornaments */}
              <CornerOrnament accent={tpl.accentColor} />
              <CornerOrnament accent={tpl.accentColor} flip />
              <CornerOrnamentBottom accent={tpl.accentColor} />
              <CornerOrnamentBottom accent={tpl.accentColor} flip />

              {/* Outer border frame */}
              <div style={{ position:"absolute", inset: 12, border: `1px solid ${tpl.accentColor}22`, borderRadius: 16, zIndex: 1, pointerEvents:"none" }} />

              {/* ── Header ── */}
              <div style={{ position: "relative", zIndex: 2, padding: "24px 28px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Logo + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 58, height: 58, borderRadius: 16,
                    background: "rgba(255,255,255,0.14)",
                    border: `1.5px solid ${tpl.accentColor}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(12px)",
                    boxShadow: `0 0 18px ${tpl.accentGlow}`,
                  }}>
                    <img src="/images/logo.jpeg" alt="طويق" crossOrigin="anonymous" style={{ width: 42, height: 42, objectFit: "contain", borderRadius: 10 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.15, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>جمعية طويق</div>
                    <div style={{ fontSize: 10.5, color: tpl.accentColor, marginTop: 1, letterSpacing: 0.3 }}>للخدمات الإنسانية</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>ترخيص رقم: {config.regNo}</div>
                  </div>
                </div>
                {/* Emoji badge */}
                <div style={{
                  width: 58, height: 58, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${tpl.accentColor}30, rgba(255,255,255,0.06))`,
                  border: `1.5px solid ${tpl.accentColor}40`,
                  display: "flex", flexDirection:"column", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(8px)",
                }}>
                  <div style={{ fontSize: 26 }}>{tpl.emoji}</div>
                </div>
              </div>

              {/* ── Divider ── */}
              <div style={{ position:"relative", zIndex:2, margin:"0 24px", height:1, background:`linear-gradient(90deg, transparent, ${tpl.accentColor}60, transparent)` }} />

              {/* ── Main Title ── */}
              <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: posterH>800?"20px 28px 6px":"14px 24px 4px" }}>
                <div style={{
                  fontSize: posterH > 900 ? 80 : posterH > 700 ? 68 : 54,
                  fontWeight: 900,
                  color: tpl.titleColor,
                  lineHeight: 1.05,
                  letterSpacing: -1,
                  textShadow: `0 0 80px ${tpl.accentGlow}, 0 2px 24px rgba(0,0,0,0.6)`,
                  marginBottom: 6,
                }}>
                  {config.title}
                </div>
                {/* Gold underline ornament */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom: posterH>800?10:6 }}>
                  <div style={{ flex:1, maxWidth:60, height:1, background:`linear-gradient(90deg, transparent, ${tpl.accentColor})` }} />
                  <div style={{ fontSize:16 }}>✦</div>
                  <div style={{ flex:1, maxWidth:60, height:1, background:`linear-gradient(90deg, ${tpl.accentColor}, transparent)` }} />
                </div>
              </div>

              {/* ── Hadith / Quote card ── */}
              <div style={{
                position: "relative", zIndex: 2,
                margin: posterH>800?"0 22px 14px":"0 18px 10px",
                background: `${tpl.badgeBg}`,
                border: `1px solid ${tpl.badgeBorder}`,
                borderRadius: 16,
                padding: posterH>800?"16px 22px":"12px 16px",
                textAlign: "center",
                backdropFilter: "blur(12px)",
              }}>
                <div style={{ fontSize: posterH>800?10:9, color: tpl.accentColor, letterSpacing:2, fontWeight:700, marginBottom:6, textTransform:"uppercase" }}>الحديث الشريف</div>
                <div style={{ fontSize: posterH>800?14:12.5, color: tpl.subtitleColor, lineHeight: 1.85, whiteSpace: "pre-line" }}>
                  {config.subtitle}
                </div>
              </div>

              {/* ── Donation Tiers ── */}
              <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 10, padding: posterH>800?"0 20px 12px":"0 16px 8px", flex: 1 }}>
                {config.tiers.map((tier, i) => {
                  const isFeatured = i === config.tiers.length - 1;
                  return (
                    <div key={i} style={{
                      flex: 1,
                      background: isFeatured ? tpl.cardBg : "rgba(255,255,255,0.06)",
                      borderRadius: 18,
                      padding: posterH>800?"20px 12px":"14px 8px",
                      textAlign: "center",
                      border: isFeatured ? `1.5px solid ${tpl.accentColor}60` : `1px solid ${tpl.accentColor}20`,
                      boxShadow: isFeatured ? tpl.cardShadow : "none",
                      backdropFilter: "blur(8px)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                      position: "relative", overflow: "hidden",
                    }}>
                      {isFeatured && (
                        <>
                          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${tpl.accentColor}, transparent)` }} />
                          <div style={{ fontSize: 9, fontWeight: 800, color: tpl.accentColor, background: `${tpl.accentColor}20`, padding: "2px 10px", borderRadius: 20, letterSpacing:1.5 }}>★ الأكثر أثراً</div>
                        </>
                      )}
                      <div style={{ fontSize: posterH>800?24:20, fontWeight: 900, color: "#fff", lineHeight: 1.1, textShadow:"0 2px 10px rgba(0,0,0,0.4)" }}>{tier.amount}</div>
                      <div style={{ fontSize: posterH>800?11.5:10, color: isFeatured ? "rgba(255,255,255,0.85)" : tpl.accentColor, lineHeight: 1.4, fontWeight:600 }}>{tier.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* ── Bank Transfer + QR ── */}
              <div style={{
                position: "relative", zIndex: 2,
                margin: posterH>800?"0 20px 12px":"0 16px 8px",
                background: "rgba(0,0,0,0.38)",
                border: `1px solid ${tpl.accentColor}25`,
                borderRadius: 16,
                padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 14,
                backdropFilter: "blur(14px)",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", marginBottom: 3, letterSpacing:0.8, textTransform:"uppercase" }}>التحويل البنكي المباشر</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: tpl.accentColor, marginBottom: 3 }}>{config.bank}</div>
                  <div style={{ fontSize: 10.5, fontFamily: "monospace", color: "rgba(255,255,255,0.72)", letterSpacing: 0.5, direction:"ltr", textAlign:"right" }}>{config.iban}</div>
                </div>
                <div style={{
                  width: 72, height: 72, borderRadius: 14,
                  background: "#fff",
                  padding: 4,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: `0 0 22px ${tpl.accentGlow}, 0 0 0 2px ${tpl.accentColor}30`,
                }}>
                  <img src="/images/qr-code.png" alt="QR" crossOrigin="anonymous"
                    onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                    style={{ width: 64, height: 64, objectFit: "contain" }} />
                </div>
              </div>

              {/* ── Footer ── */}
              <div style={{
                position: "relative", zIndex: 2,
                background: tpl.footerBg,
                backdropFilter: "blur(20px)",
                padding: "12px 24px",
                borderTop: `1px solid ${tpl.accentColor}25`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:12 }}>📞</span>
                  <span style={{ color:"#fff", fontSize:12.5, fontWeight:700 }}>{config.phone}</span>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ color:tpl.accentColor, fontSize:11, fontWeight:700 }}>🌐 {config.website}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:11 }}>📱</span>
                  <span style={{ color:"rgba(255,255,255,0.75)", fontSize:11 }}>@{config.social}</span>
                </div>
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
