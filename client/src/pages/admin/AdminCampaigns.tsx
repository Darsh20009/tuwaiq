import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Megaphone, Plus, Edit, Trash2, Eye, EyeOff, GripVertical, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ImageUpload } from "@/components/ImageUpload";

const COLOR_OPTIONS = [
  { label: "أزرق مائي (سقيا الماء)", value: "from-cyan-500 to-teal-600" },
  { label: "أخضر (رمضاني)", value: "from-emerald-500 to-green-700" },
  { label: "برتقالي (إفطار)", value: "from-amber-500 to-orange-600" },
  { label: "أخضر زيتي (أساسي)", value: "from-primary to-teal-600" },
  { label: "بنفسجي", value: "from-purple-500 to-violet-600" },
  { label: "وردي", value: "from-pink-500 to-rose-600" },
  { label: "أزرق داكن", value: "from-blue-600 to-indigo-700" },
  { label: "رمادي", value: "from-gray-500 to-slate-600" },
];

const BADGE_COLOR_OPTIONS = [
  { label: "أزرق فاتح", value: "bg-cyan-100 text-cyan-800" },
  { label: "أخضر فاتح", value: "bg-emerald-100 text-emerald-800" },
  { label: "برتقالي فاتح", value: "bg-amber-100 text-amber-800" },
  { label: "أخضر المنصة", value: "bg-primary/10 text-primary" },
  { label: "بنفسجي فاتح", value: "bg-purple-100 text-purple-800" },
  { label: "وردي فاتح", value: "bg-pink-100 text-pink-800" },
  { label: "أزرق فاتح 2", value: "bg-blue-100 text-blue-800" },
];

const EMPTY_TIER = { label: "", amount: "" };
const EMPTY_FORM = {
  title: "",
  subtitle: "",
  image: "",
  color: "from-primary to-teal-600",
  badge: "جارية",
  badgeColor: "bg-primary/10 text-primary",
  isActive: true,
  sortOrder: 99,
  tiers: [{ ...EMPTY_TIER }, { ...EMPTY_TIER }, { ...EMPTY_TIER }],
};

export default function AdminCampaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM, tiers: [{ ...EMPTY_TIER }, { ...EMPTY_TIER }, { ...EMPTY_TIER }] });

  const { data: campaigns, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/admin/campaigns", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, tiers: [{ ...EMPTY_TIER }, { ...EMPTY_TIER }, { ...EMPTY_TIER }] });
    setEditingId(null);
    setShowDialog(true);
  };

  const openEdit = (c: any) => {
    const tiers = Array.isArray(c.tiers) && c.tiers.length > 0 ? [...c.tiers] : [{ ...EMPTY_TIER }, { ...EMPTY_TIER }, { ...EMPTY_TIER }];
    while (tiers.length < 3) tiers.push({ ...EMPTY_TIER });
    setForm({
      title: c.title || "",
      subtitle: c.subtitle || "",
      image: c.image || "",
      color: c.color || "from-primary to-teal-600",
      badge: c.badge || "جارية",
      badgeColor: c.badgeColor || "bg-primary/10 text-primary",
      isActive: c.isActive ?? true,
      sortOrder: c.sortOrder ?? 99,
      tiers,
    });
    setEditingId(c.id);
    setShowDialog(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, tiers: form.tiers.filter(t => t.label || t.amount) };
      if (editingId) {
        await apiRequest("PUT", `/api/admin/campaigns/${editingId}`, payload);
      } else {
        await apiRequest("POST", "/api/admin/campaigns", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({ title: editingId ? "✓ تم تحديث الحملة" : "✓ تم إضافة الحملة بنجاح" });
      setShowDialog(false);
    },
    onError: () => toast({ title: "خطأ", description: "فشلت العملية", variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/campaigns/${id}/active`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
    onError: () => toast({ title: "خطأ في التحديث", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/campaigns/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({ title: "✓ تم حذف الحملة" });
    },
    onError: () => toast({ title: "خطأ في الحذف", variant: "destructive" }),
  });

  const setTier = (index: number, field: "label" | "amount", value: string) => {
    const tiers = [...form.tiers];
    tiers[index] = { ...tiers[index], [field]: value };
    setForm({ ...form, tiers });
  };

  const addTier = () => setForm({ ...form, tiers: [...form.tiers, { ...EMPTY_TIER }] });
  const removeTier = (index: number) => setForm({ ...form, tiers: form.tiers.filter((_, i) => i !== index) });

  const list = campaigns || [];

  const DEFAULT_CAMPAIGNS = [
    {
      id: "water",
      title: "سقيا الماء",
      subtitle: "الماء أساس الحياة، ساهم في توفير المياه للمحتاجين",
      color: "from-cyan-500 to-teal-600",
      badge: "جارية",
      badgeColor: "bg-cyan-100 text-cyan-800",
      isActive: true,
      tiers: [{ label: "فرد", amount: "50 ر.س" }, { label: "أسرة", amount: "100 ر.س" }, { label: "وقف", amount: "500 ر.س" }]
    },
    {
      id: "ramadan",
      title: "سلة رمضانية",
      subtitle: "سلة غذائية متكاملة للأسر المحتاجة في شهر رمضان",
      color: "from-amber-500 to-orange-600",
      badge: "رمضان",
      badgeColor: "bg-amber-100 text-amber-800",
      isActive: true,
      tiers: [{ label: "سهم", amount: "100 ر.س" }, { label: "سلتين", amount: "200 ر.s" }, { label: "عائلة", amount: "500 ر.س" }]
    },
    {
      id: "iftar",
      title: "إفطار صائم",
      subtitle: "من فطّر صائماً كان له مثل أجره",
      color: "from-emerald-500 to-green-700",
      badge: "رمضان",
      badgeColor: "bg-emerald-100 text-emerald-800",
      isActive: true,
      tiers: [{ label: "وجبة", amount: "15 ر.س" }, { label: "10 وجبات", amount: "150 ر.س" }, { label: "50 وجبة", amount: "750 ر.س" }]
    }
  ];

  const displayList = list.length > 0 ? list : DEFAULT_CAMPAIGNS;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-6xl mx-auto" dir="rtl">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <Megaphone className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-black">إدارة الحملات</h1>
            <p className="text-xs text-muted-foreground">{displayList.length} حملة — تحكم كامل في بطاقات الصفحة الرئيسية</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2" data-testid="button-add-campaign">
          <Plus className="h-4 w-4" />
          حملة جديدة
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayList.map((c: any) => (
            <Card key={c.id} className={`overflow-hidden transition-all ${!c.isActive ? "opacity-50 grayscale" : ""}`} data-testid={`card-campaign-${c.id}`}>
              <div className={`h-2 bg-gradient-to-l ${c.color}`} />
              <div className="relative aspect-video overflow-hidden bg-muted">
                {c.image ? (
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                    <Megaphone className="h-10 w-10 text-white/50" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${c.badgeColor} shadow`}>🟢 {c.badge}</span>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant={c.isActive ? "default" : "secondary"} className="text-xs">
                    {c.isActive ? "نشط" : "مخفي"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-black text-base">{c.title}</h3>
                  {c.subtitle && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.subtitle}</p>}
                </div>
                {Array.isArray(c.tiers) && c.tiers.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {c.tiers.slice(0, 3).map((t: any, i: number) => (
                      <div key={i} className={`bg-gradient-to-b ${c.color} text-white rounded-lg p-2 text-center`}>
                        <p className="text-[10px] opacity-80 leading-tight">{t.label}</p>
                        <p className="font-bold text-xs">{t.amount}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={c.isActive}
                      onCheckedChange={(v) => toggleActive.mutate({ id: c.id, isActive: v })}
                      disabled={toggleActive.isPending}
                      data-testid={`toggle-active-${c.id}`}
                    />
                    <span className="text-xs text-muted-foreground">{c.isActive ? "ظاهر" : "مخفي"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => openEdit(c)} data-testid={`button-edit-campaign-${c.id}`}>
                      <Edit className="h-3.5 w-3.5" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { if (confirm("حذف هذه الحملة نهائياً؟")) deleteMutation.mutate(c.id); }}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-campaign-${c.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              {editingId ? "تعديل الحملة" : "إضافة حملة جديدة"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold">عنوان الحملة *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="سقيا الماء، السلة الرمضانية..." data-testid="input-campaign-title" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold">العنوان الفرعي (حديث أو اقتباس)</Label>
                <Textarea value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="قال رسول الله ﷺ: «...»" rows={2} className="text-sm resize-none" data-testid="input-campaign-subtitle" />
              </div>
            </div>

            <ImageUpload
              value={form.image}
              onChange={url => setForm({ ...form, image: url })}
              label="صورة الحملة (تظهر كخلفية للبطاقة)"
              testId="campaign-image"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">لون التدرج</Label>
                <Select value={form.color} onValueChange={v => setForm({ ...form, color: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded bg-gradient-to-l ${o.value}`} />
                          {o.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">الترتيب في الصفحة</Label>
                <Input type="number" min={1} value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} placeholder="1، 2، 3..." data-testid="input-sort-order" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">نص الشارة (Badge)</Label>
                <Input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="جارية، رمضان، فرصة..." data-testid="input-campaign-badge" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">لون الشارة</Label>
                <Select value={form.badgeColor} onValueChange={v => setForm({ ...form, badgeColor: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BADGE_COLOR_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${o.value}`}>{o.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold">فئات التبرع (تظهر في البطاقة)</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addTier}>
                  <Plus className="h-3 w-3" />
                  إضافة فئة
                </Button>
              </div>
              <div className="space-y-2">
                {form.tiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}</span>
                    <Input
                      className="flex-1 h-8 text-sm"
                      value={tier.label}
                      onChange={e => setTier(i, "label", e.target.value)}
                      placeholder="التسمية (مثل: سهم الفرد)"
                    />
                    <Input
                      className="flex-1 h-8 text-sm"
                      value={tier.amount}
                      onChange={e => setTier(i, "amount", e.target.value)}
                      placeholder="المبلغ (مثل: 50 ريال)"
                    />
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeTier(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
              <div>
                <p className="text-sm font-bold">{form.isActive ? "الحملة ظاهرة في الصفحة الرئيسية" : "الحملة مخفية (مسودة)"}</p>
                <p className="text-xs text-muted-foreground">يمكن تفعيل/إخفاء الحملة في أي وقت</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button className="flex-1" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title} data-testid="button-save-campaign">
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                {editingId ? "حفظ التعديلات" : "إضافة الحملة"}
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
