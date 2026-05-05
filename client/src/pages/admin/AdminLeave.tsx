import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  approved: { label: "موافق عليها", color: "bg-green-100 text-green-700 border-green-300" },
  rejected: { label: "مرفوضة", color: "bg-red-100 text-red-700 border-red-300" },
};

export default function AdminLeave() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState("");

  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/leave-requests"],
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/leave-requests/${id}`, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({ title: "تم تحديث الطلب بنجاح" });
      setSelected(null);
      setNote("");
    },
    onError: (e: any) => toast({ title: e.message || "خطأ", variant: "destructive" }),
  });

  const pending = requests.filter(r => r.status === "pending").length;
  const approved = requests.filter(r => r.status === "approved").length;
  const rejected = requests.filter(r => r.status === "rejected").length;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-black">طلبات الإجازة</h1>
          <p className="text-muted-foreground text-sm">مراجعة وإدارة طلبات إجازة الموظفين</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-black text-yellow-600">{pending}</p>
            <p className="text-xs text-muted-foreground mt-1">بانتظار القرار</p>
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
            <p className="text-3xl font-black text-red-600">{rejected}</p>
            <p className="text-xs text-muted-foreground mt-1">مرفوضة</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            جميع الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm py-4">جاري التحميل...</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد طلبات إجازة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r: any) => {
                const status = statusMap[r.status] || statusMap.pending;
                return (
                  <div key={r._id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow" data-testid={`leave-admin-${r._id}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{r.userName}</p>
                        <Badge variant="outline" className="text-xs">{r.userRole}</Badge>
                        <Badge className={`text-xs border ${status.color}`}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.type}</p>
                      <p className="text-xs text-muted-foreground">{r.startDate} → {r.endDate}</p>
                      {r.reason && <p className="text-xs text-muted-foreground">{r.reason}</p>}
                      {r.adminNote && (
                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">ملاحظتك: {r.adminNote}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {format(new Date(r.createdAt), "dd/MM")}
                      </p>
                      {r.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => { setSelected(r); setNote(""); }} data-testid={`button-review-leave-${r._id}`}>
                          مراجعة
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>مراجعة طلب الإجازة</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <p className="font-semibold">{selected.userName}</p>
                <p className="text-sm text-muted-foreground">{selected.type} — {selected.startDate} إلى {selected.endDate}</p>
                {selected.reason && <p className="text-sm">{selected.reason}</p>}
              </div>
              <div>
                <Label>ملاحظة (اختياري)</Label>
                <Textarea
                  placeholder="أضف ملاحظة للموظف..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  data-testid="textarea-admin-leave-note"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>إلغاء</Button>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => update.mutate({ id: selected._id, status: "rejected" })}
                  disabled={update.isPending}
                  data-testid="button-reject-leave"
                >
                  <XCircle className="h-4 w-4 ml-1" />
                  رفض
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => update.mutate({ id: selected._id, status: "approved" })}
                  disabled={update.isPending}
                  data-testid="button-approve-leave"
                >
                  <CheckCircle2 className="h-4 w-4 ml-1" />
                  موافقة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
