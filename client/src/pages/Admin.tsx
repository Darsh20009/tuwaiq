import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DollarSign, TrendingUp, Loader2, Users, Briefcase,
  Heart, Activity, ArrowUpRight, CreditCard, FileText,
  Globe, Newspaper, Settings, CheckCircle2, Clock, XCircle,
  BarChart3, UserCheck, ChevronLeft, Award, Droplet, Moon, Utensils, ClipboardList,
  Sparkles
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

import { format } from "date-fns";
import { ar } from "date-fns/locale";

const COLORS = ["#3F9E6C", "#3399CC", "#f59e0b", "#8b5cf6", "#ef4444"];

function StatCard({ label, value, icon: Icon, gradient, sub, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-xl ${gradient}`}
    >
      {/* Background decorative circle */}
      <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors" />
      <div className="absolute -left-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
          <p className="text-white text-3xl font-black tracking-tight leading-none">{value}</p>
          {sub && <p className="text-white/60 text-[11px] font-medium mt-2">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      {onClick && (
        <div className="relative z-10 mt-4 flex items-center gap-1 text-white/70 text-[11px] font-bold group-hover:text-white transition-colors">
          عرض التفاصيل <ArrowUpRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const now = new Date();
  const timeLabel = now.getHours() < 12 ? "صباح الخير" : now.getHours() < 17 ? "مساء النور" : "مساء الخير";

  const quickLinks = [
    { label: "محرر الصفحات", icon: Globe, url: "/admin/pages", from: "from-blue-500", to: "to-blue-700", desc: "تعديل محتوى الموقع" },
    { label: "الأخبار", icon: Newspaper, url: "/admin/news", from: "from-emerald-500", to: "to-emerald-700", desc: "إدارة الأخبار والمقالات" },
    { label: "التبرعات", icon: DollarSign, url: "/admin/donations", from: "from-amber-500", to: "to-amber-700", desc: "عرض جميع التبرعات" },
    { label: "التحويلات", icon: CreditCard, url: "/admin/transfers", from: "from-violet-500", to: "to-violet-700", desc: "تأكيد التحويلات البنكية" },
    { label: "الوظائف", icon: Briefcase, url: "/admin/jobs", from: "from-rose-500", to: "to-rose-700", desc: "نشر وإدارة الوظائف" },
    { label: "الطلبات", icon: UserCheck, url: "/admin/applications", from: "from-teal-500", to: "to-teal-700", desc: "مراجعة طلبات التوظيف" },
    { label: "المستخدمون", icon: Users, url: "/admin/users", from: "from-indigo-500", to: "to-indigo-700", desc: "إدارة حسابات المستخدمين" },
    { label: "الإعدادات", icon: Settings, url: "/admin/settings", from: "from-slate-500", to: "to-slate-700", desc: "إعدادات الموقع العامة" },
    { label: "سقيا الماء", icon: Droplet, url: "/admin/campaigns?type=water", from: "from-cyan-500", to: "to-cyan-700", desc: "إدارة حملة سقيا الماء" },
    { label: "سلة رمضانية", icon: Moon, url: "/admin/campaigns?type=ramadan", from: "from-orange-500", to: "to-orange-700", desc: "إدارة السلال الرمضانية" },
    { label: "إفطار صائم", icon: Utensils, url: "/admin/campaigns?type=iftar", from: "from-lime-500", to: "to-lime-700", desc: "إدارة إفطار الصائم" },
    { label: "الحالات الخاصة", icon: ClipboardList, url: "/admin/cases", from: "from-fuchsia-500", to: "to-fuchsia-700", desc: "إنشاء نماذج تسجيل الحالات" },
  ];

  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
  });

  const { data: monthlyDonations } = useQuery<any[]>({
    queryKey: ["/api/reports/donations/monthly"],
    queryFn: async () => {
      const res = await fetch("/api/reports/donations/monthly", { credentials: "include" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || data || [];
    },
  });

  const { data: topDonors } = useQuery<any[]>({
    queryKey: ["/api/reports/donors/top"],
    queryFn: async () => {
      const res = await fetch("/api/reports/donors/top", { credentials: "include" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || data || [];
    },
  });

  const { data: donations } = useQuery<any[]>({
    queryKey: ["/api/admin/donations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/donations", { credentials: "include" });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.donations || data.data || []);
    },
  });

  const { data: applications } = useQuery<any[]>({
    queryKey: ["/api/job-applications"],
    queryFn: async () => {
      const res = await fetch("/api/job-applications");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: transfers } = useQuery<any[]>({
    queryKey: ["/api/bank-transfers"],
    queryFn: async () => {
      const res = await fetch("/api/bank-transfers");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const pendingTransfers = transfers?.filter(t => t.status === "pending") || [];
  const pendingApps = applications?.filter(a => a.status === "pending") || [];
  const recentDonations = donations?.slice(0, 5) || [];

  const donationMonthlyData = (monthlyDonations || []).map((d: any) => {
    if (d?._id === undefined || d?._id === null) return { name: "", amount: 0 };
    const id = d._id;
    try {
      if (typeof id === "number") {
        return { name: `${id}`, amount: d.totalAmount || 0 };
      }
      const [year, month] = String(id).split("-");
      return {
        name: format(new Date(parseInt(year), parseInt(month) - 1), "MMM", { locale: ar }),
        amount: d.totalAmount || 0,
      };
    } catch {
      return { name: String(id), amount: d.totalAmount || 0 };
    }
  }).filter(d => d.name);

  const topDonorsList = topDonors?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#0a0f0d] dark:via-[#0d1410] dark:to-[#0f1a14]" dir="rtl">
      <div className="p-4 md:p-6 space-y-5 md:space-y-8 max-w-[1440px] mx-auto">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-l from-[#0a2a1a] via-[#0d3322] to-[#113d28] shadow-xl md:shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-48 md:w-80 h-48 md:h-80 bg-emerald-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-36 md:w-60 h-36 md:h-60 bg-emerald-300/5 rounded-full translate-y-1/2 blur-2xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-8">
            <div className="flex items-center gap-3 md:gap-5">
              <SidebarTrigger className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-colors shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-400" />
                  <span className="text-emerald-400/80 text-xs md:text-sm font-semibold">{timeLabel}</span>
                </div>
                <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">
                  {user?.name?.split(" ")[0] || "مدير"} 👋
                </h1>
                <p className="text-white/50 text-xs md:text-sm mt-1 font-medium">لوحة التحكم — جمعية طويق للخدمات الإنسانية</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-3">
              <img src="/images/logo-main.png" alt="طويق" className="h-8 md:h-14 w-auto object-contain opacity-90" />
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-[10px] md:text-xs font-bold">النظام يعمل</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">جاري تحميل البيانات...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="إجمالي التبرعات"
                value={`${Number(stats?.totalDonations || 0).toLocaleString()}`}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                sub="ريال سعودي مؤكد"
                onClick={() => setLocation("/admin/donations")}
              />
              <StatCard
                label="المستفيدون"
                value={stats?.totalBeneficiaries || 0}
                icon={Heart}
                gradient="bg-gradient-to-br from-rose-500 to-rose-700"
                sub="مستفيد مسجل في النظام"
              />
              <StatCard
                label="تحويلات معلقة"
                value={pendingTransfers.length}
                icon={CreditCard}
                gradient="bg-gradient-to-br from-amber-500 to-amber-700"
                sub="بانتظار المراجعة والتأكيد"
                onClick={() => setLocation("/admin/transfers")}
              />
              <StatCard
                label="طلبات التوظيف"
                value={pendingApps.length}
                icon={UserCheck}
                gradient="bg-gradient-to-br from-violet-500 to-violet-700"
                sub="طلب جديد بانتظار القرار"
                onClick={() => setLocation("/admin/applications")}
              />
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 rounded-2xl border-0 shadow-lg shadow-black/5">
                <CardHeader className="pb-2 px-6 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">التبرعات الشهرية</CardTitle>
                      <CardDescription className="text-xs">إجمالي التبرعات خلال الأشهر الماضية</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={donationMonthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: any) => [`${v.toLocaleString()} ر.س`, "التبرعات"]}
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                      />
                      <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3F9E6C" />
                          <stop offset="100%" stopColor="#2d7a52" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-lg shadow-black/5">
                <CardHeader className="pb-2 px-6 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Award className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">كبار المتبرعين</CardTitle>
                      <CardDescription className="text-xs">أكثر المانحين عطاءً وسخاءً</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {topDonorsList.map((donor: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-l from-amber-50/80 to-transparent dark:from-amber-900/10 border border-amber-100/50 dark:border-amber-800/20">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0 ${
                          i === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600" :
                          i === 1 ? "bg-gradient-to-br from-slate-400 to-slate-600" :
                          i === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                          "bg-gradient-to-br from-emerald-400 to-emerald-600"
                        }`}>
                          {i + 1}
                        </div>
                        <span className="text-xs font-bold truncate flex-1">{donor.name || "متبرع"}</span>
                        <span className="text-xs font-black text-primary shrink-0">{donor.totalDonated?.toLocaleString()} ر.س</span>
                      </div>
                    ))}
                    {topDonorsList.length === 0 && (
                      <div className="py-10 text-center text-muted-foreground">
                        <Award className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">لا توجد بيانات بعد</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Recent Donations + KPIs ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 rounded-2xl border-0 shadow-lg shadow-black/5">
                <CardHeader className="pb-3 px-6 pt-6 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">آخر التبرعات</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary text-xs gap-1 hover:bg-primary/8 rounded-xl font-bold" onClick={() => setLocation("/admin/donations")}>
                      عرض الكل <ChevronLeft className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40">
                    {recentDonations.length === 0 ? (
                      <div className="p-10 text-center text-muted-foreground">
                        <Activity className="h-10 w-10 mx-auto mb-3 opacity-15" />
                        <p className="text-sm font-medium">لا توجد تبرعات حتى الآن</p>
                      </div>
                    ) : (
                      recentDonations.map((d: any) => (
                        <div key={d.id} className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 hover:bg-muted/20 transition-colors gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                              <DollarSign className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{d.donorName || "فاعل خير"}</p>
                              <p className="text-xs text-muted-foreground truncate">{d.type || "تبرع عام"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-black text-primary text-sm">{Number(d.amount).toLocaleString()} ر.س</span>
                            <Badge
                              variant={d.status === "success" ? "default" : d.status === "pending" ? "secondary" : "destructive"}
                              className="text-[10px] rounded-lg hidden sm:flex"
                            >
                              {d.status === "success" ? "✓ مؤكد" : d.status === "pending" ? "⏳ معلق" : "✗ مرفوض"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="rounded-2xl border-0 shadow-lg shadow-black/5">
                  <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      مؤشرات الأداء
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-5">
                    {[
                      { label: "معدل تأكيد التبرعات", value: 87, color: "from-emerald-400 to-emerald-600" },
                      { label: "إنجاز مراجعة الطلبات", value: 65, color: "from-blue-400 to-blue-600" },
                      { label: "تقييم رضا المتبرعين", value: 94, color: "from-amber-400 to-amber-600" },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="text-foreground font-black">{item.value}%</span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all duration-700`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ── Quick Access ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  الوصول السريع
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {quickLinks.map((link) => (
                  <div
                    key={link.url}
                    onClick={() => setLocation(link.url)}
                    className="group cursor-pointer relative overflow-hidden rounded-2xl border border-border/40 bg-white dark:bg-card hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${link.from} ${link.to} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative z-10 p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.from} ${link.to} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <link.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground group-hover:text-white transition-colors">{link.label}</p>
                        <p className="text-[11px] text-muted-foreground group-hover:text-white/70 mt-0.5 leading-tight transition-colors">{link.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
