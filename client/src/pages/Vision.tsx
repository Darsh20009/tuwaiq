import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Eye, Target, Heart, Loader2, Quote, CheckCircle2, Star, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 my-8" dir="rtl">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
      <div className="w-2 h-2 rounded-full bg-emerald-400" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
    </div>
  );
}

export default function Vision() {
  useSEO({ title: "الرؤية والرسالة — جمعية طويق" });

  const { data: content, isLoading } = useQuery<any>({
    queryKey: ["/api/content/vision"],
  });

  const hasContent = !isLoading && content?.content;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "hsl(35 28% 97%)" }} dir="rtl">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(152 42% 22%) 0%, hsl(165 42% 32%) 50%, hsl(152 42% 20%) 100%)" }}>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, transparent, hsl(28 44% 59%), transparent)" }} />

          <div className="container mx-auto px-4 py-20 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-2xl"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                <Eye className="w-10 h-10 text-white" />
              </div>
              <p className="text-emerald-200 text-sm font-bold uppercase tracking-widest mb-3">جمعية طويق للخدمات الإنسانية</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                {content?.title || "الرؤية والرسالة"}
              </h1>
              <div className="w-24 h-1 mx-auto rounded-full" style={{ background: "hsl(28 44% 59%)" }} />
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
            <span className="font-medium" style={{ color: "hsl(152 42% 28%)" }}>الرؤية والرسالة</span>
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
              {/* Decorative quote */}
              <div className="relative rounded-2xl p-8 mb-10 text-right"
                style={{ background: "linear-gradient(135deg, hsl(152 42% 97%) 0%, hsl(165 35% 95%) 100%)", border: "1px solid hsl(152 42% 85%)" }}>
                <div className="absolute top-4 right-6 opacity-20">
                  <Quote className="w-12 h-12" style={{ color: "hsl(152 42% 28%)" }} />
                </div>
                <div className="prose prose-lg max-w-none text-right [&_h1]:font-black [&_h1]:text-3xl [&_h1]:mb-4 [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:border-r-4 [&_h2]:border-emerald-500 [&_h2]:pr-4 [&_p]:leading-9 [&_p]:text-gray-700 [&_ul]:list-none [&_ul]:space-y-3 [&_ul]:pr-0 [&_li]:flex [&_li]:items-start [&_li]:gap-3 [&_ol]:list-decimal [&_ol]:pr-6"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </div>
            </motion.div>
          ) : (
            /* ── Static Fallback Layout ── */
            <div className="space-y-8">
              {/* Vision Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ border: "1px solid hsl(35 15% 88%)" }}
              >
                <div className="p-6 flex items-center gap-4" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%), hsl(165 42% 35%))" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-white">الرؤية</h2>
                </div>
                <div className="p-8 bg-white">
                  <p className="text-lg leading-10 text-gray-700 text-right">
                    أن تكون جمعية طويق للخدمات الإنسانية رائدةً في العمل الاجتماعي والإغاثي، ومتميّزةً في تقديم الخدمات الإنسانية المستدامة التي تُسهم في تحسين جودة الحياة للمستحقين على مستوى المملكة العربية السعودية.
                  </p>
                </div>
              </motion.div>

              {/* Mission Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ border: "1px solid hsl(35 15% 88%)" }}
              >
                <div className="p-6 flex items-center gap-4" style={{ background: "linear-gradient(135deg, hsl(28 44% 50%), hsl(35 44% 55%))" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-white">الرسالة</h2>
                </div>
                <div className="p-8 bg-white">
                  <p className="text-lg leading-10 text-gray-700 text-right">
                    تقديم خدمات إنسانية واجتماعية متكاملة وعالية الجودة، من خلال برامج مدروسة وشراكات فاعلة، تُعزّز من قيم التكافل الاجتماعي وتُسهم في بناء مجتمع متماسك ومُنتج، وفق أحكام الشريعة الإسلامية والأنظمة المعمول بها في المملكة العربية السعودية.
                  </p>
                </div>
              </motion.div>

              {/* Values */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ border: "1px solid hsl(35 15% 88%)" }}
              >
                <div className="p-6 flex items-center gap-4" style={{ background: "linear-gradient(135deg, hsl(210 60% 28%), hsl(220 55% 35%))" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-white">قيمنا</h2>
                </div>
                <div className="p-8 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { icon: Heart, title: "الإخلاص والأمانة", desc: "الالتزام بالنزاهة والشفافية في كل عمل" },
                      { icon: CheckCircle2, title: "الجودة والتميّز", desc: "تقديم أفضل الخدمات بأعلى المعايير" },
                      { icon: BookOpen, title: "المسؤولية والمحاسبة", desc: "الشعور بالمسؤولية تجاه المستفيدين والمجتمع" },
                      { icon: Eye, title: "الشفافية", desc: "الوضوح والصدق في كل تعاملاتنا" },
                    ].map((v) => (
                      <div key={v.title} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: "hsl(152 42% 97%)", border: "1px solid hsl(152 42% 88%)" }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(152 42% 28%)" }}>
                          <v.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 mb-1">{v.title}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <SectionDivider />

          {/* ── Info Strip ── */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-6 text-center"
            style={{ background: "linear-gradient(135deg, hsl(152 42% 28%), hsl(165 42% 35%))", color: "white" }}
          >
            <p className="text-white/70 text-sm mb-1">جمعية مرخّصة رسمياً من وزارة الموارد البشرية والتنمية الاجتماعية</p>
            <p className="font-bold text-lg">رقم السجل: 1000823030 | رقم الترخيص: 17660</p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
