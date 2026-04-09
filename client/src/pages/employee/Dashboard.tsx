import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, FileText, UserCheck, CreditCard, Activity, ArrowUpRight, Heart, TrendingUp, Sparkles, Zap, Download, Smartphone, Apple, HardDrive } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { SiGoogleplay } from "react-icons/si";

function MiniStatCard({ label, value, icon: Icon, gradient, href }: any) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-xl ${gradient}`}>
      <div className="absolute -left-5 -top-5 w-24 h-24 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wider mb-2">{label}</p>
          <p className="text-white text-3xl font-black tracking-tight">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {href && (
        <Link href={href} className="relative z-10 mt-4 flex items-center gap-1 text-white/70 text-[11px] font-bold hover:text-white transition-colors w-fit">
          عرض التفاصيل <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

const quickTasks = [
  { label: "مراجعة التحويلات", desc: "تأكيد التحويلات البنكية المعلقة", href: "/employee/transfers", from: "from-amber-500", to: "to-orange-600", icon: CreditCard },
  { label: "طلبات التوظيف", desc: "مراجعة وتقييم السير الذاتية", href: "/employee/applications", from: "from-blue-500", to: "to-blue-700", icon: UserCheck },
  { label: "سجل الحضور", desc: "تسجيل حضوري وانصرافي اليوم", href: "/employee/attendance", from: "from-emerald-500", to: "to-emerald-700", icon: Clock },
  { label: "طلب إجازة", desc: "تقديم طلب إجازة جديد", href: "/employee/leave", from: "from-violet-500", to: "to-violet-700", icon: FileText },
];

export default function EmployeeDashboard() {
  const { user } = useAuth() as any;
  const [, setLocation] = useLocation();
  const { data: donations } = useQuery<any[]>({
    queryKey: ["/api/donations"],
    queryFn: async () => {
      const res = await fetch("/api/donations", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : (json?.donations ?? []);
    },
  });
  const { data: applications } = useQuery<any[]>({ queryKey: ["/api/job-applications"] });

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 17 ? "مساء النور" : "مساء الخير";

  const pendingTransfers = Array.isArray(donations)
    ? donations.filter((d: any) => d.paymentMethod === "bank_transfer" && d.status === "pending")
    : [];

  const pendingApps = Array.isArray(applications)
    ? applications.filter((app: any) => app.status === "pending")
    : [];

  const totalPending = pendingTransfers.length + pendingApps.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#0a0f0d] dark:via-[#0d1410] dark:to-[#0f1a14]" dir="rtl">
      <div className="p-6 space-y-8 max-w-[1200px] mx-auto">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0a2a1a] via-[#0d3322] to-[#113d28] shadow-2xl">
          <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-emerald-300/5 rounded-full translate-y-1/2 blur-2xl" />

          <div className="relative z-10 flex items-center justify-between p-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-colors" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400/80 text-sm font-semibold">{greeting}</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {user?.name?.split(" ")[0] || "موظف"} 👋
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  {totalPending > 0
                    ? `لديك ${totalPending} مهام تتطلب انتباهك اليوم`
                    : "أنجزت جميع المهام، عمل رائع!"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <img src="/logo-main.png" alt="طويق" className="h-12 w-auto object-contain opacity-80" />
              {totalPending > 0 ? (
                <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span className="text-amber-300 text-xs font-bold">{totalPending} مهمة معلقة</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 text-xs font-bold">جميع المهام مكتملة</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStatCard
            label="تحويلات معلقة"
            value={pendingTransfers.length}
            icon={CreditCard}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            href="/employee/transfers"
          />
          <MiniStatCard
            label="طلبات توظيف"
            value={pendingApps.length}
            icon={UserCheck}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            href="/employee/applications"
          />
          <MiniStatCard
            label="المستفيدون"
            value={24}
            icon={Heart}
            gradient="bg-gradient-to-br from-rose-500 to-rose-700"
          />
          <MiniStatCard
            label="المهام المنجزة"
            value={156}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-violet-500 to-violet-700"
          />
        </div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Operations */}
          <Card className="lg:col-span-2 rounded-2xl border-0 shadow-lg shadow-black/5">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  التحويلات المعلقة
                </CardTitle>
                <Link href="/employee/transfers">
                  <span className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    عرض الكل <ArrowUpRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {pendingTransfers.length > 0 ? (
                  pendingTransfers.slice(0, 5).map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 flex items-center justify-center shrink-0">
                          <CreditCard className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{t.donorName || "متبرع"}</p>
                          <p className="text-xs text-muted-foreground">تحويل بنكي معلق</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-600 text-sm">{Number(t.amount).toLocaleString()} ر.س</span>
                        <Badge variant="secondary" className="text-[10px] rounded-lg">⏳ معلق</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-15 text-emerald-500" />
                    <p className="font-bold text-sm text-emerald-600">لا توجد تحويلات معلقة</p>
                    <p className="text-xs mt-1">أنجزت جميع التحويلات بنجاح</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card className="rounded-2xl border-0 shadow-lg shadow-black/5 overflow-hidden">
            <div className="bg-gradient-to-br from-[#0a2a1a] to-[#1a5c38] p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-white/80 text-sm font-bold">ملخص أدائك</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: "إنجاز المهام", value: 85 },
                  { label: "دقة التحويلات", value: 96 },
                  { label: "التفاعل مع الفريق", value: 72 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white/60">{item.label}</span>
                      <span className="text-white font-black">{item.value}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-emerald-50 to-transparent dark:from-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-md">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">إجمالي التوثيق</p>
                  <p className="text-xl font-black text-foreground">12,450 ر.س</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Quick Tasks ── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              مهام سريعة
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickTasks.map((task) => (
              <div
                key={task.href}
                onClick={() => setLocation(task.href)}
                className="group cursor-pointer relative overflow-hidden rounded-2xl border border-border/40 bg-white dark:bg-card hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${task.from} ${task.to} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10 p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${task.from} ${task.to} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <task.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground group-hover:text-white transition-colors leading-tight">{task.label}</p>
                    <p className="text-[11px] text-muted-foreground group-hover:text-white/70 mt-1 leading-tight transition-colors">{task.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── App Download Section ── */}
        <AppDownloadSection />
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AppDownloadSection() {
  const { data: fileInfo } = useQuery<{ android: any; ios: any }>({
    queryKey: ["/api/app-files/info"],
  });

  const apps = [
    {
      platform: "android" as const,
      label: "تطبيق Android",
      sublabel: "ملف APK / AAB",
      icon: SiGoogleplay,
      gradient: "from-[#01875f] to-[#005c42]",
      accent: "#01875f",
      info: fileInfo?.android,
    },
    {
      platform: "ios" as const,
      label: "تطبيق iOS",
      sublabel: "ملف IPA لأجهزة Apple",
      icon: Apple,
      gradient: "from-[#555] to-[#222]",
      accent: "#555",
      info: fileInfo?.ios,
    },
  ];

  const anyAvailable = apps.some((a) => a.info?.exists);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Download className="h-3.5 w-3.5 text-primary" />
          تحميل تطبيق الجمعية
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
      </div>

      {!anyAvailable && !fileInfo ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-muted-foreground">
          <Smartphone className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold">لا توجد ملفات تطبيق بعد</p>
          <p className="text-xs mt-1">سيضيف المدير ملفات التطبيق قريباً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {apps.map(({ platform, label, sublabel, icon: Icon, gradient, accent, info }) => (
            <div key={platform}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg`}
              data-testid={`app-card-${platform}`}>
              <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-white/10 blur-xl" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 shadow">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-base leading-tight">{label}</p>
                    <p className="text-white/60 text-[11px] mt-0.5">{sublabel}</p>
                    {info?.exists ? (
                      <p className="text-white/50 text-[10px] mt-1 flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatBytes(info.size)} · {new Date(info.uploadedAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                      </p>
                    ) : (
                      <p className="text-white/40 text-[10px] mt-1">غير متاح حالياً</p>
                    )}
                  </div>
                </div>
                {info?.exists ? (
                  <a href={`/api/app-files/download/${platform}`} download data-testid={`btn-download-${platform}`}>
                    <Button size="sm"
                      className="h-9 px-4 text-xs font-bold gap-1.5 bg-white hover:bg-white/90 shrink-0"
                      style={{ color: accent }}>
                      <Download className="w-3.5 h-3.5" />
                      تحميل
                    </Button>
                  </a>
                ) : (
                  <Button size="sm" disabled
                    className="h-9 px-4 text-xs font-bold bg-white/20 text-white/50 cursor-not-allowed shrink-0">
                    قريباً
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
