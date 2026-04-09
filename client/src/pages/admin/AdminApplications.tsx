import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Loader2, UserCheck, FileText, Phone, Mail, Calendar,
  CheckCircle2, XCircle, Clock, Search, User, Briefcase, Shield, Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SidebarTrigger } from "@/components/ui/sidebar";

const STATUS: any = {
  pending: { label: "جديد", variant: "secondary", icon: Clock },
  approved: { label: "مقبول", variant: "default", icon: CheckCircle2 },
  rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
};

const ROLES = [
  { value: "employee", label: "موظف عام" },
  { value: "delivery", label: "موظف توصيل" },
  { value: "programmer", label: "مبرمج" },
  { value: "accountant", label: "محاسب" },
  { value: "sales", label: "موظف مبيعات وتسويق" },
  { value: "manager", label: "مدير" },
];

export default function AdminApplications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approveDialog, setApproveDialog] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("employee");

  const { data: applications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/job-applications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/job-applications", { credentials: "include" });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : [];
      } catch { return []; }
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, role }: { id: string; status: string; role?: string }) => {
      await apiRequest("PATCH", `/api/job-applications/${id}/status`, { status, role });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
      if (status === "approved") {
        toast({
          title: "✓ تم قبول الموظف وإرسال بريد إعداد الحساب",
          description: "سيصل رابط إعداد كلمة المرور إلى بريده الإلكتروني",
        });
        setApproveDialog(null);
      } else {
        toast({ title: "تم رفض الطلب" });
      }
    },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/job-applications/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
      toast({ title: "✓ تم حذف الطلب" });
    },
  });

  const filtered = (applications || []).filter((a) => {
    const matchSearch = !search || a.name?.includes(search) || a.email?.includes(search) || a.phone?.includes(search) || a.jobTitle?.includes(search);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: (applications || []).length,
    pending: (applications || []).filter((a) => a.status === "pending").length,
    approved: (applications || []).filter((a) => a.status === "approved").length,
    rejected: (applications || []).filter((a) => a.status === "rejected").length,
  };

  const handleApprove = () => {
    if (!approveDialog) return;
    statusMutation.mutate({ id: approveDialog.id, status: "approved", role: selectedRole });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-black">طلبات التوظيف</h1>
            <p className="text-xs text-muted-foreground">مراجعة وإدارة طلبات الانضمام وترخيص الموظفين</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "الكل", count: counts.all },
          { key: "pending", label: "جديد", count: counts.pending },
          { key: "approved", label: "مقبول", count: counts.approved },
          { key: "rejected", label: "مرفوض", count: counts.rejected },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setStatusFilter(btn.key)}
            data-testid={`filter-${btn.key}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
              statusFilter === btn.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            {btn.label}
            <Badge variant={statusFilter === btn.key ? "secondary" : "outline"} className="text-[10px] h-4 px-1">
              {btn.count}
            </Badge>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="بحث بالاسم أو البريد أو الجوال..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" data-testid="input-search-applications" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold">لا توجد طلبات</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((app: any) => {
              const st = STATUS[app.status] || STATUS.pending;
              const StatusIcon = st.icon;
              return (
                <Card key={app.id} className="overflow-hidden hover:shadow-sm transition-shadow" data-testid={`application-card-${app.id}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                              {app.name?.[0] || "?"}
                            </div>
                            <div>
                              <p className="font-black text-base">{app.name}</p>
                              <p className="text-sm text-primary font-bold flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {app.jobTitle}
                              </p>
                            </div>
                          </div>
                          <Badge variant={st.variant as any} className="gap-1 shrink-0">
                            <StatusIcon className="h-3 w-3" />
                            {st.label}
                          </Badge>
                        </div>

                        {/* Contact info - prominently shown */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-muted/20 rounded-lg p-3 text-sm">
                          {app.phone && (
                            <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                              <span className="font-medium">{app.phone}</span>
                            </a>
                          )}
                          {app.email && (
                            <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors col-span-1 sm:col-span-1">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                              <span className="font-medium truncate">{app.email}</span>
                            </a>
                          )}
                          {app.createdAt && (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              {new Date(app.createdAt).toLocaleDateString("ar-SA")}
                            </span>
                          )}
                        </div>

                        {app.customAnswers?.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground">إجابات الأسئلة المخصصة:</p>
                            {app.customAnswers.map((ans: string, i: number) => (
                              <p key={i} className="text-xs bg-muted/30 rounded px-2 py-1">• {ans}</p>
                            ))}
                          </div>
                        )}

                        {app.message && (
                          <div className="bg-muted/20 rounded-lg p-3">
                            <p className="text-xs font-bold text-muted-foreground mb-1">رسالة المتقدم:</p>
                            <p className="text-xs text-muted-foreground">{app.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-muted/30 md:w-52 p-4 flex flex-col gap-2 justify-center border-r border-border/50">
                        {app.cvUrl && (
                          <Button variant="outline" size="sm" className="w-full gap-1" asChild>
                            <a href={app.cvUrl} target="_blank">
                              <FileText className="h-3.5 w-3.5" />
                              عرض السيرة الذاتية
                            </a>
                          </Button>
                        )}
                        {app.status !== "approved" && (
                          <Button
                            size="sm"
                            className="w-full gap-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => { setApproveDialog(app); setSelectedRole("employee"); }}
                            data-testid={`button-approve-${app.id}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            قبول وترخيص
                          </Button>
                        )}
                        {app.status === "approved" && (
                          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                            <Shield className="h-4 w-4 text-green-600 mx-auto mb-1" />
                            <p className="text-xs text-green-700 font-bold">مرخّص</p>
                            <p className="text-[10px] text-green-600">تم إرسال بريد الإعداد</p>
                          </div>
                        )}
                        {app.status !== "rejected" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full gap-1"
                            onClick={() => statusMutation.mutate({ id: app.id, status: "rejected" })}
                            disabled={statusMutation.isPending}
                            data-testid={`button-reject-${app.id}`}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            رفض الطلب
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full gap-1 text-muted-foreground text-xs"
                          onClick={() => {
                            if (confirm("هل تريد حذف هذا الطلب نهائياً؟")) {
                              deleteMutation.mutate(app.id);
                            }
                          }}
                        >
                          حذف الطلب
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              قبول وترخيص الموظف
            </DialogTitle>
            <DialogDescription>سيتم إنشاء حساب للموظف وإرسال رابط إعداد كلمة المرور</DialogDescription>
          </DialogHeader>
          {approveDialog && (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                    {approveDialog.name?.[0] || "؟"}
                  </div>
                  <div>
                    <p className="font-black">{approveDialog.name}</p>
                    <p className="text-sm text-primary font-bold">{approveDialog.jobTitle}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2 bg-white dark:bg-card rounded-lg p-2.5">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">{approveDialog.email}</span>
                  </div>
                  {approveDialog.phone && (
                    <div className="flex items-center gap-2 bg-white dark:bg-card rounded-lg p-2.5">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium">{approveDialog.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">الدور الوظيفي في النظام</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  سيحدد الدور صلاحيات الموظف ولوحة التحكم التي سيراها
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1.5">
                  <Send className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  سيتلقى الموظف بريداً إلكترونياً على <strong>{approveDialog.email}</strong> يحتوي على رابط إعداد كلمة المرور والمعرف الوظيفي
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                  onClick={handleApprove}
                  disabled={statusMutation.isPending}
                  data-testid="button-confirm-approve"
                >
                  {statusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  تأكيد القبول والإرسال
                </Button>
                <Button variant="outline" onClick={() => setApproveDialog(null)}>إلغاء</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
