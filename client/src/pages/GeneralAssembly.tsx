import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Users, Loader2, Award, Shield, Star, CheckCircle2, BookOpen, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";

const ASSEMBLY_ROLES = [
  { title: "رئيس الجمعية العمومية", desc: "يترأس اجتماعات الجمعية العمومية ويُشرف على أعمالها" },
  { title: "نائب الرئيس", desc: "يُعاون الرئيس ويحل محله عند غيابه" },
  { title: "الأمين العام", desc: "يُدير الشؤون الإدارية ويحفظ سجلات الجمعية" },
  { title: "أمين الصندوق", desc: "يُشرف على الشؤون المالية وإعداد التقارير المالية" },
];

export default function GeneralAssembly() {
  useSEO({ title: "الجمعية العمومية — جمعية طويق" });

  const { data: content, isLoading } = useQuery<any>({
    queryKey: ["/api/content/assembly"],
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "hsl(35 28% 97%)" }} dir="rtl">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(152 42% 20%) 0%, hsl(165 42% 28%) 50%, hsl(152 42% 18%) 100%)" }}>
          <div
            className="absolute inset-0 opacity-8"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)" }}
          />
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, transparent, hsl(28 44% 59%), transparent)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />

          <div className="container mx-auto px-4 py-20 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-2xl"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <p className="text-emerald-200 text-sm font-bold uppercase tracking-widest mb-3">جمعية طويق للخدمات الإنسانية</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                الجمعية العمومية
              </h1>
              <p className="text-white/70 max-w-2xl mx-auto text-base leading-relaxed">
                الجمعية العمومية هي السلطة العليا للجمعية، وتتكون من جميع الأعضاء المؤسسين والمنتسبين وفق اللوائح المعتمدة.
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
            <span className="font-medium" style={{ color: "hsl(152 42% 28%)" }}>الجمعية العمومية</span>
          </div>
        </div>

        {/* ── Official Badges ── */}
        <div className="py-6 bg-white" style={{ borderBottom: "1px solid hsl(35 15% 90%)" }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { icon: Award, text: "جهة إشرافية عليا", color: "hsl(28 44% 50%)" },
                { icon: Shield, text: "ترخيص: 17660 | سجل: 1000823030", color: "hsl(152 42% 28%)" },
                { icon: BookOpen, text: "تجتمع وفق اللوائح الأساسية", color: "hsl(210 60% 35%)" },
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
        <div className="container mx-auto px-4 py-14 max-w-5xl">

          {/* About General Assembly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8"
            style={{ border: "1px solid hsl(35 15% 88%)" }}
          >
            <div className="px-8 py-5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%), hsl(165 42% 35%))" }}>
              <Building2 className="w-6 h-6 text-white" />
              <h2 className="text-white font-black text-xl">ما هي الجمعية العمومية؟</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-700 leading-9 text-base mb-6">
                الجمعية العمومية هي الهيئة التشريعية الأعلى لجمعية طويق للخدمات الإنسانية، وتضم جميع الأعضاء المؤسسين والمنتسبين المعتمدين. تتمتع الجمعية العمومية بصلاحيات واسعة تشمل اعتماد الخطط الاستراتيجية والميزانيات السنوية وانتخاب مجلس الإدارة.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "اعتماد النظام الأساسي للجمعية وتعديلاته",
                  "انتخاب أعضاء مجلس الإدارة",
                  "مراجعة واعتماد الميزانية السنوية",
                  "مناقشة تقرير مجلس الإدارة السنوي",
                  "البت في القرارات الكبرى والاستراتيجية",
                  "اعتماد الحسابات الختامية للجمعية",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsl(152 42% 97%)", border: "1px solid hsl(152 42% 88%)" }}>
                    <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "hsl(152 42% 28%)" }} />
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Roles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8"
            style={{ border: "1px solid hsl(35 15% 88%)" }}
          >
            <div className="px-8 py-5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, hsl(28 44% 44%), hsl(35 44% 52%))" }}>
              <Star className="w-6 h-6 text-white" />
              <h2 className="text-white font-black text-xl">أدوار ومناصب الجمعية العمومية</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ASSEMBLY_ROLES.map((role, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: "hsl(35 28% 97%)", border: "1px solid hsl(35 15% 88%)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-white text-base"
                      style={{ background: "linear-gradient(135deg, hsl(28 44% 50%), hsl(35 44% 58%))" }}>
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1" style={{ color: "hsl(210 22% 14%)" }}>{role.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "hsl(215 15% 45%)" }}>{role.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CMS Content (Members List) */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: "hsl(152 42% 28%)" }} />
            </div>
          ) : content?.content ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8"
              style={{ border: "1px solid hsl(35 15% 88%)" }}
            >
              <div className="px-8 py-5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, hsl(210 60% 22%), hsl(220 55% 30%))" }}>
                <Users className="w-6 h-6 text-white" />
                <h2 className="text-white font-black text-xl">أعضاء الجمعية العمومية</h2>
              </div>
              <div
                className="p-8 [&_h1]:font-black [&_h1]:text-2xl [&_h1]:mb-6 [&_h1]:text-gray-800 [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:border-r-4 [&_h2]:border-emerald-500 [&_h2]:pr-4 [&_h2]:text-gray-700 [&_p]:leading-9 [&_p]:text-gray-700 [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:pr-0 [&_li]:flex [&_li]:items-center [&_li]:gap-3 [&_li]:py-3 [&_li]:border-b [&_li]:border-gray-100 [&_li]:text-gray-800 [&_li]:font-medium [&_ol]:list-none [&_ol]:space-y-2 [&_ol]:pr-0"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </motion.div>
          ) : null}

          {/* ── Info Strip ── */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, hsl(152 42% 28%), hsl(165 42% 35%))", color: "white" }}
          >
            <div>
              <p className="font-black text-lg">جمعية طويق للخدمات الإنسانية</p>
              <p className="text-white/70 text-sm">رقم السجل: 1000823030 | رقم الترخيص: 17660 | الرياض، المملكة العربية السعودية</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-300" />
              <span className="text-white/90 font-medium">مرخّصة رسمياً</span>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
