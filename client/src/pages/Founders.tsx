import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Users, Loader2, Award, Shield, Star, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";

export default function Founders() {
  useSEO({ title: "المؤسسون — جمعية طويق" });

  const { data: content, isLoading } = useQuery<any>({
    queryKey: ["/api/content/founders"],
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "hsl(35 28% 97%)" }} dir="rtl">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(210 60% 22%) 0%, hsl(220 55% 30%) 50%, hsl(210 60% 20%) 100%)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, transparent, hsl(28 44% 59%), transparent)" }} />

          <div className="container mx-auto px-4 py-20 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-2xl"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                <Users className="w-10 h-10 text-white" />
              </div>
              <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-3">جمعية طويق للخدمات الإنسانية</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                {content?.title || "الأعضاء المؤسسون"}
              </h1>
              <p className="text-white/70 max-w-2xl mx-auto text-base leading-relaxed">
                تفتخر جمعية طويق للخدمات الإنسانية بنخبة من الأعضاء الأوائل الذين كان لهم الدور الأساسي في تأسيس الجمعية ودعم مسيرتها منذ انطلاقتها.
              </p>
              <div className="w-24 h-1 mx-auto rounded-full mt-6" style={{ background: "hsl(28 44% 59%)" }} />
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
            <span className="font-medium" style={{ color: "hsl(210 60% 35%)" }}>الأعضاء المؤسسون</span>
          </div>
        </div>

        {/* ── Honor Strip ── */}
        <div className="py-6" style={{ backgroundColor: "white", borderBottom: "1px solid hsl(35 15% 90%)" }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: Award, text: "أعضاء مؤسسون", color: "hsl(28 44% 50%)" },
                { icon: Shield, text: "مرخّصة رسمياً — الترخيص: 17660", color: "hsl(152 42% 28%)" },
                { icon: Star, text: "عمل إنساني منذ التأسيس", color: "hsl(210 60% 35%)" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2">
                  <b.icon className="w-5 h-5" style={{ color: b.color }} />
                  <span className="text-sm font-bold" style={{ color: "hsl(210 22% 20%)" }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="container mx-auto px-4 py-14 max-w-4xl">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: "hsl(152 42% 28%)" }} />
            </div>
          ) : content?.content ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                style={{ border: "1px solid hsl(35 15% 88%)" }}
              >
                {/* Card Header */}
                <div className="px-8 py-5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%), hsl(165 42% 35%))", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                  <Users className="w-6 h-6 text-white" />
                  <h2 className="text-white font-black text-xl">الأعضاء المؤسسون — حفظهم الله</h2>
                </div>
                <div
                  className="p-8 [&_h1]:font-black [&_h1]:text-2xl [&_h1]:mb-6 [&_h1]:text-gray-800 [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:border-r-4 [&_h2]:border-emerald-500 [&_h2]:pr-4 [&_h2]:text-gray-700 [&_p]:leading-9 [&_p]:text-gray-700 [&_p]:text-base [&_ul]:list-none [&_ul]:space-y-3 [&_ul]:pr-0 [&_li]:flex [&_li]:items-center [&_li]:gap-3 [&_li]:py-3 [&_li]:border-b [&_li]:border-gray-100 [&_li]:text-gray-700 [&_li]:font-medium [&_li]:text-base [&_ol]:list-none [&_ol]:space-y-3 [&_ol]:pr-0"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-white" style={{ border: "1px solid hsl(35 15% 88%)" }}>
              <Users className="w-16 h-16 mx-auto mb-4" style={{ color: "hsl(152 42% 70%)" }} />
              <p className="text-muted-foreground text-lg">سيتم إضافة قائمة الأعضاء المؤسسين قريباً</p>
              <p className="text-sm text-muted-foreground mt-1">يمكن للمشرف إضافة المحتوى من لوحة التحكم</p>
            </div>
          )}

          {/* ── Footer Strip ── */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, hsl(210 60% 22%), hsl(220 55% 30%))", color: "white" }}
          >
            <div>
              <p className="font-black text-lg">جمعية طويق للخدمات الإنسانية</p>
              <p className="text-white/70 text-sm">رقم السجل: 1000823030 | رقم الترخيص: 17660</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-300" />
              <span className="text-white/90 font-medium">مرخّصة رسمياً</span>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
