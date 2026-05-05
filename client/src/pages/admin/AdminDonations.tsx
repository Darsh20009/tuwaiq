import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DollarSign, Search, Loader2, CheckCircle2, Clock, XCircle,
  TrendingUp, Download, Trash2, Eye, RefreshCw, SlidersHorizontal,
  Phone, Mail, Calendar, FileText, Filter, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SidebarTrigger } from "@/components/ui/sidebar";

const STATUS_LABELS: any = { success: "مؤكد", confirmed: "مؤكد", pending: "معلق", rejected: "مرفوض", failed: "فاشل" };
const STATUS_COLORS: any = { success: "default", confirmed: "default", pending: "secondary", rejected: "destructive", failed: "destructive" };
const TYPE_LABELS: any = { general: "صدقة عامة", zakat: "زكاة", waqf: "وقف", kafara: "كفارة", water: "سقيا الماء", food: "إطعام", ramadan: "سلة رمضانية" };
const METHOD_LABELS: any = { online: "دفع إلكتروني", bank_transfer: "تحويل بنكي", cash: "نقدي" };

export default function AdminDonations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const buildQuery = () => {
    const p = new URLSearchParams();
    if (statusFilter !== "all") p.set("status", statusFilter);
    if (typeFilter !== "all") p.set("type", typeFilter);
    if (fromDate) p.set("from", fromDate);
    if (toDate) p.set("to", toDate);
    if (search) p.set("search", search);
    return p.toString();
  };

  const { data: donations, isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/admin/donations", statusFilter, typeFilter, fromDate, toDate, search],
    queryFn: async () => {
      const res = await fetch(`/api/admin/donations?${buildQuery()}`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNote: note }: { id: string; status: string; adminNote?: string }) => {
      await apiRequest("PATCH", `/api/admin/donations/${id}`, { status, adminNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/donations"] });
      toast({ title: "✓ تم تحديث حالة التبرع" });
      setSelected(null);
    },
    onError: () => toast({ title: "خطأ", description: "فشل التحديث", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/donations/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/donations"] });
      toast({ title: "✓ تم حذف التبرع" });
      setSelected(null);
    },
    onError: () => toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" }),
  });

  const handleExport = () => window.open("/api/admin/donations/export", "_blank");

  const recoverMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/donations/rajhi-recover");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/donations"] });
      toast({
        title: "✓ تم الاستعلام عن الراجحي",
        description: data?.message || `تأكيد: ${data?.confirmed ?? 0}، فشل: ${data?.failed ?? 0}، غير محدد: ${data?.unclear ?? 0}`,
      });
    },
    onError: () => toast({ title: "خطأ", description: "فشل الاستعلام من بوابة الراجحي", variant: "destructive" }),
  });

  const list = donations || [];
  const totalConfirmed = list.filter(d => d.status === "success" || d.status === "confirmed").reduce((s, d) => s + Number(d.amount), 0);
  const pendingCount = list.filter(d => d.status === "pending").length;
  const totalAll = list.reduce((s, d) => s + Number(d.amount), 0);

  const statusIcon = (s: string) => {
    if (s === "success" || s === "confirmed") return <CheckCircle2 className="h-3.5 w-3.5" />;
    if (s === "pending") return <Clock className="h-3.5 w-3.5" />;
    return <XCircle className="h-3.5 w-3.5" />;
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto" dir="rtl">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-black">إدارة التبرعات</h1>
            <p className="text-xs text-muted-foreground">{list.length} تبرع — تحكم كامل في الحالات والبيانات</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            فلاتر
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => recoverMutation.mutate()}
            disabled={recoverMutation.isPending}
            className="gap-1.5 border-amber-400 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
            title="استعلام عن التبرعات المعلقة من بوابة الراجحي وتحديثها"
            data-testid="button-rajhi-recover"
          >
            {recoverMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            استرداد الراجحي
          </Button>
          <Button size="sm" onClick={handleExport} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" data-testid="button-export-csv">
            <Download className="h-3.5 w-3.5" />
            تصدير CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي المؤكدة", value: `${totalConfirmed.toLocaleString()} ر.س`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950", bar: "bg-emerald-500" },
          { label: "تبرعات معلقة", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950", bar: "bg-amber-500" },
          { label: "إجمالي السجلات", value: list.length, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950", bar: "bg-blue-500" },
          { label: "إجمالي الطلبات", value: `${totalAll.toLocaleString()} ر.س`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950", bar: "bg-purple-500" },
        ].map(({ label, value, icon: Icon, color, bg, bar }) => (
          <Card key={label} className="overflow-hidden">
            <div className={`h-1 ${bar}`} />
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className={`text-lg font-black ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showFilters && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2"><Filter className="h-4 w-4" /> الفلاتر</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="col-span-2 md:col-span-1">
              <Label className="text-xs mb-1 block">بحث</Label>
              <div className="relative">
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input className="pr-8 h-9 text-sm" placeholder="اسم، جوال، إيميل..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search" />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-sm" data-testid="select-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="success">مؤكد</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="failed">فاشل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">نوع التبرع</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="general">صدقة عامة</SelectItem>
                  <SelectItem value="zakat">زكاة</SelectItem>
                  <SelectItem value="waqf">وقف</SelectItem>
                  <SelectItem value="kafara">كفارة</SelectItem>
                  <SelectItem value="water">سقيا الماء</SelectItem>
                  <SelectItem value="food">إطعام</SelectItem>
                  <SelectItem value="ramadan">سلة رمضانية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">من تاريخ</Label>
              <Input type="date" className="h-9 text-sm" value={fromDate} onChange={e => setFromDate(e.target.value)} data-testid="input-from-date" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">إلى تاريخ</Label>
              <Input type="date" className="h-9 text-sm" value={toDate} onChange={e => setToDate(e.target.value)} data-testid="input-to-date" />
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); setFromDate(""); setToDate(""); }}>
                مسح الكل
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : list.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-16 text-center text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold">لا توجد تبرعات</p>
            <p className="text-sm mt-1">جرب تغيير الفلاتر</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="p-3 text-right font-bold text-xs text-muted-foreground">المتبرع</th>
                  <th className="p-3 text-right font-bold text-xs text-muted-foreground">المبلغ</th>
                  <th className="p-3 text-right font-bold text-xs text-muted-foreground">النوع</th>
                  <th className="p-3 text-right font-bold text-xs text-muted-foreground">طريقة الدفع</th>
                  <th className="p-3 text-right font-bold text-xs text-muted-foreground">التاريخ</th>
                  <th className="p-3 text-right font-bold text-xs text-muted-foreground">الحالة</th>
                  <th className="p-3 text-center font-bold text-xs text-muted-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((d: any) => (
                  <tr key={d.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-donation-${d.id}`}>
                    <td className="p-3">
                      <p className="font-bold text-sm">{d.donorName || "فاعل خير"}</p>
                      {d.mobile && <p className="text-xs text-muted-foreground">{d.mobile}</p>}
                    </td>
                    <td className="p-3">
                      <span className="font-black text-primary text-base">{Number(d.amount).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground mr-1">ر.س</span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">{TYPE_LABELS[d.type] || d.type || "—"}</Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {METHOD_LABELS[d.paymentMethod] || d.paymentMethod || "—"}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString("ar-SA") : "—"}
                    </td>
                    <td className="p-3">
                      <Badge variant={STATUS_COLORS[d.status] || "outline"} className="text-xs gap-1">
                        {statusIcon(d.status)}
                        {STATUS_LABELS[d.status] || d.status || "—"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        {(d.status === "pending" || d.status === "failed") && (
                          <>
                            <Button
                              size="sm"
                              className="h-7 text-xs px-2 bg-emerald-600 hover:bg-emerald-700 gap-1"
                              onClick={() => updateMutation.mutate({ id: d.id, status: "success" })}
                              disabled={updateMutation.isPending}
                              title={d.status === "failed" ? "تأكيد يدوي — استخدم هذا إذا تم خصم المبلغ فعلاً" : "تأكيد التبرع"}
                              data-testid={`button-confirm-${d.id}`}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              تأكيد
                            </Button>
                            {d.status === "pending" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs px-2 gap-1"
                                onClick={() => updateMutation.mutate({ id: d.id, status: "rejected" })}
                                disabled={updateMutation.isPending}
                                data-testid={`button-reject-${d.id}`}
                              >
                                <XCircle className="h-3 w-3" />
                                رفض
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => { setSelected(d); setAdminNote(d.adminNote || ""); }}
                          data-testid={`button-view-${d.id}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => { if (confirm("هل أنت متأكد من حذف هذا التبرع؟")) deleteMutation.mutate(d.id); }}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${d.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              تفاصيل التبرع
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold">المتبرع</p>
                  <p className="font-bold">{selected.donorName || "فاعل خير"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold">المبلغ</p>
                  <p className="font-black text-primary text-lg">{Number(selected.amount).toLocaleString()} ر.س</p>
                </div>
                {selected.mobile && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-bold flex items-center gap-1"><Phone className="h-3 w-3" />الجوال</p>
                    <p>{selected.mobile}</p>
                  </div>
                )}
                {selected.email && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-bold flex items-center gap-1"><Mail className="h-3 w-3" />البريد</p>
                    <p className="text-xs break-all">{selected.email}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold">نوع التبرع</p>
                  <Badge variant="outline">{TYPE_LABELS[selected.type] || selected.type}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold">طريقة الدفع</p>
                  <p>{METHOD_LABELS[selected.paymentMethod] || selected.paymentMethod || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold">الحالة الحالية</p>
                  <Badge variant={STATUS_COLORS[selected.status] || "outline"} className="gap-1">
                    {statusIcon(selected.status)}
                    {STATUS_LABELS[selected.status] || selected.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold flex items-center gap-1"><Calendar className="h-3 w-3" />التاريخ</p>
                  <p className="text-xs">{selected.createdAt ? new Date(selected.createdAt).toLocaleString("ar-SA") : "—"}</p>
                </div>
              </div>

              {selected.notes && (
                <div className="p-3 bg-muted/40 rounded-lg text-sm">
                  <p className="text-xs text-muted-foreground font-bold mb-1">ملاحظة المتبرع</p>
                  <p>{selected.notes}</p>
                </div>
              )}

              {selected.adminNote && !adminNote && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-sm border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-muted-foreground font-bold mb-1">الملاحظة الإدارية الحالية</p>
                  <p>{selected.adminNote}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold">ملاحظة إدارية</Label>
                <Textarea
                  placeholder="أضف ملاحظة داخلية على هذا التبرع..."
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={2}
                  className="text-sm"
                  data-testid="textarea-admin-note"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold">تغيير الحالة</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { status: "success", label: "تأكيد", variant: "default" as const, icon: CheckCircle2 },
                    { status: "pending", label: "معلق", variant: "secondary" as const, icon: Clock },
                    { status: "rejected", label: "رفض", variant: "destructive" as const, icon: XCircle },
                  ].map(({ status, label, variant, icon: Icon }) => (
                    <Button
                      key={status}
                      variant={variant}
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => updateMutation.mutate({ id: selected.id, status, adminNote })}
                      disabled={updateMutation.isPending}
                      data-testid={`button-set-status-${status}`}
                    >
                      {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => { if (confirm("هل أنت متأكد من حذف هذا التبرع نهائياً؟")) deleteMutation.mutate(selected.id); }}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  حذف نهائي
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelected(null)}>إغلاق</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
