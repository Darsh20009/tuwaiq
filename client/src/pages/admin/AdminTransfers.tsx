import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Loader2, CreditCard, CheckCircle2, XCircle, Clock,
  ExternalLink, AlertCircle, Download, Trash2, Eye, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminTransfers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState("");

  const [authError, setAuthError] = useState<string | null>(null);

  const { data: transfers, isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/bank-transfers"],
    queryFn: async () => {
      const res = await fetch("/api/bank-transfers", { credentials: "include" });
      if (res.status === 401) { setAuthError("يرجى تسجيل الدخول للوصول لهذه الصفحة"); return []; }
      if (res.status === 403) { setAuthError("ليس لديك صلاحية الوصول لهذه الصفحة"); return []; }
      if (!res.ok) { setAuthError("خطأ في تحميل البيانات"); return []; }
      setAuthError(null);
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      await apiRequest("PATCH", `/api/bank-transfers/${id}`, { status, notes });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/donations"] });
      toast({ title: status === "approved" ? "✓ تم تأكيد التحويل وإرسال الشهادة" : "✓ تم رفض التحويل" });
      setSelected(null);
    },
    onError: (err: any) => toast({ title: "خطأ", description: err?.message || "حدث خطأ أثناء العملية", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bank-transfers/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-transfers"] });
      toast({ title: "✓ تم حذف التحويل" });
      setSelected(null);
    },
    onError: () => toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" }),
  });

  const handleExport = () => window.open("/api/bank-transfers/export", "_blank");

  const list = transfers || [];
  const pending = list.filter(t => t.status === "pending");
  const approved = list.filter(t => t.status === "approved");
  const rejected = list.filter(t => t.status === "rejected");

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto" dir="rtl">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <CreditCard className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-black">التحويلات البنكية</h1>
            <p className="text-xs text-muted-foreground">{pending.length} معلق — {approved.length} مؤكد — {rejected.length} مرفوض</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            تحديث
          </Button>
          <Button size="sm" onClick={handleExport} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" data-testid="button-export-transfers">
            <Download className="h-3.5 w-3.5" />
            تصدير CSV
          </Button>
        </div>
      </div>

      {authError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive opacity-70" />
            <p className="font-bold text-destructive">{authError}</p>
            {authError.includes("تسجيل") && (
              <a href="/login" className="text-sm text-primary underline mt-2 block">تسجيل الدخول</a>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && !authError && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-black text-base">بانتظار المراجعة</h2>
              <Badge variant="secondary" className="text-xs">{pending.length}</Badge>
            </div>
            {pending.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-10 text-center text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-500 opacity-50" />
                  <p className="font-bold">لا توجد تحويلات معلقة</p>
                  <p className="text-sm mt-1">جميع التحويلات تمت مراجعتها</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pending.map((t: any) => (
                  <Card key={t.id} className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/20 overflow-hidden" data-testid={`card-transfer-${t.id}`}>
                    <div className="h-1 bg-amber-400" />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                            <CreditCard className="h-6 w-6 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-lg">{t.donorName || "متبرع فاعل خير"}</p>
                            <p className="text-2xl font-black text-primary mt-0.5">{Number(t.amount).toLocaleString()} ر.س</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                              {t.donorPhone && <span>📱 {t.donorPhone}</span>}
                              {t.donorEmail && <span>✉️ {t.donorEmail}</span>}
                              {t.bankName && <span>🏦 {t.bankName}</span>}
                              {t.transferDate && <span>📅 تاريخ التحويل: {t.transferDate}</span>}
                              {t.createdAt && <span>🕐 طُلب: {new Date(t.createdAt).toLocaleDateString("ar-SA")}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 w-48 shrink-0">
                          {(t.receiptImage || t.receiptUrl || t.bankTransferPhoto) ? (
                            <>
                              <a href={t.receiptImage || t.receiptUrl || t.bankTransferPhoto} target="_blank" rel="noreferrer">
                                <img
                                  src={t.receiptImage || t.receiptUrl || t.bankTransferPhoto}
                                  alt="الإيصال"
                                  className="w-full max-h-28 object-contain rounded-lg border shadow-sm hover:opacity-90 transition-opacity"
                                />
                              </a>
                              <Button variant="outline" size="sm" asChild className="gap-1 w-full h-8">
                                <a href={t.receiptImage || t.receiptUrl || t.bankTransferPhoto} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  عرض الإيصال
                                </a>
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                              <AlertCircle className="h-3 w-3" />
                              لا يوجد إيصال
                            </div>
                          )}
                          <Button
                            size="sm"
                            className="w-full gap-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => updateMutation.mutate({ id: t.id, status: "approved" })}
                            disabled={updateMutation.isPending}
                            data-testid={`button-approve-${t.id}`}
                          >
                            {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            تأكيد وإرسال شهادة
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1"
                            onClick={() => { setSelected(t); setRejectNote(""); }}
                            data-testid={`button-details-${t.id}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            خيارات أخرى
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {(approved.length > 0 || rejected.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-black text-base text-muted-foreground">السابقة</h2>
                <Badge variant="outline" className="text-xs">{approved.length + rejected.length}</Badge>
              </div>
              <div className="space-y-2">
                {[...approved, ...rejected].map((t: any) => (
                  <Card key={t.id} className="opacity-80" data-testid={`card-done-${t.id}`}>
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">{t.donorName || "متبرع"}</p>
                        <span className="text-primary font-black text-sm shrink-0">{Number(t.amount).toLocaleString()} ر.س</span>
                        {t.bankName && <span className="text-xs text-muted-foreground hidden md:block shrink-0">🏦 {t.bankName}</span>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={t.status === "approved" ? "default" : "destructive"} className="text-xs gap-1">
                          {t.status === "approved" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {t.status === "approved" ? "مؤكد" : "مرفوض"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => { if (confirm("حذف هذا التحويل نهائياً؟")) deleteMutation.mutate(t.id); }}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-transfer-${t.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>خيارات التحويل</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg text-sm space-y-1">
                <p className="font-bold">{selected.donorName || "فاعل خير"}</p>
                <p className="text-primary font-black text-lg">{Number(selected.amount).toLocaleString()} ر.س</p>
                {selected.bankName && <p className="text-xs text-muted-foreground">🏦 {selected.bankName}</p>}
                {selected.transferDate && <p className="text-xs text-muted-foreground">📅 {selected.transferDate}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold">ملاحظة الرفض (اختياري)</Label>
                <Textarea
                  placeholder="سبب الرفض للمتبرع..."
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  rows={2}
                  className="text-sm"
                  data-testid="textarea-reject-note"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => updateMutation.mutate({ id: selected.id, status: "approved" })}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  تأكيد
                </Button>
                <Button
                  variant="destructive"
                  className="gap-1"
                  onClick={() => updateMutation.mutate({ id: selected.id, status: "rejected", notes: rejectNote })}
                  disabled={updateMutation.isPending}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  رفض
                </Button>
              </div>

              <div className="pt-2 border-t flex justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => { if (confirm("حذف نهائي؟")) deleteMutation.mutate(selected.id); }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
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
