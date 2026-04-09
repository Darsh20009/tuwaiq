import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Users, Droplets, UtensilsCrossed, Package, TrendingUp, Star } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const IMPACT_STATS = [
  { icon: Users, label: "مستفيد مباشر", value: "8,350+", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Droplets, label: "مشروع سقيا ماء", value: "1,200+", color: "text-cyan-600", bg: "bg-cyan-50" },
  { icon: UtensilsCrossed, label: "إفطار صائم", value: "25,000+", color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Package, label: "سلة رمضانية", value: "3,400+", color: "text-green-600", bg: "bg-green-50" },
  { icon: Heart, label: "حالة خاصة مساعدة", value: "940+", color: "text-red-600", bg: "bg-red-50" },
  { icon: Star, label: "متبرع كريم", value: "5,600+", color: "text-yellow-600", bg: "bg-yellow-50" },
];

const STORIES = [
  {
    title: "مشروع سقيا الماء في المناطق النائية",
    desc: "تم توصيل المياه النظيفة لأكثر من 500 أسرة في المناطق النائية خلال عام 2025، بفضل تبرعات المحسنين.",
    tag: "سقيا الماء",
    tagColor: "bg-cyan-100 text-cyan-700",
    icon: Droplets,
    iconColor: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    title: "مبادرة إفطار الصائم في رمضان",
    desc: "وزعنا أكثر من 25,000 وجبة إفطار على الصائمين والمحتاجين في رمضان الماضي في الرياض ومحيطها.",
    tag: "إفطار صائم",
    tagColor: "bg-orange-100 text-orange-700",
    icon: UtensilsCrossed,
    iconColor: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "السلال الرمضانية للأسر المحتاجة",
    desc: "وصلت السلال الرمضانية لـ 3,400+ أسرة محتاجة في مناطق مختلفة من المملكة، كفلت لهم طعاماً كافياً طوال الشهر الكريم.",
    tag: "سلة رمضانية",
    tagColor: "bg-green-100 text-green-700",
    icon: Package,
    iconColor: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "دعم الحالات الإنسانية الخاصة",
    desc: "ساهمت الجمعية في دعم وعلاج وتأهيل أكثر من 940 حالة إنسانية خاصة من مرضى ومحتاجين وأيتام.",
    tag: "حالات خاصة",
    tagColor: "bg-red-100 text-red-700",
    icon: Heart,
    iconColor: "text-red-600",
    bg: "bg-red-50",
  },
];

export default function Impact() {
  useSEO({
    title: "أثر التبرعات",
    description: "تعرّف على الأثر الحقيقي لتبرعاتكم — جمعية طويق للخدمات الإنسانية",
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "hsl(35 28% 97%)" }}>
      <Navbar />
      <main className="flex-1" dir="rtl">
        {/* Hero */}
        <div className="py-14 md:py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(152 42% 22%) 0%, hsl(152 42% 36%) 100%)" }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 border" style={{ backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.25)", color: "white" }}>
              <TrendingUp className="w-4 h-4" />
              الأثر الحقيقي لتبرعاتكم
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              كل ريال يصنع فرقاً
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              شاهد كيف تحوّلت تبرعاتكم إلى حياة أفضل لآلاف الأسر في المملكة
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {IMPACT_STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <s.icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <p className={`text-3xl font-black ${s.color} mb-1`}>{s.value}</p>
                    <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Live stats from DB */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, hsl(152 42% 26%) 0%, hsl(152 42% 36%) 100%)" }}>
              <div className="text-center text-white">
                <p className="text-4xl font-black">{Number(stats.totalDonations || 0).toLocaleString("ar-SA")}</p>
                <p className="text-white/75 mt-1">إجمالي التبرعات المؤكدة (ر.س)</p>
              </div>
              <div className="text-center text-white">
                <p className="text-4xl font-black">{stats.totalBeneficiaries || 0}</p>
                <p className="text-white/75 mt-1">مستفيد مسجّل</p>
              </div>
              <div className="text-center text-white">
                <p className="text-4xl font-black">{stats.totalOrganizations || 0}</p>
                <p className="text-white/75 mt-1">جهة مستفيدة</p>
              </div>
            </div>
          )}

          {/* Impact Stories */}
          <div className="mb-6">
            <h2 className="text-2xl font-black mb-2">قصص الأثر</h2>
            <p className="text-muted-foreground">من وراء كل رقم، قصة إنسانية حقيقية</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STORIES.map((story, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-0 shadow-sm h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${story.bg} rounded-xl flex items-center justify-center shrink-0`}>
                        <story.icon className={`w-6 h-6 ${story.iconColor}`} />
                      </div>
                      <div>
                        <Badge className={`${story.tagColor} mb-2 font-bold`}>{story.tag}</Badge>
                        <h3 className="font-bold text-lg mb-2">{story.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{story.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center p-10 rounded-2xl" style={{ background: "linear-gradient(135deg, hsl(152 42% 93%) 0%, hsl(152 42% 97%) 100%)", border: "1px solid hsl(152 42% 84%)" }}>
            <h3 className="text-2xl font-black mb-3" style={{ color: "hsl(152 42% 22%)" }}>كن جزءاً من الأثر</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">تبرعك اليوم يُضاف لهذه الأرقام ويصنع قصة جديدة</p>
            <a href="/donate" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white text-lg transition-all hover:opacity-90" style={{ backgroundColor: "hsl(152 42% 30%)" }}>
              <Heart className="w-5 h-5" />
              تبرع الآن
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
