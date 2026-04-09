import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Plus, Send, Info, AlertTriangle, Package, UserCheck } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const typeIcons: Record<string, any> = {
  attendance: UserCheck,
  stock: Package,
  leave: AlertTriangle,
  info: Info,
};

const typeColors: Record<string, string> = {
  attendance: "text-blue-500 bg-blue-50",
  stock: "text-orange-500 bg-orange-50",
  leave: "text-yellow-500 bg-yellow-50",
  info: "text-gray-500 bg-gray-50",
};

const roleLabels: Record<string, string> = {
  all: "الجميع",
  admin: "المدراء",
  manager: "المديرون",
  employee: "الموظفون",
  accountant: "المحاسبون",
  delivery: "المناديب",
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ message: "", targetRole: "all", type: "info" });

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 15000,
  });

  const send = useMutation({
    mutationFn: () => apiRequest("POST", "/api/notifications", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "تم إرسال الإشعار بنجاح" });
      setOpen(false);
      setForm({ message: "", targetRole: "all", type: "info" });
    },
    onError: (e: any) => toast({ title: e.message || "خطأ", variant: "destructive" }),
  });

  const unread = notifications.filter(n => !n.readBy?.length).length;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-black">مركز الإشعارات</h1>
            <p className="text-muted-foreground text-sm">إرسال وإدارة الإشعارات للفريق</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2" data-testid="button-send-notification">
          <Plus className="h-4 w-4" />
          إشعار جديد
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-black text-primary">{notifications.length}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الإشعارات</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-black text-orange-600">{unread}</p>
            <p className="text-xs text-muted-foreground mt-1">غير مقروءة</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            جميع الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4">جاري التحميل...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد إشعارات بعد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n: any) => {
                const Icon = typeIcons[n.type] || Info;
                const color = typeColors[n.type] || typeColors.info;
                const isRead = n.readBy?.length > 0;
                return (
                  <div key={n._id} className={`flex items-start gap-3 p-4 rounded-xl border ${!isRead ? "bg-primary/5 border-primary/20" : "bg-card"}`} data-testid={`notification-admin-${n._id}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{roleLabels[n.targetRole] || n.targetRole}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ar })}
                        </span>
                        {!isRead && <span className="text-xs text-primary font-medium">• غير مقروء</span>}
                      </div>
                    </div>
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
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              إرسال إشعار جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>نص الإشعار</Label>
              <Textarea
                placeholder="اكتب نص الإشعار هنا..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                data-testid="textarea-notification-message"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الجمهور المستهدف</Label>
                <Select value={form.targetRole} onValueChange={v => setForm(f => ({ ...f, targetRole: v }))}>
                  <SelectTrigger data-testid="select-notification-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>النوع</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger data-testid="select-notification-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">معلومة</SelectItem>
                    <SelectItem value="stock">مخزون</SelectItem>
                    <SelectItem value="leave">إجازة</SelectItem>
                    <SelectItem value="attendance">حضور</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button
                onClick={() => send.mutate()}
                disabled={send.isPending || !form.message}
                data-testid="button-send-notification-submit"
              >
                <Send className="h-4 w-4 ml-2" />
                {send.isPending ? "جاري الإرسال..." : "إرسال"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
