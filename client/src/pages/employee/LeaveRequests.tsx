import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  approved: { label: "موافق عليها", color: "bg-green-100 text-green-700 border-green-300" },
  rejected: { label: "مرفوضة", color: "bg-red-100 text-red-700 border-red-300" },
};

const leaveTypes = ["إجازة سنوية", "إجازة مرضية", "إجازة طارئة", "إجازة بدون راتب", "أخرى"];

export default function EmployeeLeaveRequests() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "", startDate: "", endDate: "", reason: "" });

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ["/api/leave-requests/my"],
  });

  const submit = useMutation({
    mutationFn: () => apiRequest("POST", "/api/leave-requests", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests/my"] });
      toast({ title: "تم تقديم طلب الإجازة بنجاح" });
      setOpen(false);
      setForm({ type: "", startDate: "", endDate: "", reason: "" });
    },
    onError: (e: any) => toast({ title: e.message || "خطأ", variant: "destructive" }),
  });

  const pending = requests.filter(r => r.status === "pending").length;
  const approved = requests.filter(r => r.status === "approved").length;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-black">طلبات الإجازة</h1>
            <p className="text-muted-foreground text-sm">إدارة إجازاتي وطلباتي</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2" data-testid="button-new-leave">
          <Plus className="h-4 w-4" />
          طلب إجازة جديد
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-black text-yellow-600">{pending}</p>
            <p className="text-xs text-muted-foreground mt-1">قيد المراجعة</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-black text-green-600">{approved}</p>
            <p className="text-xs text-muted-foreground mt-1">موافق عليها</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-black text-primary">{requests.length}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الطلبات</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            طلباتي
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد طلبات إجازة بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r: any) => {
                const status = statusMap[r.status] || statusMap.pending;
                return (
                  <div key={r._id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow" data-testid={`leave-request-${r._id}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{r.type}</p>
                        <Badge className={`text-xs border ${status.color}`}>{status.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.startDate} → {r.endDate}</p>
                      {r.reason && <p className="text-xs text-muted-foreground">{r.reason}</p>}
                      {r.adminNote && (
                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">ملاحظة الإدارة: {r.adminNote}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(r.createdAt), "dd/MM/yyyy")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>طلب إجازة جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>نوع الإجازة</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger data-testid="select-leave-type">
                  <SelectValue placeholder="اختر نوع الإجازة" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>من تاريخ</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} data-testid="input-start-date" />
              </div>
              <div>
                <Label>إلى تاريخ</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} data-testid="input-end-date" />
              </div>
            </div>
            <div>
              <Label>السبب</Label>
              <Textarea
                placeholder="اذكر سبب الإجازة..."
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                data-testid="textarea-leave-reason"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button
                onClick={() => submit.mutate()}
                disabled={submit.isPending || !form.type || !form.startDate || !form.endDate}
                data-testid="button-submit-leave"
              >
                {submit.isPending ? "جاري الإرسال..." : "تقديم الطلب"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
