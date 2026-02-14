import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, FileText, UserCheck, CreditCard, Activity, ArrowUpRight, LayoutDashboard, Users, Heart } from "lucide-react";
import { Link } from "wouter";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { Badge } from "@/components/ui/badge";
// import { ThemeToggle } from "@/components/ThemeToggle";

export default function EmployeeDashboard() {
  const { data: donations } = useQuery<any[]>({ queryKey: ["/api/donations"] });
  const { data: jobs } = useQuery<any[]>({ queryKey: ["/api/jobs"] });
  const { data: applications } = useQuery<any[]>({ queryKey: ["/api/job-applications"] });

  const pendingTransfers = Array.isArray(donations) 
    ? donations.filter((d: any) => d.paymentMethod === "bank_transfer" && d.status === "pending") 
    : [];
  
  const pendingApps = Array.isArray(applications)
    ? applications.filter((app: any) => app.status === "pending")
    : [];

  const style = {
    "--sidebar-width": "18rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-muted/20" dir="rtl">
        <EmployeeSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-primary">لوحة إنجاز المهام</h1>
            </div>
            {/* <ThemeToggle /> */}
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
            <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-primary/5 flex items-center justify-between mb-8 overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="text-2xl font-black text-primary mb-1">مرحباً بك مجدداً</h2>
                <p className="text-muted-foreground font-medium">لديك {pendingTransfers.length + pendingApps.length} مهام جديدة تتطلب انتباهك اليوم.</p>
              </div>
              <div className="w-32 h-32 bg-primary/5 rounded-full absolute -left-8 -top-8 flex items-center justify-center rotate-12">
                <Activity className="w-16 h-16 text-primary/20" />
              </div>
            </div>

            {/* Task Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="hover-elevate bg-white dark:bg-card border-amber-100 dark:border-amber-900 shadow-sm overflow-hidden group">
                <div className="h-1.5 w-full bg-amber-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">تحويلات بانتظار التأكيد</CardTitle>
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl group-hover:rotate-12 transition-transform shadow-sm">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-amber-600 tracking-tight">{pendingTransfers.length}</div>
                  <Link href="/employee/transfers" className="text-xs text-primary font-black hover:underline flex items-center gap-1 mt-4 bg-primary/5 p-2 rounded-lg w-fit transition-colors hover:bg-primary/10">
                    عرض الطلبات <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-elevate bg-white dark:bg-card border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden group">
                <div className="h-1.5 w-full bg-blue-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">طلبات توظيف جديدة</CardTitle>
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:rotate-12 transition-transform shadow-sm">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-blue-600 tracking-tight">{pendingApps.length}</div>
                  <Link href="/employee/applications" className="text-xs text-primary font-black hover:underline flex items-center gap-1 mt-4 bg-primary/5 p-2 rounded-lg w-fit transition-colors hover:bg-primary/10">
                    مراجعة السير <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-elevate bg-white dark:bg-card border-emerald-100 dark:border-emerald-900 shadow-sm overflow-hidden group">
                <div className="h-1.5 w-full bg-emerald-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">حالات مستفيدة نشطة</CardTitle>
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl group-hover:rotate-12 transition-transform shadow-sm">
                    <Heart className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-emerald-600 tracking-tight">24</div>
                  <p className="text-[10px] text-muted-foreground mt-4 font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3" /> تحديث الأسبوع الحالي
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate bg-white dark:bg-card border-purple-100 dark:border-purple-900 shadow-sm overflow-hidden group">
                <div className="h-1.5 w-full bg-purple-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">المهام المنجزة</CardTitle>
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl group-hover:rotate-12 transition-transform shadow-sm">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-purple-600 tracking-tight">156</div>
                  <p className="text-[10px] text-muted-foreground mt-4 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> إجمالي الإنجاز هذا الشهر
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-lg">
                <CardHeader className="border-b bg-muted/5">
                  <CardTitle className="text-lg">سجل العمليات الأخيرة</CardTitle>
                  <CardDescription>آخر الطلبات التي تتطلب إجراءً سريعاً</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {pendingTransfers.length > 0 ? (
                      pendingTransfers.slice(0, 5).map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                              <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">تأكيد تحويل بنكي</p>
                              <p className="text-xs text-muted-foreground">{t.donorName || "متبرع"}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-black text-amber-600">{t.amount} ر.س</p>
                            <Badge variant="outline" className="text-[10px] mt-1">قيد الانتظار</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Activity className="h-12 w-12 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-muted-foreground">لا توجد مهام معلقة حالياً</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-lg">ملخص الأداء</CardTitle>
                  <CardDescription className="text-primary-foreground/70">معدل الإنجاز اليومي</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>إنجاز المهام</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>سرعة الاستجابة</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <LayoutDashboard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs opacity-70 font-medium">إجمالي التبرعات الموثقة</p>
                        <p className="text-xl font-black">12,450 ر.س</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
