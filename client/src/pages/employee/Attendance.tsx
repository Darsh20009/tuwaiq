import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Clock, LogIn, LogOut, Calendar, CheckCircle2, XCircle, Timer } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function EmployeeAttendance() {
  const { toast } = useToast();

  const { data: today, isLoading: todayLoading } = useQuery<any>({
    queryKey: ["/api/attendance/today"],
  });

  const { data: history = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/my"],
  });

  const checkin = useMutation({
    mutationFn: () => apiRequest("POST", "/api/attendance/checkin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/my"] });
      toast({ title: "تم تسجيل الحضور بنجاح" });
    },
    onError: (e: any) => toast({ title: e.message || "خطأ", variant: "destructive" }),
  });

  const checkout = useMutation({
    mutationFn: () => apiRequest("POST", "/api/attendance/checkout"),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/my"] });
      toast({ title: `تم تسجيل الانصراف — ${data.hoursWorked} ساعة عمل` });
    },
    onError: (e: any) => toast({ title: e.message || "خطأ", variant: "destructive" }),
  });

  const now = new Date();
  const todayStr = format(now, "EEEE، d MMMM yyyy", { locale: ar });

  const totalHours = history.reduce((sum: number, r: any) => sum + (r.hoursWorked || 0), 0);
  const presentDays = history.filter((r: any) => r.checkIn).length;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-2">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-black">سجل الحضور</h1>
          <p className="text-muted-foreground text-sm">{todayStr}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">أيام الحضور</p>
                <p className="text-2xl font-black text-green-600">{presentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي ساعات العمل</p>
                <p className="text-2xl font-black text-blue-600">{totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">متوسط ساعات اليوم</p>
                <p className="text-2xl font-black text-purple-600">
                  {presentDays > 0 ? (totalHours / presentDays).toFixed(1) : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            سجل اليوم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayLoading ? (
            <p className="text-muted-foreground text-sm">جاري التحميل...</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="space-y-1">
                {today?.checkIn ? (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>وقت الدخول: <strong>{format(new Date(today.checkIn), "hh:mm a")}</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span>لم يتم تسجيل الحضور بعد</span>
                  </div>
                )}
                {today?.checkOut && (
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>وقت الخروج: <strong>{format(new Date(today.checkOut), "hh:mm a")}</strong></span>
                  </div>
                )}
                {today?.hoursWorked && (
                  <p className="text-xs text-muted-foreground">ساعات العمل: {today.hoursWorked} ساعة</p>
                )}
              </div>
              <div className="flex gap-2">
                {!today?.checkIn && (
                  <Button
                    onClick={() => checkin.mutate()}
                    disabled={checkin.isPending}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    data-testid="button-checkin"
                  >
                    <LogIn className="h-4 w-4" />
                    {checkin.isPending ? "جاري..." : "تسجيل الحضور"}
                  </Button>
                )}
                {today?.checkIn && !today?.checkOut && (
                  <Button
                    onClick={() => checkout.mutate()}
                    disabled={checkout.isPending}
                    variant="outline"
                    className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    data-testid="button-checkout"
                  >
                    <LogOut className="h-4 w-4" />
                    {checkout.isPending ? "جاري..." : "تسجيل الانصراف"}
                  </Button>
                )}
                {today?.checkIn && today?.checkOut && (
                  <Badge variant="outline" className="text-green-600 border-green-300 px-3 py-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                    مكتمل
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">السجل السابق</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">لا يوجد سجل بعد</p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 30).map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 text-sm" data-testid={`attendance-row-${i}`}>
                  <span className="font-medium">{r.date}</span>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    {r.checkIn && <span>دخول: {format(new Date(r.checkIn), "hh:mm a")}</span>}
                    {r.checkOut && <span>خروج: {format(new Date(r.checkOut), "hh:mm a")}</span>}
                    {r.hoursWorked && (
                      <Badge variant="secondary" className="text-xs">{r.hoursWorked}h</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
