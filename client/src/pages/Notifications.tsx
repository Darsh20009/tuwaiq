import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, BellOff, Check, CheckCheck, Trash2, AlertCircle, Info, CheckCircle2, AlertTriangle, Moon, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

function NotifIcon({ type }: { type: string }) {
  const cls = "w-5 h-5";
  if (type === "success") return <CheckCircle2 className={cn(cls, "text-green-600")} />;
  if (type === "error") return <AlertCircle className={cn(cls, "text-red-600")} />;
  if (type === "warning") return <AlertTriangle className={cn(cls, "text-amber-600")} />;
  if (type === "prayer") return <Moon className={cn(cls, "text-indigo-600")} />;
  return <Info className={cn(cls, "text-blue-600")} />;
}

function bgColor(type: string) {
  if (type === "success") return "bg-green-50 border-green-100";
  if (type === "error") return "bg-red-50 border-red-100";
  if (type === "warning") return "bg-amber-50 border-amber-100";
  if (type === "prayer") return "bg-indigo-50 border-indigo-100";
  return "bg-blue-50 border-blue-100";
}

function PushStatusBadge() {
  if (typeof Notification === "undefined") return null;
  const perm = Notification.permission;
  if (perm === "granted") return (
    <Badge className="bg-green-100 text-green-800 border-green-200 gap-1 text-xs">
      <Bell className="w-3 h-3" /> الإشعارات مفعّلة
    </Badge>
  );
  if (perm === "denied") return (
    <Badge variant="outline" className="text-red-600 border-red-200 gap-1 text-xs">
      <BellOff className="w-3 h-3" /> محجوبة — فعّلها من إعدادات المتصفح
    </Badge>
  );
  return (
    <Badge variant="outline" className="text-amber-600 border-amber-200 gap-1 text-xs">
      <Bell className="w-3 h-3" /> الإشعارات غير مفعّلة
    </Badge>
  );
}

export default function Notifications() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { notifications, unread, markRead, markAllRead, remove } = useNotifications();
  const { toast } = useToast();
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
  }, [user, isLoading]);

  const sendTestPush = async () => {
    setTestLoading(true);
    try {
      const res = await fetch("/api/notifications/test-push", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "✅ تم الإرسال", description: "ستصلك رسالة اختبار خلال ثوانٍ" });
      } else {
        toast({ title: "❌ فشل", description: data.error || "تأكد من تفعيل الإشعارات أولاً", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ", description: "تعذّر الاتصال بالخادم", variant: "destructive" });
    } finally {
      setTestLoading(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30" dir="rtl">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-2xl">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Bell className="w-5 h-5 text-primary" />
                  الإشعارات
                  {unread > 0 && (
                    <Badge className="bg-red-500 text-white text-xs font-bold">{unread}</Badge>
                  )}
                </CardTitle>
                <div className="mt-1.5">
                  <PushStatusBadge />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Test push notification button */}
                {typeof Notification !== "undefined" && Notification.permission === "granted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={sendTestPush}
                    disabled={testLoading}
                    data-testid="btn-test-push"
                  >
                    {testLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    إشعار تجريبي
                  </Button>
                )}
                {unread > 0 && (
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={markAllRead}>
                    <CheckCheck className="w-3.5 h-3.5" />
                    تحديد الكل كمقروء
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <BellOff className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">لا يوجد إشعارات بعد</p>
                <p className="text-xs text-muted-foreground mt-1">ستظهر هنا إشعارات تبرعاتك وتحديثاتك</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n: any) => (
                  <div
                    key={n._id}
                    className={cn(
                      "flex gap-3 p-4 rounded-xl border transition-all",
                      n.read ? "bg-card opacity-70" : bgColor(n.type)
                    )}
                    data-testid={`notif-row-${n._id}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      <NotifIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-bold", n.read ? "text-foreground/70" : "text-foreground")}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body || n.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {n.createdAt
                            ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ar })
                            : ""}
                        </span>
                        <div className="flex gap-1">
                          {n.link && (
                            <Button size="sm" variant="ghost" className="h-6 text-xs text-primary px-1" asChild>
                              <a href={n.link}>عرض</a>
                            </Button>
                          )}
                          {!n.read && (
                            <Button size="icon" variant="ghost" className="h-6 w-6" title="تحديد كمقروء"
                              onClick={() => markRead(n._id)}>
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" title="حذف"
                            onClick={() => remove(n._id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
