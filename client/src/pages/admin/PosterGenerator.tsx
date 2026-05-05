import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Download, Printer, ArrowRight, Sparkles,
  Droplet, Utensils, Moon, Share2, RefreshCw
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

const TEMPLATES = [
  {
    id: "water",
    name: "سقياء ماء",
    icon: Droplet,
    bg: "linear-gradient(160deg, #c5eef8 0%, #dff5fb 30%, #aaded8 60%, #d0eff8 100%)",
    headerBg: "rgba(255,255,255,0.93)",
    titleColor: "#0a6e8a",
    titleShadow: "0 2px 12px rgba(10,110,138,0.2)",
    boxGradient: "linear-gradient(135deg, #1a9aaa 0%, #0d7a8c 100%)",
    boxLabelColor: "rgba(255,255,255,0.85)",
    boxAmountColor: "#fff",
    quoteBoxBg: "rgba(255,255,255,0.65)",
    footerBg: "#0a6e8a",
    footerText: "rgba(255,255,255,0.92)",
    bankBg: "rgba(255,255,255,0.7)",
    defaultTitle: "سقياء",
    defaultSubtitle: "قال رسول الله - ص-\n«أفضل الصدقة سقى الماء »",
    defaultTiers: [
      { label: "سهم الفرد", amount: "50 ريال" },
      { label: "سهم الوالدين", amount: "100 ريال" },
      { label: "شهر كامل", amount: "1500 ريال" },
    ],
    defaultBank: "مصرف الراجحي",
    defaultIban: "SA3080 0005896080195679 23",
    emoji: "💧",
  },
  {
    id: "basket",
    name: "السلة الرمضانية",
    icon: Moon,
    bg: "linear-gradient(160deg, #e4f0f8 0%, #f4faff 40%, #d8ecf8 100%)",
    headerBg: "rgba(255,255,255,0.95)",
    titleColor: "#1a6a2a",
    titleShadow: "0 2px 12px rgba(26,106,42,0.15)",
    boxGradient: "linear-gradient(135deg, #2a9a4a 0%, #1a7a35 100%)",
    boxLabelColor: "rgba(255,255,255,0.85)",
    boxAmountColor: "#fff",
    quoteBoxBg: "rgba(255,255,255,0.65)",
    footerBg: "#1a6a2a",
    footerText: "rgba(255,255,255,0.92)",
    bankBg: "rgba(255,255,255,0.7)",
    defaultTitle: "السلة الرمضانية",
    defaultSubtitle: "قال رسول الله - ص-\n«اتقوا النار ولو بشق تمرة »",
    defaultTiers: [
      { label: "إمكانية التبرع", amount: "مبلغ مفتوح" },
      { label: "سهم الفرد", amount: "150 ريال" },
      { label: "سهم الوالدين", amount: "300 ريال" },
    ],
    defaultBank: "ANB البنك العربي الوطني",
    defaultIban: "SA6930 4001809581039 0018",
    emoji: "🌙",
  },
  {
    id: "iftar",
    name: "إفطار الضام",
    icon: Utensils,
    bg: "linear-gradient(160deg, #1e1005 0%, #3a2208 35%, #5a3410 65%, #2e1a06 100%)",
    headerBg: "rgba(30,15,3,0.88)",
    titleColor: "#f0c060",
    titleShadow: "0 2px 20px rgba(240,192,96,0.5)",
    boxGradient: "linear-gradient(135deg, #8a5a10 0%, #6a3e05 100%)",
    boxLabelColor: "rgba(240,192,96,0.85)",
    boxAmountColor: "#f0c060",
    quoteBoxBg: "rgba(255,255,255,0.12)",
    footerBg: "rgba(15,8,2,0.95)",
    footerText: "#f0c060",
    bankBg: "rgba(255,255,255,0.12)",
    defaultTitle: "إفطار الضام",
    defaultSubtitle: "قال رسول الله - ص-\n«من فطّر صائماً كان له مثل أجره »",
    defaultTiers: [
      { label: "الوجبة الواحدة", amount: "15 ريال" },
      { label: "شهر كامل", amount: "450 ريال" },
      { label: "الهدف", amount: "60,000 وجبة" },
    ],
    defaultBank: "بنك البلاد",
    defaultIban: "SA2315 0009999146128000007",
    emoji: "🕌",
  },
];

export default function PosterGenerator() {
  const { toast } = useToast();
  const posterRef = useRef<HTMLDivElement>(null);
  const [tpl, setTpl] = useState(TEMPLATES[0]);
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
      });
      const link = document.createElement("a");
      link.download = `tuwaiq-${tpl.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "✅ تم التصدير بنجاح — جاهز للنشر" });
    } catch {
      toast({ title: "خطأ في التصدير", variant: "destructive" });
    }
  };

  const handleShareWA = () => {
    const text = `🤲 ساهم معنا في حملة "${config.title}"\nجمعية طويق للخدمات الإنسانية\n${config.subtitle.replace('\n', ' ')}\n📞 ${config.phone}\n🌐 @${config.social}\nرقم السجل: ${config.regNo} | ترخيص: ${config.license}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = `🤲 ساهم معنا في حملة "${config.title}" - جمعية طويق للخدمات الإنسانية\n@${config.social} #طويق_للخدمات_الإنسانية`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900" dir="rtl">
      <div className="max-w-[1400px] mx-auto p-6">

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
              <p className="text-slate-400 text-xs md:text-sm">صمّم بوسترات تبرع بجودة عالية</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleShareWA} className="border-white/20 text-white hover:bg-white/10 gap-1 rounded-xl">
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">واتساب</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareTwitter} className="border-white/20 text-white hover:bg-white/10 gap-1 rounded-xl">
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">تويتر</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="border-white/20 text-white hover:bg-white/10 gap-1 rounded-xl">
              <Printer className="w-4 h-4" /> <span className="hidden sm:inline">طباعة</span>
            </Button>
            <Button size="sm" onClick={handleDownload} className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-1 rounded-xl px-5 shadow-lg shadow-amber-500/30">
              <Download className="w-4 h-4" /> تحميل
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8">
          <div className="space-y-5">

            <Card className="bg-slate-800/80 border-slate-700 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                  <RefreshCw className="w-4 h-4 text-amber-400" /> اختر نوع الحملة
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t)}
                      data-testid={`button-template-${t.id}`}
                      className={`p-3 rounded-xl text-center border-2 transition-all text-xs font-bold flex flex-col items-center gap-1 ${
                        tpl.id === t.id
                          ? "border-amber-400 bg-amber-400/15 text-amber-400"
                          : "border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      {t.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border-slate-700 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-white font-bold text-sm">تفاصيل الحملة</h3>
                <div>
                  <Label className="text-slate-400 text-xs mb-1 block">عنوان الحملة</Label>
                  <Input value={config.title} onChange={e => setConfig(p => ({ ...p, title: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white text-right h-9" dir="rtl" />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs mb-1 block">الحديث النبوي الشريف</Label>
                  <Textarea value={config.subtitle} onChange={e => setConfig(p => ({ ...p, subtitle: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white text-right min-h-[65px] text-sm" dir="rtl" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border-slate-700 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-white font-bold text-sm">خيارات التبرع الثلاثة</h3>
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
                      <Label className="text-slate-500 text-xs mb-1 block">مبلغ / قيمة</Label>
                      <Input value={tier.amount} onChange={e => {
                        const t = [...config.tiers]; t[i] = { ...t[i], amount: e.target.value };
                        setConfig(p => ({ ...p, tiers: t }));
                      }} className="bg-slate-700 border-slate-600 text-white text-sm text-right h-8" dir="rtl" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border-slate-700 backdrop-blur">
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
                    className="bg-slate-700 border-slate-600 text-white font-mono h-9" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-400 text-xs mb-1 block">رقم الهاتف</Label>
                    <Input value={config.phone} onChange={e => setConfig(p => ({ ...p, phone: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white font-mono h-9" />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1 block">حساب التواصل</Label>
                    <Input value={config.social} onChange={e => setConfig(p => ({ ...p, social: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white h-9" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-slate-400 text-xs mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
              معاينة مباشرة — 600×900 بكسل — جاهز للطباعة والنشر الرقمي
            </p>

            <div
              ref={posterRef}
              style={{
                width: 600,
                minHeight: 900,
                background: tpl.bg,
                fontFamily: "'Noto Sans Arabic', 'Cairo', 'Tajawal', Arial, sans-serif",
                direction: "rtl",
                position: "relative",
                overflow: "hidden",
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {tpl.id === "iftar" && (
                <>
                  <div style={{ position: "absolute", top: -60, right: -60, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(210,140,20,0.35) 0%, transparent 70%)", zIndex: 0 }} />
                  <div style={{ position: "absolute", bottom: 200, left: -50, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(180,100,10,0.3) 0%, transparent 70%)", zIndex: 0 }} />
                  <div style={{ position: "absolute", top: 350, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,160,30,0.2) 0%, transparent 70%)", zIndex: 0 }} />
                </>
              )}
              {(tpl.id === "water" || tpl.id === "basket") && (
                <>
                  <div style={{ position: "absolute", top: -70, right: -70, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.3)", filter: "blur(50px)", zIndex: 0 }} />
                  <div style={{ position: "absolute", bottom: 180, left: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.18)", filter: "blur(35px)", zIndex: 0 }} />
                </>
              )}

              <div style={{ background: tpl.headerBg, padding: "22px 28px 16px", textAlign: "center", position: "relative", zIndex: 2, borderBottom: tpl.id === "iftar" ? "1px solid rgba(240,192,96,0.2)" : "1px solid rgba(0,0,0,0.05)" }}>
                <img
                  src="/images/logo.jpeg"
                  alt="طويق"
                  crossOrigin="anonymous"
                  style={{ width: 85, height: 85, objectFit: "contain", margin: "0 auto 6px", display: "block" }}
                />
                <div style={{ fontSize: 20, fontWeight: 900, color: tpl.id === "iftar" ? "#c8960a" : "#1a3a2a", lineHeight: 1.3 }}>جمعية طويق</div>
                <div style={{ fontSize: 13, color: tpl.id === "iftar" ? "#a07010" : "#2a6a4a", marginTop: 2 }}>للخدمات الإنسانية</div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 5, letterSpacing: 0.3 }}>
                  {config.regNo} : رقم السجل &nbsp;&nbsp;|&nbsp;&nbsp; {config.license} : ترخيص
                </div>
              </div>

              <div style={{ padding: "26px 28px 16px", textAlign: "center", flex: 1, position: "relative", zIndex: 2 }}>

                <div style={{ fontSize: 58, fontWeight: 900, color: tpl.titleColor, lineHeight: 1.0, marginBottom: 10, textShadow: tpl.titleShadow }}>
                  {config.title}
                </div>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{tpl.emoji}</div>

                <div style={{
                  background: tpl.quoteBoxBg,
                  borderRadius: 14,
                  padding: "12px 18px",
                  margin: "0 auto 22px",
                  maxWidth: 490,
                  fontSize: 14,
                  color: tpl.id === "iftar" ? "#f0c060" : "#555",
                  fontStyle: "italic",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                  backdropFilter: "blur(4px)",
                  border: tpl.id === "iftar" ? "1px solid rgba(240,192,96,0.2)" : "1px solid rgba(255,255,255,0.5)",
                }}>
                  ‹ {config.subtitle} ›
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 22 }}>
                  {config.tiers.map((tier, i) => (
                    <div key={i} style={{
                      background: tpl.boxGradient,
                      borderRadius: 16,
                      padding: "16px 10px",
                      flex: 1,
                      maxWidth: 165,
                      textAlign: "center",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                    }}>
                      <div style={{ color: tpl.boxLabelColor, fontSize: 13, marginBottom: 8, lineHeight: 1.3 }}>{tier.label}</div>
                      <div style={{ color: tpl.boxAmountColor, fontSize: 19, fontWeight: 900, lineHeight: 1.2 }}>{tier.amount}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 13, color: tpl.id === "iftar" ? "rgba(240,192,96,0.8)" : "rgba(10,110,138,0.7)", marginBottom: 14 }}>
                  📍 جمعية طويق للخدمات الإنسانية
                </div>

                {/* Bank Transfer Info */}
                <div style={{ background: tpl.bankBg, borderRadius: 16, padding: "14px 18px", textAlign: "right", backdropFilter: "blur(4px)", border: tpl.id === "iftar" ? "1px solid rgba(240,192,96,0.2)" : "1px solid rgba(255,255,255,0.5)", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: tpl.id === "iftar" ? "rgba(240,192,96,0.6)" : "#999", marginBottom: 4 }}>التحويل المباشر</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: tpl.id === "iftar" ? "#f0c060" : "#222", marginBottom: 4 }}>{config.bank}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tpl.id === "iftar" ? "#e0b040" : tpl.titleColor, fontFamily: "monospace", letterSpacing: 0.5 }}>{config.iban}</div>
                </div>

                {/* QR Code Feature Section */}
                <div style={{
                  background: tpl.id === "iftar"
                    ? "linear-gradient(135deg, rgba(30,15,3,0.9), rgba(90,52,16,0.85))"
                    : "linear-gradient(135deg, rgba(10,90,50,0.9), rgba(20,140,80,0.85))",
                  borderRadius: 20,
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  border: tpl.id === "iftar" ? "1px solid rgba(240,192,96,0.3)" : "1px solid rgba(255,255,255,0.2)",
                  boxShadow: tpl.id === "iftar" ? "0 8px 32px rgba(200,140,10,0.25)" : "0 8px 32px rgba(10,122,58,0.35)",
                  marginBottom: 4,
                }}>
                  {/* QR Code */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      position: "absolute",
                      inset: -4,
                      borderRadius: 14,
                      background: tpl.id === "iftar"
                        ? "linear-gradient(135deg, #f0c060, #c8960a)"
                        : "linear-gradient(135deg, #2ecc71, #0a7a3a)",
                      zIndex: 0,
                    }} />
                    <div style={{
                      position: "relative",
                      zIndex: 1,
                      background: "#fff",
                      borderRadius: 11,
                      padding: 5,
                      width: 100,
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <img
                        src="/images/qr-code.png"
                        alt="QR Code"
                        crossOrigin="anonymous"
                        style={{ width: 90, height: 90, objectFit: "contain", display: "block" }}
                      />
                    </div>
                  </div>

                  {/* Call to action text */}
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: tpl.id === "iftar" ? "#f0c060" : "#ffffff",
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}>امسح وتبرع الآن</div>
                    <div style={{
                      fontSize: 12,
                      color: tpl.id === "iftar" ? "rgba(240,192,96,0.75)" : "rgba(200,255,220,0.85)",
                      lineHeight: 1.6,
                      marginBottom: 8,
                    }}>وجّه كاميرا هاتفك نحو الباركود للتبرع الفوري عبر موقع الجمعية</div>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: tpl.id === "iftar" ? "rgba(240,192,96,0.15)" : "rgba(255,255,255,0.12)",
                      border: tpl.id === "iftar" ? "1px solid rgba(240,192,96,0.3)" : "1px solid rgba(255,255,255,0.25)",
                      borderRadius: 8,
                      padding: "4px 10px",
                    }}>
                      <span style={{ fontSize: 10, color: tpl.id === "iftar" ? "#f0c060" : "#a0ffcc", fontWeight: 700, letterSpacing: 0.5 }}>
                        🔒 تبرع آمن ومعتمد | ترخيص {config.license}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: tpl.footerBg, padding: "12px 24px", position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: tpl.footerText, fontSize: 14, fontWeight: 700 }}>📞 {config.phone}</div>
                  <div style={{ color: tpl.footerText, opacity: 0.7, fontSize: 15, letterSpacing: 3 }}>▶ ✕ 𝐟 📷</div>
                  <div style={{ color: tpl.footerText, fontSize: 14, fontWeight: 700 }}>@{config.social}</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Button onClick={handleDownload} size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2 rounded-xl px-8">
                <Download className="w-5 h-5" /> تحميل PNG عالي الجودة
              </Button>
              <Button variant="outline" onClick={handleShareWA} size="lg" className="border-white/20 text-white hover:bg-white/10 gap-2 rounded-xl px-5">
                <Share2 className="w-5 h-5" /> نشر واتساب
              </Button>
            </div>
            <p className="text-slate-500 text-xs mt-2">
              دقة التحميل: 1800×2700 بكسل (3×) — مناسب للطباعة والنشر على السوشيال ميديا
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
