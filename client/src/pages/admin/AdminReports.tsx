import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import {
  TrendingUp, Users, BarChart3, Calendar, Target, Award,
  Repeat, UserPlus, Download, FileSpreadsheet
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import * as XLSX from "xlsx";

const COLORS = ["#3F9E6C", "#3399CC", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6"];

function exportToExcel(data: any[], sheetName: string, fileName: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export default function AdminReports() {
  const safeArrayFn = (url: string) => async () => {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    } catch { return []; }
  };

  const safeObjectFn = (url: string, fallback: any = {}) => async () => {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return fallback;
      const json = await res.json();
      return json && typeof json === "object" && !Array.isArray(json) ? json : fallback;
    } catch { return fallback; }
  };

  const { data: dailyDonations = [], isLoading: loadingDaily } = useQuery<any[]>({
    queryKey: ["/api/reports/donations/daily"],
    queryFn: safeArrayFn("/api/reports/donations/daily"),
  });

  const { data: monthlyDonations = [], isLoading: loadingMonthly } = useQuery<any[]>({
    queryKey: ["/api/reports/donations/monthly"],
    queryFn: safeArrayFn("/api/reports/donations/monthly"),
  });

  const { data: campaignPerformance = [], isLoading: loadingCampaigns } = useQuery<any[]>({
    queryKey: ["/api/reports/campaigns/performance"],
    queryFn: safeArrayFn("/api/reports/campaigns/performance"),
  });

  const { data: topDonors = [], isLoading: loadingTopDonors } = useQuery<any[]>({
    queryKey: ["/api/reports/donors/top"],
    queryFn: safeArrayFn("/api/reports/donors/top"),
  });

  const { data: repeatDonors = {}, isLoading: loadingRepeatDonors } = useQuery<any>({
    queryKey: ["/api/reports/donors/repeat"],
    queryFn: safeObjectFn("/api/reports/donors/repeat", { count: 0, totalDonors: 0 }),
  });

  const isLoading = loadingDaily || loadingMonthly || loadingCampaigns || loadingTopDonors || loadingRepeatDonors;

  const handleExportDaily = () => {
    const rows = dailyDonations.map((d: any) => ({
      "اليوم": String(d._id),
      "إجمالي التبرعات (ر.س)": d.totalAmount || 0,
      "عدد التبرعات": d.count || 0,
    }));
    exportToExcel(rows, "التبرعات اليومية", `تقرير-يومي-${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportMonthly = () => {
    const rows = monthlyDonations.map((d: any) => ({
      "الشهر": String(d._id),
      "إجمالي التبرعات (ر.س)": d.totalAmount || 0,
      "عدد التبرعات": d.count || 0,
    }));
    exportToExcel(rows, "التبرعات الشهرية", `تقرير-شهري-${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportCampaigns = () => {
    const rows = campaignPerformance.map((c: any) => ({
      "الحملة": c.title || "",
      "المستهدف (ر.س)": c.goalAmount || 0,
      "المحقق (ر.س)": c.currentAmount || 0,
      "النسبة": `${(((c.currentAmount || 0) / (c.goalAmount || 1)) * 100).toFixed(1)}%`,
      "عدد التبرعات": c.donationCount || 0,
    }));
    exportToExcel(rows, "أداء الحملات", `تقرير-حملات-${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportTopDonors = () => {
    const rows = topDonors.map((d: any, i: number) => ({
      "الترتيب": i + 1,
      "الاسم": d.name || "متبرع",
      "إجمالي التبرعات (ر.س)": d.totalDonated || 0,
      "عدد عمليات التبرع": d.donationCount || 0,
    }));
    exportToExcel(rows, "كبار المتبرعين", `تقرير-متبرعون-${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportAll = () => {
    const wb = XLSX.utils.book_new();

    const dailyRows = dailyDonations.map((d: any) => ({
      "اليوم": String(d._id),
      "إجمالي التبرعات (ر.س)": d.totalAmount || 0,
      "عدد التبرعات": d.count || 0,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailyRows), "يومي");

    const monthlyRows = monthlyDonations.map((d: any) => ({
      "الشهر": String(d._id),
      "إجمالي التبرعات (ر.س)": d.totalAmount || 0,
      "عدد التبرعات": d.count || 0,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyRows), "شهري");

    const campaignRows = campaignPerformance.map((c: any) => ({
      "الحملة": c.title || "",
      "المستهدف (ر.س)": c.goalAmount || 0,
      "المحقق (ر.س)": c.currentAmount || 0,
      "النسبة": `${(((c.currentAmount || 0) / (c.goalAmount || 1)) * 100).toFixed(1)}%`,
      "عدد التبرعات": c.donationCount || 0,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(campaignRows), "الحملات");

    const donorRows = topDonors.map((d: any, i: number) => ({
      "الترتيب": i + 1,
      "الاسم": d.name || "متبرع",
      "إجمالي التبرعات (ر.س)": d.totalDonated || 0,
      "عدد عمليات التبرع": d.donationCount || 0,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(donorRows), "كبار المتبرعين");

    XLSX.writeFile(wb, `تقرير-شامل-طويق-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64" dir="rtl">
        <p className="text-muted-foreground">جاري تحميل التقارير...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-black">التقارير التفصيلية</h1>
            <p className="text-muted-foreground text-sm">تحليل شامل للتبرعات والحملات والمانحين</p>
          </div>
        </div>
        <Button onClick={handleExportAll} className="gap-2 bg-green-600 hover:bg-green-700" data-testid="button-export-all">
          <FileSpreadsheet className="w-4 h-4" />
          تصدير التقرير الشامل (Excel)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-green-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي المتبرعين المتكررين</p>
                <p className="text-xl font-black text-green-600">{repeatDonors?.count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">نسبة الاحتفاظ بالمتبرعين</p>
                <p className="text-xl font-black text-blue-600">
                  {repeatDonors?.totalDonors ? ((repeatDonors.count / repeatDonors.totalDonors) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-purple-500" />
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الحملات النشطة</p>
                <p className="text-xl font-black text-purple-600">{campaignPerformance?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                التبرعات اليومية (آخر 30 يوم)
              </CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleExportDaily} data-testid="button-export-daily">
                <Download className="w-3 h-3" />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyDonations || []}>
                <defs>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3F9E6C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3F9E6C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="_id" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => String(val)}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  labelFormatter={(val) => `اليوم ${val}`}
                  formatter={(v: any) => [`${v.toLocaleString()} ر.س`, "التبرعات"]} 
                />
                <Area type="monotone" dataKey="totalAmount" stroke="#3F9E6C" fill="url(#colorDaily)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                التبرعات الشهرية
              </CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleExportMonthly} data-testid="button-export-monthly">
                <Download className="w-3 h-3" />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyDonations || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="_id" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => {
                    const str = String(val);
                    if (str.includes("-")) {
                      const [year, month] = str.split("-");
                      try { return format(new Date(parseInt(year), parseInt(month) - 1), "MMM yyyy", { locale: ar }); } catch { return str; }
                    }
                    return `يوم ${str}`;
                  }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  labelFormatter={(val) => {
                    const str = String(val);
                    if (str.includes("-")) {
                      const [year, month] = str.split("-");
                      try { return format(new Date(parseInt(year), parseInt(month) - 1), "MMMM yyyy", { locale: ar }); } catch { return str; }
                    }
                    return `اليوم ${str}`;
                  }}
                  formatter={(v: any) => [`${v.toLocaleString()} ر.س`, "التبرعات"]} 
                />
                <Bar dataKey="totalAmount" fill="#3399CC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              أداء الحملات الخيرية
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleExportCampaigns} data-testid="button-export-campaigns">
              <Download className="w-3 h-3" />
              Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 font-bold">الحملة</th>
                  <th className="p-3 font-bold">المستهدف</th>
                  <th className="p-3 font-bold">المحقق</th>
                  <th className="p-3 font-bold">النسبة</th>
                  <th className="p-3 font-bold">عدد التبرعات</th>
                </tr>
              </thead>
              <tbody>
                {campaignPerformance?.map((c, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{c.title}</td>
                    <td className="p-3">{(c.goalAmount || 0).toLocaleString()} ر.س</td>
                    <td className="p-3">{(c.currentAmount || 0).toLocaleString()} ر.س</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(((c.currentAmount || 0) / (c.goalAmount || 1)) * 100, 100)}%` }} 
                          />
                        </div>
                        <span className="text-[10px]">{(((c.currentAmount || 0) / (c.goalAmount || 1)) * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-3">{c.donationCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                كبار المتبرعين
              </CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleExportTopDonors} data-testid="button-export-donors">
                <Download className="w-3 h-3" />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDonors?.map((donor, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{donor.name || "متبرع"}</p>
                      <p className="text-[10px] text-muted-foreground">{donor.donationCount} عملية تبرع</p>
                    </div>
                  </div>
                  <p className="font-black text-primary">{donor.totalDonated?.toLocaleString()} ر.س</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Repeat className="h-4 w-4 text-blue-600" />
              إحصائيات المانحين
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'متبرعون جدد', value: (repeatDonors?.totalDonors || 0) - (repeatDonors?.count || 0) },
                      { name: 'متبرعون متكررون', value: repeatDonors?.count || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#3399CC" />
                    <Cell fill="#3F9E6C" />
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <UserPlus className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <p className="text-[10px] text-muted-foreground">إجمالي المانحين</p>
                  <p className="font-bold">{repeatDonors?.totalDonors || 0}</p>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <Repeat className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <p className="text-[10px] text-muted-foreground">متكررون</p>
                  <p className="font-bold">{repeatDonors?.count || 0}</p>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
