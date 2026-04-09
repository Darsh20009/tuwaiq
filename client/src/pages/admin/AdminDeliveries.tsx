import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Truck, Plus, Search, MapPin, Phone, User, Package,
  Clock, CheckCircle, XCircle, RefreshCw, Eye
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending:    { label: "معلق",     color: "bg-amber-100 text-amber-700",   icon: Clock },
  assigned:   { label: "مُعيَّن",  color: "bg-blue-100 text-blue-700",     icon: Truck },
  in_transit: { label: "في الطريق",color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered:  { label: "تم التسليم",color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  failed:     { label: "فشل",      color: "bg-red-100 text-red-700",       icon: XCircle },
  returned:   { label: "مُعاد",   color: "bg-gray-100 text-gray-700",     icon: RefreshCw },
};

const STATUSES = Object.keys(STATUS_MAP);
const emptyForm = {
  beneficiaryName: "", beneficiaryPhone: "", beneficiaryAddress: "",
  items: "", notes: "", assignedTo: ""
};

export default function AdminDeliveries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/delivery-orders"],
    queryFn: async () => {
      const res = await fetch("/api/delivery-orders", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: agents = [] } = useQuery<any[]>({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const res = await fetch("/api/employees", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const deliveryAgents = agents.filter((a: any) => a.role === "delivery");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/delivery-orders", data);
      if (!res.ok) throw new Error("فشل");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-orders"] });
      toast({ title: "✓ تم إنشاء طلب التوصيل" });
      setShowDialog(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "خطأ", description: "فشل إنشاء الطلب", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/delivery-orders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-orders"] });
      toast({ title: "✓ تم تحديث الطلب" });
      setViewDialog(null);
    },
    onError: () => toast({ title: "خطأ", description: "فشل التحديث", variant: "destructive" }),
  });

  const handleCreate = () => {
    if (!form.beneficiaryName || !form.beneficiaryPhone) return toast({ title: "الاسم والجوال مطلوبان", variant: "destructive" });
    const data: any = { ...form };
    if (!data.assignedTo) delete data.assignedTo;
    createMutation.mutate(data);
  };

  const filtered = orders.filter((o: any) => {
    const matchSearch = !search || o.beneficiaryName?.includes(search) || o.beneficiaryPhone?.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: orders.filter((o: any) => o.status === s).length }), {} as any);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">إدارة التوصيل</h1>
            <p className="text-muted-foreground text-sm">تعيين البضائع لمناديب التوصيل وتتبع الحالة</p>
          </div>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gap-2" data-testid="button-add-delivery">
          <Plus className="w-4 h-4" /> طلب توصيل جديد
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUSES.map(s => {
          const info = STATUS_MAP[s];
          const Icon = info.icon;
          return (
            <Card
              key={s}
              className={`cursor-pointer transition-all hover:shadow ${statusFilter === s ? "ring-2 ring-primary" : ""}`}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              data-testid={`card-status-${s}`}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{info.label}</p>
                  <p className="font-black text-lg leading-none">{counts[s] || 0}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث باسم المستفيد أو جواله..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pr-9"
                data-testid="input-search-delivery"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44" data-testid="select-status-filter">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_MAP[s].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Card key={i} className="h-24 animate-pulse bg-muted" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-16 text-center space-y-3">
            <Truck className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <p className="text-lg font-bold text-muted-foreground">لا توجد طلبات توصيل</p>
            <Button onClick={() => setShowDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" /> طلب توصيل جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((o: any) => {
            const info = STATUS_MAP[o.status] || STATUS_MAP.pending;
            const Icon = info.icon;
            const agent = deliveryAgents.find((a: any) => a.id === o.assignedTo?.toString());
            return (
              <Card key={o.id} className="hover:shadow-sm transition-shadow" data-testid={`card-delivery-${o.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${info.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold" data-testid={`text-delivery-name-${o.id}`}>{o.beneficiaryName}</p>
                          <Badge className={`text-xs ${info.color}`}>{info.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{o.beneficiaryPhone}</span>
                          {o.beneficiaryAddress && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{o.beneficiaryAddress}</span>}
                          {agent && <span className="flex items-center gap-1"><User className="w-3 h-3" />مندوب: {agent.name}</span>}
                        </div>
                        {o.items && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Package className="w-3 h-3" />{o.items}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Select
                        value={o.assignedTo?.toString() || "unassigned"}
                        onValueChange={v => updateMutation.mutate({ id: o.id, data: { assignedTo: v === "unassigned" ? null : v } })}
                      >
                        <SelectTrigger className="w-36 text-xs h-8" data-testid={`select-agent-${o.id}`}>
                          <SelectValue placeholder="تعيين مندوب" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">غير مُعيَّن</SelectItem>
                          {deliveryAgents.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select
                        value={o.status}
                        onValueChange={v => updateMutation.mutate({ id: o.id, data: { status: v } })}
                      >
                        <SelectTrigger className="w-32 text-xs h-8" data-testid={`select-delivery-status-${o.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_MAP[s].label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewDialog(o)} data-testid={`button-view-delivery-${o.id}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={o => { if (!o) { setShowDialog(false); setForm(emptyForm); } }}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>طلب توصيل جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>اسم المستفيد *</Label>
                <Input value={form.beneficiaryName} onChange={e => setForm({ ...form, beneficiaryName: e.target.value })} placeholder="الاسم الكامل" data-testid="input-delivery-name" />
              </div>
              <div className="space-y-1">
                <Label>رقم الجوال *</Label>
                <Input value={form.beneficiaryPhone} onChange={e => setForm({ ...form, beneficiaryPhone: e.target.value })} placeholder="05xxxxxxxx" data-testid="input-delivery-phone" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>العنوان</Label>
                <Input value={form.beneficiaryAddress} onChange={e => setForm({ ...form, beneficiaryAddress: e.target.value })} placeholder="المدينة - الحي - الشارع" data-testid="input-delivery-address" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>البضائع المطلوبة</Label>
                <Textarea value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} placeholder="مثال: سلة غذائية x2 - ملابس x3" rows={2} data-testid="input-delivery-items" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>تعيين لمندوب</Label>
                <Select value={form.assignedTo || "unassigned"} onValueChange={v => setForm({ ...form, assignedTo: v === "unassigned" ? "" : v })}>
                  <SelectTrigger data-testid="select-assign-agent">
                    <SelectValue placeholder="اختر مندوباً" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">بدون تعيين</SelectItem>
                    {deliveryAgents.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {deliveryAgents.length === 0 && (
                  <p className="text-xs text-amber-600">لا يوجد مناديب توصيل. أضف موظفاً بدور "مندوب توصيل" أولاً.</p>
                )}
              </div>
              <div className="col-span-2 space-y-1">
                <Label>ملاحظات</Label>
                <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="أي ملاحظات إضافية..." rows={2} data-testid="input-delivery-notes" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="flex-1" data-testid="button-save-delivery">
                {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء طلب التوصيل"}
              </Button>
              <Button variant="outline" onClick={() => { setShowDialog(false); setForm(emptyForm); }}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewDialog} onOpenChange={o => { if (!o) setViewDialog(null); }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل طلب التوصيل</DialogTitle>
          </DialogHeader>
          {viewDialog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground text-xs">المستفيد</p><p className="font-bold">{viewDialog.beneficiaryName}</p></div>
                <div><p className="text-muted-foreground text-xs">الجوال</p><p className="font-bold">{viewDialog.beneficiaryPhone}</p></div>
                {viewDialog.beneficiaryAddress && <div className="col-span-2"><p className="text-muted-foreground text-xs">العنوان</p><p className="font-bold">{viewDialog.beneficiaryAddress}</p></div>}
                {viewDialog.items && <div className="col-span-2"><p className="text-muted-foreground text-xs">البضائع</p><p className="font-bold">{viewDialog.items}</p></div>}
                {viewDialog.notes && <div className="col-span-2"><p className="text-muted-foreground text-xs">الملاحظات</p><p>{viewDialog.notes}</p></div>}
                {viewDialog.deliveryNotes && <div className="col-span-2"><p className="text-muted-foreground text-xs">ملاحظات المندوب</p><p>{viewDialog.deliveryNotes}</p></div>}
                {viewDialog.deliveredAt && <div className="col-span-2"><p className="text-muted-foreground text-xs">وقت التسليم</p><p className="font-bold">{new Date(viewDialog.deliveredAt).toLocaleString("ar-SA")}</p></div>}
              </div>
              {viewDialog.deliveryImage && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">صورة التسليم</p>
                  <img src={viewDialog.deliveryImage} alt="صورة التسليم" className="w-full rounded-lg object-cover max-h-48" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
