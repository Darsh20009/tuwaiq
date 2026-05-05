import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users, CheckCircle2, Timer } from "lucide-react";
import { format } from "date-fns";

export default function AdminAttendance() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [userFilter, setUserFilter] = useState("");

  const { data: records = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/attendance", dateFilter, userFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFilter) params.append("date", dateFilter);
      if (userFilter) params.append("userId", userFilter);
      const res = await fetch(`/api/attendance?${params}`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/employees"] });

  const present = records.filter(r => r.checkIn).length;
  const completed = records.filter(r => r.checkIn && r.checkOut).length;
  const totalHours = records.reduce((s, r) => s + (r.hoursWorked || 0), 0);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-black">سجل الحضور والانصراف</h1>
          <p className="text-muted-foreground text-sm">متابعة حضور جميع الموظفين</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الحاضرون</p>
                <p className="text-2xl font-black text-green-600">{present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">أكملوا دوامهم</p>
                <p className="text-2xl font-black text-blue-600">{completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Timer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي ساعات اليوم</p>
                <p className="text-2xl font-black text-purple-600">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              سجلات الحضور
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-40 text-sm"
                data-testid="input-date-filter"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm py-4">جاري التحميل...</p>
          ) : records.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد سجلات لهذا اليوم</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-right text-muted-foreground text-xs">
                    <th className="pb-3 font-semibold">الموظف</th>
                    <th className="pb-3 font-semibold">الدور</th>
                    <th className="pb-3 font-semibold">وقت الدخول</th>
                    <th className="pb-3 font-semibold">وقت الخروج</th>
                    <th className="pb-3 font-semibold">ساعات العمل</th>
                    <th className="pb-3 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/30" data-testid={`attendance-admin-row-${i}`}>
                      <td className="py-3 font-medium">{r.userName}</td>
                      <td className="py-3 text-muted-foreground text-xs">{r.userRole}</td>
                      <td className="py-3">{r.checkIn ? format(new Date(r.checkIn), "hh:mm a") : "-"}</td>
                      <td className="py-3">{r.checkOut ? format(new Date(r.checkOut), "hh:mm a") : "-"}</td>
                      <td className="py-3">{r.hoursWorked ? `${r.hoursWorked}h` : "-"}</td>
                      <td className="py-3">
                        {r.checkIn && r.checkOut ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">مكتمل</Badge>
                        ) : r.checkIn ? (
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">في الدوام</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">غائب</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
