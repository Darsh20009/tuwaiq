import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Target, Loader2, CheckCircle2, Quote, Heart, Users, Globe2, Baby, HomeIcon, Handshake } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";

const GOALS = [
  {
    number: "١",
    title: "الدعم الاجتماعي والإنساني",
    desc: "تقديم المساعدات المادية والعينية للأسر المحتاجة والأفراد المستحقين وفق معايير شفافة ومحددة.",
    icon: Heart,
    color: "hsl(152 42% 28%)",
    bg: "hsl(152 42% 97%)",
    border: "hsl(152 42% 85%)",
  },
  {
    number: "٢",
    title: "كفالة الأسر والأيتام",
    desc: "ضمان حياة كريمة للأسر الأرامل والمطلقات وكفالة الأيتام ورعايتهم تربوياً واجتماعياً.",
    icon: Baby,
    color: "hsl(28 44% 50%)",
    bg: "hsl(28 44% 97%)",
    border: "hsl(28 44% 85%)",
  },
  {
    number: "٣",
    title: "تمكين الأسر وبناء القدرات",
    desc: "دعم الأسر في تحقيق الاكتفاء الذاتي من خلال برامج التدريب والتأهيل ودعم المشاريع الصغيرة.",
    icon: Users,
    color: "hsl(210 60% 35%)",
    bg: "hsl(210 60% 97%)",
    border: "hsl(210 60% 85%)",
  },
  {
    number: "٤",
    title: "البرامج الدينية والتنمية الروحية",
    desc: "تيسير أداء الشعائر الدينية كالحج والعمرة وتعزيز القيم الإسلامية ضمن المجتمع.",
    icon: Globe2,
    color: "hsl(280 42% 35%)",
    bg: "hsl(280 42% 97%)",
    border: "hsl(280 42% 85%)",
  },
  {
    number: "٥",
    title: "الرعاية الصحية والتعليمية",
    desc: "المساهمة في تلبية الاحتياجات الصحية والتعليمية للمستفيدين عبر شراكات وبرامج متخصصة.",
    icon: HomeIcon,
    color: "hsl(165 42% 30%)",
    bg: "hsl(165 42% 97%)",
    border: "hsl(165 42% 85%)",
  },
  {
    number: "٦",
    title: "بناء الشراكات المجتمعية",
    desc: "تعزيز التعاون مع الجهات الحكومية والخاصة والمجتمعية لتحقيق أثر إنساني أوسع وأكثر استدامة.",
    icon: Handshake,
    color: "hsl(0 60% 40%)",
    bg: "hsl(0 60% 97%)",
    border: "hsl(0 60% 85%)",
  },
];

export default function Goals() {
  useSEO({ title: "أهداف الجمعية — جمعية طويق" });

  const { data: content, isLoading } = useQuery<any>({
    queryKey: ["/api/content/goals"],
  });

  const hasContent = !isLoading && content?.content;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "hsl(35 28% 97%)" }} dir="rtl">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(28 44% 40%) 0%, hsl(35 44% 50%) 50%, hsl(28 44% 38%) 100%)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, transparent, hsl(152 42% 50%), transparent)" }} />

          <div className="container mx-auto px-4 py-20 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-2xl"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                <Target className="w-10 h-10 text-white" />
              </div>
              <p className="text-amber-200 text-sm font-bold uppercase tracking-widest mb-3">جمعية طويق للخدمات الإنسانية</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                {content?.title || "أهداف الجمعية"}
              </h1>
              <div className="w-24 h-1 mx-auto rounded-full" style={{ background: "hsl(152 42% 50%)" }} />
            </motion.div>
          </div>
        </div>

        {/* ── Breadcrumb ── */}
        <div className="border-b" style={{ borderColor: "hsl(35 15% 88%)", backgroundColor: "white" }}>
          <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary">الرئيسية</a>
            <span>/</span>
            <a href="/about" className="hover:text-primary">عن الجمعية</a>
            <span>/</span>
            <span className="font-medium" style={{ color: "hsl(28 44% 50%)" }}>أهداف الجمعية</span>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="container mx-auto px-4 py-14 max-w-5xl">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: "hsl(152 42% 28%)" }} />
            </div>
          ) : hasContent ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="relative rounded-2xl p-8 mb-10"
                style={{ background: "linear-gradient(135deg, hsl(28 44% 97%) 0%, hsl(35 35% 95%) 100%)", border: "1px solid hsl(28 44% 85%)" }}>
                <div className="absolute top-4 right-6 opacity-20">
                  <Quote className="w-12 h-12" style={{ color: "hsl(28 44% 50%)" }} />
                </div>
                <div className="prose prose-lg max-w-none text-right [&_h1]:font-black [&_h1]:text-3xl [&_h1]:mb-4 [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:border-r-4 [&_h2]:pr-4 [&_p]:leading-9 [&_p]:text-gray-700 [&_ul]:list-none [&_ul]:space-y-3 [&_li]:flex [&_li]:items-start [&_li]:gap-3"
                  style={{ "--tw-prose-headings": "hsl(28 44% 38%)" } as React.CSSProperties}
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </div>
            </motion.div>
          ) : null}

          {/* ── Goals Grid (always shown) ── */}
          <div className="mb-10">
            <div className="text-center mb-10">
              <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "hsl(28 44% 50%)" }}>رسالتنا الإنسانية</p>
              <h2 className="text-3xl font-black" style={{ color: "hsl(210 22% 14%)" }}>أهداف جمعية طويق</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">نسعى لتحقيق هذه الأهداف الإنسانية الشاملة لخدمة المجتمع وتمكين المستحقين</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {GOALS.map((g, i) => (
                <motion.div
                  key={g.number}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl p-6 flex gap-5 items-start transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white"
                  style={{ border: `1px solid ${g.border}` }}
                >
                  <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: g.bg, border: `2px solid ${g.border}` }}>
                    <g.icon className="w-7 h-7" style={{ color: g.color }} />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 mb-2 justify-end">
                      <h3 className="font-black text-lg" style={{ color: "hsl(210 22% 14%)" }}>{g.title}</h3>
                      <span className="text-2xl font-black" style={{ color: g.color, fontVariantNumeric: "normal" }}>{g.number}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "hsl(215 15% 45%)" }}>{g.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Info Strip ── */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, hsl(152 42% 28%), hsl(165 42% 35%))", color: "white" }}
          >
            <div>
              <p className="font-black text-lg">جمعية طويق للخدمات الإنسانية</p>
              <p className="text-white/70 text-sm">مرخّصة رسمياً من وزارة الموارد البشرية | رقم الترخيص: 17660</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
              <span className="text-white/90 font-medium">معتمدة رسمياً</span>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
