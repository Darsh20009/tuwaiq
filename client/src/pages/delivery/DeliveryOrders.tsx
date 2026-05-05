import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Truck, MapPin, Phone, Package, CheckCircle, Clock, XCircle, RefreshCw, Search } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending:    { label: "معلق",      color: "bg-amber-100 text-amber-700",   icon: Clock },
  assigned:   { label: "مُعيَّن",   color: "bg-blue-100 text-blue-700",     icon: Truck },
  in_transit: { label: "في الطريق", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered:  { label: "تم التسليم",color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  failed:     { label: "فشل",       color: "bg-red-100 text-red-700",       icon: XCircle },
  returned:   { label: "مُعاد",    color: "bg-gray-100 text-gray-700",     icon: RefreshCw },
};

export default function DeliveryOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updateDialog, setUpdateDialog] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({ status: "", deliveryNotes: "", deliveryImage: "" });

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/delivery-orders"],
    queryFn: async () => {
      const res = await fetch("/api/delivery-orders", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/delivery-orders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-orders"] });
      toast({ title: "✓ تم تحديث حالة التوصيل" });
      setUpdateDialog(null);
    },
    onError: () => toast({ title: "خطأ في التحديث", variant: "destructive" }),
  });

  const openUpdate = (o: any) => {
    setUpdateDialog(o);
    setUpdateForm({ status: o.status, deliveryNotes: o.deliveryNotes || "", deliveryImage: o.deliveryImage || "" });
  };

  const filtered = orders.filter((o: any) => {
    const matchSearch = !search || o.beneficiaryName?.includes(search) || o.beneficiaryPhone?.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold">طلبات التوصيل</h1>
          <p className="text-muted-foreground text-sm">قائمة جميع الطلبات المُعيَّنة لي</p>
        </div>
      </div>

      <Card><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" data-testid="input-search" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem>{Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
      </div></CardContent></Card>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Card key={i} className="h-28 animate-pulse bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-16 text-center space-y-2"><Truck className="w-16 h-16 mx-auto text-muted-foreground/30" /><p className="font-bold text-muted-foreground">لا توجد طلبات</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((o: any) => {
            const info = STATUS_MAP[o.status] || STATUS_MAP.pending;
            const Icon = info.icon;
            return (
              <Card key={o.id} className="hover:shadow-sm transition-shadow" data-testid={`card-order-${o.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${info.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold" data-testid={`text-order-name-${o.id}`}>{o.beneficiaryName}</p>
                          <Badge className={`text-xs ${info.color}`}>{info.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{o.beneficiaryPhone}</span>
                          {o.beneficiaryAddress && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{o.beneficiaryAddress}</span>}
                        </div>
                        {o.items && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Package className="w-3 h-3" />{o.items}</p>}
                        {o.notes && <p className="text-xs italic text-muted-foreground mt-1">{o.notes}</p>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openUpdate(o)} className="shrink-0 text-xs gap-1" data-testid={`button-update-order-${o.id}`}>
                      تحديث الحالة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!updateDialog} onOpenChange={o => { if (!o) setUpdateDialog(null); }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>تحديث حالة التوصيل</DialogTitle></DialogHeader>
          {updateDialog && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p className="font-bold">{updateDialog.beneficiaryName}</p>
                {updateDialog.beneficiaryAddress && <p className="text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{updateDialog.beneficiaryAddress}</p>}
                {updateDialog.items && <p className="text-muted-foreground flex items-center gap-1 mt-1"><Package className="w-3 h-3" />{updateDialog.items}</p>}
              </div>
              <div className="space-y-1">
                <Label>الحالة الجديدة</Label>
                <Select value={updateForm.status} onValueChange={v => setUpdateForm({ ...updateForm, status: v })}>
                  <SelectTrigger data-testid="select-update-status"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>ملاحظات التوصيل</Label>
                <Textarea value={updateForm.deliveryNotes} onChange={e => setUpdateForm({ ...updateForm, deliveryNotes: e.target.value })} placeholder="مثال: تم الاستلام من قبل زوجة المستفيد..." rows={2} data-testid="input-delivery-notes" />
              </div>
              <div className="space-y-1">
                <Label>رابط صورة التسليم (اختياري)</Label>
                <Input value={updateForm.deliveryImage} onChange={e => setUpdateForm({ ...updateForm, deliveryImage: e.target.value })} placeholder="https://..." data-testid="input-delivery-image" />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => updateMutation.mutate({ id: updateDialog.id, data: updateForm })}
                  disabled={updateMutation.isPending}
                  className="flex-1"
                  data-testid="button-confirm-update"
                >
                  {updateMutation.isPending ? "جاري التحديث..." : "تأكيد التحديث"}
                </Button>
                <Button variant="outline" onClick={() => setUpdateDialog(null)}>إلغاء</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
