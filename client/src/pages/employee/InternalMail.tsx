import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Send, Inbox, Clock, PenSquare, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

function timeAgo(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  return d.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
}

export default function InternalMail() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [box, setBox] = useState<"inbox" | "sent">("inbox");
  const [selected, setSelected] = useState<any>(null);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ toEmployeeId: "", subject: "", body: "" });

  const { data: mails = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/internal-mail", box],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/internal-mail?box=${box}`, { credentials: "include" });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : [];
      } catch { return []; }
    },
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("PATCH", `/api/internal-mail/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/internal-mail"] }),
  });

  const sendMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/internal-mail", form),
    onSuccess: () => {
      toast({ title: "✓ تم إرسال الرسالة" });
      setComposing(false);
      setForm({ toEmployeeId: "", subject: "", body: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/internal-mail"] });
    },
    onError: (err: any) => toast({ title: "خطأ", description: err.message, variant: "destructive" }),
  });

  const handleOpen = (mail: any) => {
    setSelected(mail);
    if (!mail.readAt && box === "inbox") markReadMutation.mutate(mail.id);
  };

  const unread = (mails as any[]).filter(m => !m.readAt).length;

  return (
    <div className="flex h-screen" dir="rtl">
      {/* Left panel - mail list */}
      <div className="w-80 border-l border-border bg-white dark:bg-card flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="font-black text-lg flex-1">البريد الداخلي</h2>
          {unread > 0 && box === "inbox" && (
            <Badge variant="default" className="text-xs">{unread}</Badge>
          )}
        </div>

        <div className="p-3 border-b border-border space-y-2">
          <Dialog open={composing} onOpenChange={setComposing}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2" data-testid="button-compose-mail">
                <PenSquare className="h-4 w-4" /> رسالة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" dir="rtl">
              <DialogHeader>
                <DialogTitle>إرسال رسالة داخلية</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>المعرف الوظيفي للمستلم</Label>
                  <Input
                    placeholder="مثال: TQ-0001"
                    value={form.toEmployeeId}
                    onChange={e => setForm(f => ({ ...f, toEmployeeId: e.target.value }))}
                    data-testid="input-to-employee-id"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>الموضوع</Label>
                  <Input
                    placeholder="موضوع الرسالة"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    data-testid="input-mail-subject"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>نص الرسالة</Label>
                  <Textarea
                    placeholder="اكتب رسالتك هنا..."
                    rows={6}
                    value={form.body}
                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                    data-testid="input-mail-body"
                  />
                </div>
                <Button
                  className="w-full gap-2"
                  disabled={!form.toEmployeeId || !form.subject || !form.body || sendMutation.isPending}
                  onClick={() => sendMutation.mutate()}
                  data-testid="button-send-mail"
                >
                  {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  إرسال
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex gap-1">
            <Button variant={box === "inbox" ? "default" : "ghost"} size="sm" className="flex-1 gap-1" onClick={() => { setBox("inbox"); setSelected(null); }}>
              <Inbox className="h-3.5 w-3.5" /> الوارد
            </Button>
            <Button variant={box === "sent" ? "default" : "ghost"} size="sm" className="flex-1 gap-1" onClick={() => { setBox("sent"); setSelected(null); }}>
              <Send className="h-3.5 w-3.5" /> المرسل
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
          ) : (mails as any[]).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد رسائل</p>
            </div>
          ) : (
            (mails as any[]).map(mail => (
              <button
                key={mail.id}
                onClick={() => handleOpen(mail)}
                data-testid={`mail-item-${mail.id}`}
                className={`w-full p-3 text-right border-b border-border/30 hover:bg-muted/50 transition-colors ${selected?.id === mail.id ? "bg-primary/5" : ""} ${!mail.readAt && box === "inbox" ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${!mail.readAt && box === "inbox" ? "font-black" : "font-medium"}`}>
                      {box === "inbox" ? mail.fromName : mail.toName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{mail.subject}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-muted-foreground">{timeAgo(mail.createdAt)}</p>
                    {!mail.readAt && box === "inbox" && <div className="w-2 h-2 bg-primary rounded-full mt-1 mr-auto" />}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel - mail content */}
      <div className="flex-1 bg-muted/20 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Mail className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold">اختر رسالة لعرضها</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{selected.subject}</CardTitle>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      <span>من: <strong className="text-foreground">{selected.fromName}</strong> ({selected.fromEmployeeId})</span>
                      <span>إلى: <strong className="text-foreground">{selected.toName}</strong> ({selected.toEmployeeId})</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(selected.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setComposing(true); setForm(f => ({ ...f, toEmployeeId: selected.fromEmployeeId, subject: `رد: ${selected.subject}`, body: "" })); }}>
                    رد
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="whitespace-pre-wrap leading-relaxed text-sm text-foreground">
                  {selected.body}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
