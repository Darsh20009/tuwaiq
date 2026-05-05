import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, ComposedChart
} from "recharts";
import {
  TrendingUp, Package, Truck, Users, AlertTriangle, CheckCircle2,
  Clock, XCircle, BarChart3, DollarSign, Target, Award
} from "lucide-react";

const COLORS = ["#3F9E6C", "#3399CC", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6"];

const statusLabels: Record<string, string> = {
  delivered: "مسلّم",
  pending: "معلّق",
  in_transit: "في الطريق",
  failed: "فاشل",
  returned: "مُعاد",
  assigned: "مُعيَّن",
};

export default function AdminAnalytics() {
  const safeFetch = (url: string, fallback: any = {}) => async () => {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return fallback;
      return res.json();
    } catch { return fallback; }
  };

  const { data: analytics, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/analytics"],
    queryFn: safeFetch("/api/admin/analytics"),
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    queryFn: safeFetch("/api/admin/stats"),
  });

  const { data: monthlyDonations = [] } = useQuery<any[]>({
    queryKey: ["/api/reports/donations/monthly"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/reports/donations/monthly", { credentials: "include" });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : [];
      } catch { return []; }
    },
  });

  const { data: campaignPerf = [] } = useQuery<any[]>({
    queryKey: ["/api/reports/campaigns/performance"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/reports/campaigns/performance", { credentials: "include" });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : [];
      } catch { return []; }
    },
  });

  const { data: topDonors = [] } = useQuery<any[]>({
    queryKey: ["/api/reports/donors/top"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/reports/donors/top", { credentials: "include" });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : [];
      } catch { return []; }
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64" dir="rtl">
        <p className="text-muted-foreground">جاري تحميل الإحصائيات...</p>
      </div>
    );
  }

  const deliveryPieData = analytics?.deliveryStats ? [
    { name: statusLabels.delivered, value: analytics.deliveryStats.delivered },
    { name: statusLabels.pending, value: analytics.deliveryStats.pending },
    { name: statusLabels.in_transit, value: analytics.deliveryStats.in_transit },
    { name: statusLabels.failed, value: analytics.deliveryStats.failed },
    { name: statusLabels.returned, value: analytics.deliveryStats.returned },
    { name: statusLabels.assigned, value: analytics.deliveryStats.assigned },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-black">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground text-sm">تحليل شامل لأداء الجمعية</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي التبرعات (ر.س)", value: (stats?.totalDonations || 0).toLocaleString(), color: "green", icon: TrendingUp },
          { label: "المستفيدون", value: stats?.beneficiariesCount || 0, color: "blue", icon: Users },
          { label: "أوامر التوصيل", value: analytics?.deliveryStats?.total || 0, color: "purple", icon: Truck },
          { label: "منتجات منخفضة المخزون", value: analytics?.lowStockCount || 0, color: "orange", icon: Package },
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden">
            <div className={`h-1 bg-${item.color}-500`} />
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-${item.color}-50 flex items-center justify-center`}>
                  <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`text-xl font-black text-${item.color}-600`}>{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Financial Donation Charts ────────────────────────────────────── */}
      {monthlyDonations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            التحليل المالي للتبرعات
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  التبرعات الشهرية (ر.س)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={monthlyDonations}>
                    <defs>
                      <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3F9E6C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3F9E6C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} ر.س`]} />
                    <Area type="monotone" dataKey="totalAmount" stroke="#3F9E6C" fill="url(#colorMonthly)" strokeWidth={2} name="المبلغ" />
                    <Bar dataKey="count" fill="#3399CC" radius={[3, 3, 0, 0]} name="عدد التبرعات" yAxisId={0} opacity={0.6} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {campaignPerf.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    أداء الحملات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto">
                    {campaignPerf.slice(0, 6).map((c: any, i: number) => {
                      const pct = c.goalAmount ? Math.min(100, Math.round((c.totalRaised / c.goalAmount) * 100)) : 0;
                      return (
                        <div key={i} className="space-y-1" data-testid={`campaign-perf-${i}`}>
                          <div className="flex justify-between text-xs">
                            <span className="font-medium truncate max-w-[180px]">{c.titleAr || c.title}</span>
                            <span className="font-bold text-emerald-600 shrink-0">{pct}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : pct >= 60 ? "bg-primary" : pct >= 30 ? "bg-amber-500" : "bg-red-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">{Number(c.totalRaised || 0).toLocaleString()} من {Number(c.goalAmount || 0).toLocaleString()} ر.س</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {topDonors.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-600" />
                  أعلى المتبرعين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topDonors.slice(0, 5).map((d: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30" data-testid={`top-donor-${i}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-400" : "bg-primary/60"}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{d.donorName || d.name || "متبرع"}</p>
                        <p className="text-xs text-muted-foreground">{d.donationCount || 1} تبرع</p>
                      </div>
                      <p className="font-black text-emerald-600 text-sm">{Number(d.totalAmount || d.totalDonations || 0).toLocaleString()} ر.س</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              التبرعات - آخر 6 أشهر (ر.س)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics?.donationsByMonth || []}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3F9E6C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3F9E6C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [`${v.toLocaleString()} ر.س`, "التبرعات"]} />
                <Area type="monotone" dataKey="amount" stroke="#3F9E6C" fill="url(#colorDonations)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              المستفيدون الجدد - آخر 6 أشهر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics?.beneficiariesByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [v, "مستفيد"]} />
                <Bar dataKey="count" fill="#3399CC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-600" />
              التوصيلات - آخر 6 أشهر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics?.deliveriesByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [v, "توصيل"]} />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              حالات التوصيل
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deliveryPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={deliveryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {deliveryPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">لا توجد بيانات بعد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {analytics?.agentStats?.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              أداء مناديب التوصيل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.agentStats.map((agent: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30" data-testid={`agent-stat-${i}`}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {agent.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm">{agent.name}</p>
                      <Badge variant={agent.rate >= 80 ? "default" : agent.rate >= 50 ? "secondary" : "outline"} className="text-xs">
                        {agent.rate}% إتمام
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>المجموع: {agent.total}</span>
                      <span className="text-green-600">مُسلَّم: {agent.delivered}</span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${agent.rate >= 80 ? "bg-green-500" : agent.rate >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${agent.rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics?.lowStockProducts?.length > 0 && (
        <Card className="border-0 shadow-sm border-orange-200">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              منتجات تحتاج تزويد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.lowStockProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200" data-testid={`low-stock-${i}`}>
                  <p className="font-medium text-sm text-orange-800">{p.name}</p>
                  <div className="text-xs text-orange-700">
                    <span className="font-bold">{p.quantity}</span> متبقي (الحد: {p.minStock})
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics?.donationTypes?.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold">أنواع التبرعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.donationTypes.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30" data-testid={`donation-type-${i}`}>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.count} عملية تبرع</p>
                  </div>
                  <p className="font-bold text-green-600">{t.value?.toLocaleString()} ر.س</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
