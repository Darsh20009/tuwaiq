import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Mail, Send, CheckCircle2, XCircle, RefreshCw, Loader2, TestTube2,
  BarChart3, Radio, Clock, AlertCircle, Server, Megaphone, Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

function timeAgo(date: string) {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  return d.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
}

const statusConfig = {
  sent: { label: "مُرسل", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  failed: { label: "فشل", color: "bg-red-100 text-red-700", icon: XCircle },
  queued: { label: "في الانتظار", color: "bg-amber-100 text-amber-700", icon: Clock },
};

export default function AdminEmails() {
  const { user } = useAuth() as any;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logsFilter, setLogsFilter] = useState("all");
  const [testEmail, setTestEmail] = useState("");
  const [broadcastForm, setBroadcastForm] = useState({ subject: "", content: "", targetRole: "all" });
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "test" | "broadcast">("overview");

  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/admin/email/stats"],
    refetchInterval: 30000,
  });

  const { data: logs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery<any[]>({
    queryKey: ["/api/admin/email/logs", logsFilter],
    queryFn: async () => {
      const q = logsFilter !== "all" ? `?status=${logsFilter}` : "";
      const res = await fetch(`/api/admin/email/logs${q}`, { credentials: "include" });
      return res.json();
    },
    enabled: activeTab === "logs",
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const to = testEmail || user?.email;
      return await apiRequest("POST", "/api/admin/email/test", { to });
    },
    onSuccess: (data: any) => {
      toast({ title: "✓ تم إرسال بريد الاختبار", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email/stats"] });
    },
    onError: (err: any) => toast({ title: "فشل الإرسال", description: err.message, variant: "destructive" }),
  });

  const broadcastMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/admin/email/broadcast", broadcastForm),
    onSuccess: (data: any) => {
      toast({ title: `✓ تم البث — ${data.sent} ناجح، ${data.failed} فاشل من ${data.total}` });
      setBroadcastForm({ subject: "", content: "", targetRole: "all" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email/stats"] });
    },
    onError: (err: any) => toast({ title: "فشل البث", description: err.message, variant: "destructive" }),
  });

  const resendMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("POST", `/api/admin/email/resend/${id}`, {}),
    onSuccess: () => {
      toast({ title: "✓ تم إعادة الإرسال" });
      refetchLogs();
    },
    onError: (err: any) => toast({ title: "فشل الإعادة", description: err.message, variant: "destructive" }),
  });

  const tabs = [
    { key: "overview", label: "نظرة عامة", icon: BarChart3 },
    { key: "logs", label: "سجل الرسائل", icon: Mail },
    { key: "test", label: "اختبار البريد", icon: TestTube2 },
    { key: "broadcast", label: "بريد جماعي", icon: Megaphone },
  ] as const;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <Mail className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-black">إدارة البريد الإلكتروني</h1>
          <p className="text-xs text-muted-foreground">مركز التحكم في النظام البريدي لجمعية طويق</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1.5 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.key ? "bg-white dark:bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {/* Provider status */}
              <Card className={`border-2 ${stats?.configured ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" : "border-red-200 bg-red-50/50"}`}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats?.configured ? "bg-green-100" : "bg-red-100"}`}>
                    <Server className={`h-6 w-6 ${stats?.configured ? "text-green-600" : "text-red-500"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-base">
                      {stats?.configured ? "✓ النظام البريدي متصل ويعمل" : "✗ النظام البريدي غير مُعدّ"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      المزوّد: <strong>{stats?.provider || "غير محدد"}</strong>
                      {stats?.configured && " — متوافق مع Render بالكامل"}
                    </p>
                  </div>
                  {!stats?.configured && (
                    <Badge variant="destructive">تحتاج إعداد</Badge>
                  )}
                </CardContent>
              </Card>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "إجمالي المُرسلة", value: stats?.total || 0, icon: Mail, color: "bg-blue-50 text-blue-600" },
                  { label: "ناجحة", value: stats?.sent || 0, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
                  { label: "فاشلة", value: stats?.failed || 0, icon: XCircle, color: "bg-red-50 text-red-600" },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <Card key={s.label}>
                      <CardContent className="p-5">
                        <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-3xl font-black">{s.value.toLocaleString("ar-SA")}</p>
                        <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Setup guide */}
              {!stats?.configured && (
                <Card className="border-amber-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                      <AlertCircle className="h-4 w-4" />
                      دليل إعداد النظام البريدي على Render
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">لإعداد البريد الإلكتروني على Render، أضف متغيرات البيئة التالية:</p>
                    <div className="space-y-2">
                      {[
                        { key: "SMTP2GO_API_KEY", desc: "مفتاح SMTP2GO API (الأفضل لـ Render)", required: true },
                        { key: "SMTP_FROM", desc: "بريد المرسل (مثال: noreply@tuwaiq-sa.online)" },
                        { key: "APP_URL", desc: "رابط الموقع (مثال: https://tuwaiq-sa.online)" },
                      ].map(v => (
                        <div key={v.key} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <code className={`text-xs px-2 py-1 rounded font-mono shrink-0 ${v.required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {v.key}
                          </code>
                          <p className="text-xs text-muted-foreground">{v.desc}</p>
                          {v.required && <Badge variant="secondary" className="shrink-0 text-[10px]">مطلوب</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* EMAIL LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
              {["all", "sent", "failed"].map(f => (
                <button key={f} onClick={() => setLogsFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${logsFilter === f ? "bg-white dark:bg-card shadow-sm text-primary" : "text-muted-foreground"}`}>
                  {f === "all" ? "الكل" : f === "sent" ? "ناجحة" : "فاشلة"}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchLogs()} className="gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> تحديث
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="p-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
              ) : (logs as any[]).length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  <Mail className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">لا توجد رسائل في السجل</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 border-b border-border">
                      <tr>
                        <th className="p-3 text-right font-bold text-muted-foreground">المرسل إليه</th>
                        <th className="p-3 text-right font-bold text-muted-foreground">الموضوع</th>
                        <th className="p-3 text-right font-bold text-muted-foreground">المزوّد</th>
                        <th className="p-3 text-right font-bold text-muted-foreground">الحالة</th>
                        <th className="p-3 text-right font-bold text-muted-foreground">الوقت</th>
                        <th className="p-3 text-right font-bold text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {(logs as any[]).map((log: any) => {
                        const st = statusConfig[log.status as keyof typeof statusConfig] || statusConfig.failed;
                        const StatusIcon = st.icon;
                        return (
                          <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-3">
                              <p className="font-medium text-xs">{log.to}</p>
                            </td>
                            <td className="p-3">
                              <p className="text-xs truncate max-w-48">{log.subject}</p>
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-mono">
                                {log.provider || "—"}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit ${st.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {st.label}
                              </span>
                              {log.error && (
                                <p className="text-[10px] text-red-500 mt-1 max-w-32 truncate" title={log.error}>{log.error}</p>
                              )}
                            </td>
                            <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                              {timeAgo(log.createdAt)}
                            </td>
                            <td className="p-3">
                              {log.status === "failed" && (
                                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 px-2"
                                  onClick={() => resendMutation.mutate(log.id)}
                                  disabled={resendMutation.isPending}
                                >
                                  <RefreshCw className="h-2.5 w-2.5" /> إعادة
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TEST EMAIL */}
      {activeTab === "test" && (
        <div className="max-w-lg space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TestTube2 className="h-4 w-4 text-primary" />
                اختبار النظام البريدي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  سيُرسل بريد اختبار للتحقق من أن النظام البريدي يعمل بشكل صحيح على بيئة Render.
                </p>
              </div>
              <div className="space-y-2">
                <Label>إرسال إلى (اختياري)</Label>
                <Input
                  type="email"
                  placeholder={user?.email || "test@example.com"}
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  data-testid="input-test-email"
                />
                <p className="text-xs text-muted-foreground">اتركه فارغاً للإرسال إلى بريدك ({user?.email})</p>
              </div>
              <Button
                className="w-full gap-2"
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
                data-testid="button-send-test-email"
              >
                {testMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> جارٍ الإرسال...</>
                ) : (
                  <><Send className="h-4 w-4" /> إرسال بريد اختبار</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Provider info */}
          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-5 space-y-3">
              <p className="font-bold text-sm flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" /> معلومات المزوّد الحالي
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المزوّد الأساسي</span>
                  <span className="font-bold text-primary">{stats?.provider || "جارٍ التحقق..."}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التوافق مع Render</span>
                  <span className="font-bold text-green-600">✓ مدعوم بالكامل</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إعادة المحاولة التلقائية</span>
                  <span className="font-bold">3 محاولات</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">سجل الرسائل</span>
                  <span className="font-bold">MongoDB ✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BROADCAST */}
      {activeTab === "broadcast" && (
        <div className="max-w-2xl space-y-6">
          <Card className="border-amber-200">
            <CardContent className="p-4">
              <p className="text-sm text-amber-700 font-medium flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                سيتم إرسال هذا البريد إلى جميع المستخدمين المحددين. استخدم هذه الميزة بحذر.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" />
                إرسال بريد جماعي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>المستهدفون</Label>
                <Select value={broadcastForm.targetRole} onValueChange={v => setBroadcastForm(f => ({ ...f, targetRole: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="user">المتبرعون</SelectItem>
                    <SelectItem value="employee">الموظفون</SelectItem>
                    <SelectItem value="accountant">المحاسبون</SelectItem>
                    <SelectItem value="programmer">المبرمجون</SelectItem>
                    <SelectItem value="sales">موظفو المبيعات</SelectItem>
                    <SelectItem value="delivery">موظفو التوصيل</SelectItem>
                    <SelectItem value="manager">المدراء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>موضوع البريد</Label>
                <Input
                  placeholder="موضوع الرسالة"
                  value={broadcastForm.subject}
                  onChange={e => setBroadcastForm(f => ({ ...f, subject: e.target.value }))}
                  data-testid="input-broadcast-subject"
                />
              </div>
              <div className="space-y-2">
                <Label>محتوى الرسالة</Label>
                <Textarea
                  rows={8}
                  placeholder="اكتب محتوى الرسالة هنا..."
                  value={broadcastForm.content}
                  onChange={e => setBroadcastForm(f => ({ ...f, content: e.target.value }))}
                  data-testid="input-broadcast-content"
                />
              </div>
              <Button
                className="w-full gap-2"
                disabled={!broadcastForm.subject || !broadcastForm.content || broadcastMutation.isPending}
                onClick={() => broadcastMutation.mutate()}
                data-testid="button-send-broadcast"
              >
                {broadcastMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> جارٍ البث...</>
                ) : (
                  <><Megaphone className="h-4 w-4" /> إرسال البريد الجماعي</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
