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
import { Heart, Plus, Search, Phone, MapPin, Users, Edit, Trash2, UserCheck, UserX, History, Package, Trash } from "lucide-react";
import { format } from "date-fns";

const emptyForm = { name: "", phone: "", address: "", nationalId: "", familySize: "1", notes: "", status: "active" };
const aidTypes = ["سلة غذائية", "ملابس", "أدوية", "مصاريف دراسية", "أثاث منزلي", "مستلزمات أطفال", "دعم مالي", "أخرى"];

function AidHistoryDialog({ beneficiary, open, onClose }: { beneficiary: any; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: "", quantity: "1", description: "", date: new Date().toISOString().split("T")[0] });

  const { data: records = [] } = useQuery<any[]>({
    queryKey: ["/api/aid-records", beneficiary?._id],
    queryFn: async () => {
      if (!beneficiary?._id) return [];
      const res = await fetch(`/api/aid-records?beneficiaryId=${beneficiary._id}`, { credentials: "include" });
      return res.ok ? res.json() : [];
    },
    enabled: !!beneficiary && open,
  });

  const addRecord = useMutation({
    mutationFn: () => apiRequest("POST", "/api/aid-records", {
      ...form,
      beneficiaryId: beneficiary._id,
      beneficiaryName: beneficiary.name,
      quantity: Number(form.quantity),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/aid-records", beneficiary._id] });
      toast({ title: "تم تسجيل المساعدة" });
      setShowAdd(false);
      setForm({ type: "", quantity: "1", description: "", date: new Date().toISOString().split("T")[0] });
    },
    onError: (e: any) => toast({ title: e.message || "خطأ", variant: "destructive" }),
  });

  const deleteRecord = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/aid-records/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/aid-records", beneficiary._id] });
      toast({ title: "تم الحذف" });
    },
  });

  if (!beneficiary) return null;

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent dir="rtl" className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            سجل مساعدات: {beneficiary.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{records.length} مساعدة مسجّلة</p>
            <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1.5" data-testid="button-add-aid">
              <Plus className="h-3.5 w-3.5" />
              إضافة مساعدة
            </Button>
          </div>

          {showAdd && (
            <div className="p-4 bg-muted/30 rounded-xl space-y-3 border">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">نوع المساعدة</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="h-8 text-sm" data-testid="select-aid-type">
                      <SelectValue placeholder="اختر..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aidTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">الكمية</Label>
                  <Input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="h-8 text-sm" data-testid="input-aid-quantity" />
                </div>
                <div>
                  <Label className="text-xs">التاريخ</Label>
                  <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-8 text-sm" data-testid="input-aid-date" />
                </div>
                <div>
                  <Label className="text-xs">وصف (اختياري)</Label>
                  <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-8 text-sm" placeholder="تفاصيل..." data-testid="input-aid-description" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>إلغاء</Button>
                <Button size="sm" onClick={() => addRecord.mutate()} disabled={addRecord.isPending || !form.type} data-testid="button-save-aid">
                  {addRecord.isPending ? "جاري..." : "حفظ"}
                </Button>
              </div>
            </div>
          )}

          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد مساعدات مسجّلة لهذا المستفيد</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {records.map((r: any) => (
                <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-card border hover:shadow-sm" data-testid={`aid-record-${r._id}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{r.type}</Badge>
                      <span className="text-sm font-medium">× {r.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{r.date}</span>
                      {r.description && <span>• {r.description}</span>}
                      <span>• بواسطة: {r.addedBy}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteRecord.mutate(r._id)}
                    data-testid={`button-delete-aid-${r._id}`}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminBeneficiaries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [aidBeneficiary, setAidBeneficiary] = useState<any>(null);

  const { data: beneficiaries = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/beneficiaries"],
    queryFn: async () => {
      const res = await fetch("/api/beneficiaries", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/beneficiaries", data);
      if (!res.ok) throw new Error("فشل");
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/beneficiaries"] }); toast({ title: "✓ تم إضافة المستفيد" }); setShowDialog(false); setForm(emptyForm); },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { await apiRequest("PATCH", `/api/beneficiaries/${id}`, data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/beneficiaries"] }); toast({ title: "✓ تم التحديث" }); setShowDialog(false); setEditing(null); setForm(emptyForm); },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/beneficiaries/${id}`, {}); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/beneficiaries"] }); toast({ title: "✓ تم الحذف" }); },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowDialog(true); };
  const openEdit = (b: any) => {
    setEditing(b);
    setForm({ name: b.name, phone: b.phone, address: b.address || "", nationalId: b.nationalId || "", familySize: String(b.familySize || 1), notes: b.notes || "", status: b.status || "active" });
    setShowDialog(true);
  };
  const handleSave = () => {
    if (!form.name || !form.phone) return toast({ title: "الاسم والجوال مطلوبان", variant: "destructive" });
    const data = { ...form, familySize: Number(form.familySize) };
    if (editing) updateMutation.mutate({ id: editing._id || editing.id, data });
    else createMutation.mutate(data);
  };

  const filtered = beneficiaries.filter((b: any) => {
    const matchSearch = !search || b.name?.includes(search) || b.phone?.includes(search) || b.nationalId?.includes(search);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const active = beneficiaries.filter((b: any) => b.status !== "inactive").length;
  const totalMembers = beneficiaries.reduce((s: number, b: any) => s + (b.familySize || 1), 0);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">إدارة المستفيدين</h1>
            <p className="text-muted-foreground text-sm">قاعدة بيانات الأسر والأفراد المستفيدين</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2" data-testid="button-add-beneficiary">
          <Plus className="w-4 h-4" /> إضافة مستفيد
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-100"><div className="h-1 bg-emerald-500" /><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Heart className="w-5 h-5 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">إجمالي المستفيدين</p><p className="text-2xl font-black text-emerald-700">{beneficiaries.length}</p></div></CardContent></Card>
        <Card className="border-blue-100"><div className="h-1 bg-blue-500" /><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><UserCheck className="w-5 h-5 text-blue-600" /></div><div><p className="text-xs text-muted-foreground">نشطون</p><p className="text-2xl font-black text-blue-700">{active}</p></div></CardContent></Card>
        <Card className="border-purple-100"><div className="h-1 bg-purple-500" /><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Users className="w-5 h-5 text-purple-600" /></div><div><p className="text-xs text-muted-foreground">إجمالي أفراد الأسر</p><p className="text-2xl font-black text-purple-700">{totalMembers}</p></div></CardContent></Card>
      </div>

      <Card><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="بحث بالاسم أو الجوال أو رقم الهوية..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" data-testid="input-search-beneficiary" /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="active">نشط</SelectItem><SelectItem value="inactive">غير نشط</SelectItem></SelectContent></Select></div></CardContent></Card>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Card key={i} className="h-20 animate-pulse bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-16 text-center space-y-3"><Heart className="w-16 h-16 mx-auto text-muted-foreground/30" /><p className="text-lg font-bold text-muted-foreground">لا يوجد مستفيدون</p><Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> إضافة مستفيد</Button></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((b: any) => (
            <Card key={b._id || b.id} className="hover:shadow-sm transition-shadow" data-testid={`card-beneficiary-${b._id || b.id}`}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${b.status === "inactive" ? "bg-gray-100" : "bg-emerald-100"}`}>
                    {b.status === "inactive" ? <UserX className="w-5 h-5 text-gray-500" /> : <UserCheck className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold" data-testid={`text-beneficiary-name-${b._id || b.id}`}>{b.name}</p>
                      <Badge variant={b.status === "inactive" ? "secondary" : "outline"} className="text-xs">{b.status === "inactive" ? "غير نشط" : "نشط"}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{b.phone}</span>
                      {b.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.address}</span>}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />أفراد الأسرة: {b.familySize || 1}</span>
                      {b.nationalId && <span className="text-muted-foreground/60">هوية: {b.nationalId}</span>}
                    </div>
                    {b.notes && <p className="text-xs text-muted-foreground mt-1 italic">{b.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => setAidBeneficiary(b)}
                    data-testid={`button-aid-history-${b._id || b.id}`}
                  >
                    <History className="w-3.5 h-3.5" />
                    السجل
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)} data-testid={`button-edit-beneficiary-${b._id || b.id}`}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { if (confirm("حذف هذا المستفيد؟")) deleteMutation.mutate(b._id || b.id); }} data-testid={`button-delete-beneficiary-${b._id || b.id}`}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={o => { if (!o) { setShowDialog(false); setEditing(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editing ? "تعديل بيانات المستفيد" : "إضافة مستفيد جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>الاسم الكامل *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل" data-testid="input-beneficiary-name" /></div>
              <div className="space-y-1"><Label>رقم الجوال *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="05xxxxxxxx" data-testid="input-beneficiary-phone" /></div>
              <div className="space-y-1"><Label>رقم الهوية</Label><Input value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} placeholder="1xxxxxxxxx" data-testid="input-beneficiary-id" /></div>
              <div className="space-y-1"><Label>عدد أفراد الأسرة</Label><Input type="number" min="1" value={form.familySize} onChange={e => setForm({ ...form, familySize: e.target.value })} data-testid="input-beneficiary-family" /></div>
              <div className="col-span-2 space-y-1"><Label>العنوان</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="المدينة - الحي" data-testid="input-beneficiary-address" /></div>
              <div className="col-span-2 space-y-1"><Label>ملاحظات</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="أي معلومات إضافية..." rows={2} data-testid="input-beneficiary-notes" /></div>
              <div className="col-span-2 space-y-1"><Label>الحالة</Label><Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger data-testid="select-beneficiary-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">نشط</SelectItem><SelectItem value="inactive">غير نشط</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="flex-1" data-testid="button-save-beneficiary">
                {(createMutation.isPending || updateMutation.isPending) ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة المستفيد"}
              </Button>
              <Button variant="outline" onClick={() => { setShowDialog(false); setEditing(null); setForm(emptyForm); }}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AidHistoryDialog
        beneficiary={aidBeneficiary}
        open={!!aidBeneficiary}
        onClose={() => setAidBeneficiary(null)}
      />
    </div>
  );
}
