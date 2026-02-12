import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, FileText, UserCheck, CreditCard, Activity, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";

export default function EmployeeDashboard() {
  const { data: donations } = useQuery<any[]>({ queryKey: ["/api/donations"] });
  const { data: jobs } = useQuery<any[]>({ queryKey: ["/api/jobs"] });

  const pendingTransfers = Array.isArray(donations) 
    ? donations.filter((d: any) => d.paymentMethod === "bank_transfer" && d.status === "pending") 
    : [];
  
  const style = {
    "--sidebar-width": "18rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-muted/20" dir="rtl">
        <EmployeeSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-primary">لوحة تحكم الموظف</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover-elevate bg-gradient-to-br from-amber-500/10 to-transparent border-amber-200/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">تحويلات معلقة</CardTitle>
                  <Clock className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">{pendingTransfers.length}</div>
                  <Link href="/employee/transfers" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                    مراجعة الآن <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-elevate bg-gradient-to-br from-blue-500/10 to-transparent border-blue-200/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">الوظائف النشطة</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{Array.isArray(jobs) ? jobs.length : 0}</div>
                  <Link href="/employee/applications" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                    إدارة الوظائف <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-elevate bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-200/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">المهام اليومية</CardTitle>
                  <Activity className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">12</div>
                  <p className="text-xs text-muted-foreground mt-2">تم إنجاز 8 مهام اليوم</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate bg-gradient-to-br from-purple-500/10 to-transparent border-purple-200/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">رسائل جديدة</CardTitle>
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">5</div>
                  <p className="text-xs text-muted-foreground mt-2">تتطلب رداً عاجلاً</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>آخر النشاطات</CardTitle>
                  <CardDescription>نظرة سريعة على آخر التحركات في المنصة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTransfers.slice(0, 3).map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">تحويل بنكي جديد</p>
                            <p className="text-xs text-muted-foreground">{t.donorName || "فاعل خير"}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">{t.amount} ر.س</p>
                          <p className="text-[10px] text-muted-foreground">منذ ساعة</p>
                        </div>
                      </div>
                    ))}
                    {pendingTransfers.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">لا توجد نشاطات جديدة</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات الأداء</CardTitle>
                  <CardDescription>معدل إنجاز المهام هذا الشهر</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">قيد التطوير...</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
