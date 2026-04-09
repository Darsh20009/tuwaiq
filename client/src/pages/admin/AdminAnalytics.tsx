import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import {
  TrendingUp, Package, Truck, Users, AlertTriangle, CheckCircle2,
  Clock, XCircle, BarChart3
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
  const { data: analytics, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) return {};
      return res.json();
    },
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) return {};
      return res.json();
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
