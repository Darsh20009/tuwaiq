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
import { Switch } from "@/components/ui/switch";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Package, Plus, Edit, Trash2, Search, Tag, DollarSign,
  BarChart3, ShoppingCart, Archive, CheckCircle
} from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

const CATEGORIES = ["عام", "مواد غذائية", "ملابس", "أدوية", "مياه", "معدات", "قرطاسية", "أخرى"];
const UNITS = ["قطعة", "كرتون", "كيلو", "لتر", "متر", "علبة", "حبة", "طرد"];

const empty = {
  name: "", description: "", category: "عام", price: "",
  unit: "قطعة", stock: "", image: "", isActive: true,
};

export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);

  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/products", data);
      if (!res.ok) throw new Error("فشل");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "✓ تمت إضافة البضاعة" });
      setShowDialog(false);
      setForm(empty);
    },
    onError: () => toast({ title: "خطأ", description: "فشل إضافة البضاعة", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/products/${id}`, data);
      if (!res.ok) throw new Error("فشل");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "✓ تم تحديث البضاعة" });
      setShowDialog(false);
      setEditing(null);
      setForm(empty);
    },
    onError: () => toast({ title: "خطأ", description: "فشل التحديث", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "✓ تم حذف البضاعة" });
    },
    onError: () => toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm(empty); setShowDialog(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", category: p.category || "عام", price: p.price, unit: p.unit || "قطعة", stock: p.stock, image: p.image || "", isActive: p.isActive !== false });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name || form.price === "") return toast({ title: "الاسم والسعر مطلوبان", variant: "destructive" });
    const data = { ...form, price: Number(form.price), stock: Number(form.stock) || 0 };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name?.includes(search) || p.description?.includes(search);
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalValue = products.reduce((s: number, p: any) => s + (p.price * p.stock), 0);
  const totalItems = products.reduce((s: number, p: any) => s + p.stock, 0);
  const lowStock = products.filter((p: any) => p.stock <= 5 && p.isActive !== false).length;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">إدارة البضائع والأسعار</h1>
            <p className="text-muted-foreground text-sm">كاتالوج المنتجات والمخزون</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2" data-testid="button-add-product">
          <Plus className="w-4 h-4" /> إضافة بضاعة
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-100">
          <div className="h-1 bg-emerald-500" />
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المنتجات</p>
              <p className="text-2xl font-black text-emerald-700">{products.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-100">
          <div className="h-1 bg-blue-500" />
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المخزون</p>
              <p className="text-2xl font-black text-blue-700">{totalItems.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <div className="h-1 bg-purple-500" />
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">قيمة المخزون</p>
              <p className="text-xl font-black text-purple-700">{totalValue.toLocaleString()} ر.س</p>
            </div>
          </CardContent>
        </Card>
        <Card className={lowStock > 0 ? "border-red-100" : "border-gray-100"}>
          <div className={`h-1 ${lowStock > 0 ? "bg-red-500" : "bg-gray-300"}`} />
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lowStock > 0 ? "bg-red-50" : "bg-gray-50"}`}>
              <Archive className={`w-5 h-5 ${lowStock > 0 ? "text-red-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">مخزون منخفض</p>
              <p className={`text-2xl font-black ${lowStock > 0 ? "text-red-700" : "text-gray-400"}`}>{lowStock}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في البضائع..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pr-9"
                data-testid="input-search-product"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44" data-testid="select-category-filter">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Card key={i} className="h-40 animate-pulse bg-muted" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-16 text-center space-y-3">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <p className="text-lg font-bold text-muted-foreground">لا توجد بضائع</p>
            <p className="text-sm text-muted-foreground">ابدأ بإضافة أول بضاعة للكاتالوج</p>
            <Button onClick={openAdd} className="mt-2 gap-2">
              <Plus className="w-4 h-4" /> إضافة بضاعة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p: any) => (
            <Card
              key={p.id}
              className={`hover:shadow-md transition-shadow ${p.isActive === false ? "opacity-60" : ""}`}
              data-testid={`card-product-${p.id}`}
            >
              {p.image && (
                <div className="h-32 overflow-hidden rounded-t-xl">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate" data-testid={`text-product-name-${p.id}`}>{p.name}</h3>
                    {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.description}</p>}
                  </div>
                  {p.isActive === false && <Badge variant="secondary" className="shrink-0 text-xs">غير نشط</Badge>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs gap-1">
                    <Tag className="w-3 h-3" />{p.category}
                  </Badge>
                  <Badge className={`text-xs ${p.stock <= 5 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    مخزون: {p.stock} {p.unit}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="font-black text-lg text-primary" data-testid={`text-product-price-${p.id}`}>
                    {Number(p.price).toLocaleString()} ر.س
                    <span className="text-xs font-normal text-muted-foreground"> / {p.unit}</span>
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)} data-testid={`button-edit-product-${p.id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => { if (confirm("حذف هذه البضاعة؟")) deleteMutation.mutate(p.id); }}
                      data-testid={`button-delete-product-${p.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={o => { if (!o) { setShowDialog(false); setEditing(null); setForm(empty); } }}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل البضاعة" : "إضافة بضاعة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>اسم البضاعة *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: سلة غذائية رمضان" data-testid="input-product-name" />
              </div>
              <div className="space-y-1">
                <Label>السعر (ر.س) *</Label>
                <Input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" data-testid="input-product-price" />
              </div>
              <div className="space-y-1">
                <Label>الوحدة</Label>
                <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                  <SelectTrigger data-testid="select-product-unit"><SelectValue /></SelectTrigger>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>الفئة</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="select-product-category"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>الكمية في المخزون</Label>
                <Input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" data-testid="input-product-stock" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>الوصف</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="وصف البضاعة..." rows={2} data-testid="input-product-description" />
              </div>
              <div className="col-span-2">
                <ImageUpload
                  value={form.image}
                  onChange={url => setForm({ ...form, image: url })}
                  label="صورة البضاعة"
                  testId="product-image"
                />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} id="isActive" data-testid="switch-product-active" />
                <Label htmlFor="isActive">نشط في الكاتالوج</Label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="flex-1" data-testid="button-save-product">
                {(createMutation.isPending || updateMutation.isPending) ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة البضاعة"}
              </Button>
              <Button variant="outline" onClick={() => { setShowDialog(false); setEditing(null); setForm(empty); }}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
