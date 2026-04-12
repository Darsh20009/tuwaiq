import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Pencil, Trash2, Save, X, Megaphone, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Banner {
  id: string;
  message: string;
  link: string;
  bgColor: string;
  isActive: boolean;
}

const empty = { message: "", link: "", bgColor: "green", isActive: true };

const COLOR_OPTIONS = [
  { value: "green", label: "أخضر", cls: "bg-primary" },
  { value: "blue", label: "أزرق", cls: "bg-blue-600" },
  { value: "amber", label: "عنبري", cls: "bg-amber-500" },
  { value: "red", label: "أحمر", cls: "bg-red-600" },
  { value: "purple", label: "بنفسجي", cls: "bg-purple-600" },
  { value: "dark", label: "داكن", cls: "bg-gray-900" },
];

export default function AdminBanners() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ["/api/admin/announcements"],
    queryFn: async () => {
      const r = await fetch("/api/admin/announcements", { credentials: "include" });
      return r.ok ? r.json() : [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editing) return apiRequest("PUT", `/api/admin/announcements/${editing.id}`, data);
      return apiRequest("POST", "/api/admin/announcements", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      qc.invalidateQueries({ queryKey: ["/api/announcements/active"] });
      setEditing(null); setCreating(false); setForm(empty);
      toast({ title: "تم الحفظ" });
    },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/announcements/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      qc.invalidateQueries({ queryKey: ["/api/announcements/active"] });
      toast({ title: "تم الحذف" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (b: Banner) =>
      apiRequest("PUT", `/api/admin/announcements/${b.id}`, { ...b, isActive: !b.isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      qc.invalidateQueries({ queryKey: ["/api/announcements/active"] });
    },
  });

  const startEdit = (b: Banner) => {
    setEditing(b); setCreating(false);
    setForm({ message: b.message, link: b.link || "", bgColor: b.bgColor || "green", isActive: b.isActive });
  };
  const startCreate = () => { setEditing(null); setCreating(true); setForm(empty); };
  const cancel = () => { setEditing(null); setCreating(false); setForm(empty); };

  const handleSave = () => {
    if (!form.message.trim()) { toast({ title: "نص البانر مطلوب", variant: "destructive" }); return; }
    saveMutation.mutate(form);
  };

  const bgMap: Record<string, string> = {
    green: "bg-primary", blue: "bg-blue-600", amber: "bg-amber-500",
    red: "bg-red-600", purple: "bg-purple-600", dark: "bg-gray-900",
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" />
              البانر الإعلاني العائم
            </h1>
            <p className="text-sm text-muted-foreground">شريط إعلاني يظهر في أعلى جميع الصفحات للزوار</p>
          </div>
        </div>
        <Button onClick={startCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          بانر جديد
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4 text-sm text-amber-800 dark:text-amber-200">
          <strong>ملاحظة:</strong> يُعرض بانر واحد فقط في الوقت الحالي (الأول المفعّل). قم بتعطيل البانرات الأخرى لعرض بانر محدد.
        </CardContent>
      </Card>

      {(creating || editing) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">{editing ? "تعديل البانر" : "بانر إعلاني جديد"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>نص البانر *</Label>
              <Input
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="مثال: 🎉 حملة جمع التبرعات - لا تفوّت فرصة المشاركة!"
              />
            </div>
            <div className="space-y-2">
              <Label>رابط (اختياري)</Label>
              <Input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="مثال: /donate"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>لون البانر</Label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setForm({ ...form, bgColor: c.value })}
                    className={`px-3 py-1.5 rounded-full text-xs text-white font-medium transition-all ${c.cls} ${form.bgColor === c.value ? "ring-2 ring-offset-2 ring-primary scale-105" : "opacity-70"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">معاينة:</p>
              <div className={`${bgMap[form.bgColor] || "bg-primary"} text-white py-2 px-4 rounded text-sm text-center`}>
                <Megaphone className="inline w-3.5 h-3.5 ml-1" />
                {form.message || "نص البانر هنا..."}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={form.isActive ? "default" : "outline"}
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className="gap-2"
              >
                {form.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {form.isActive ? "مفعّل" : "معطّل"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
              <Button variant="outline" onClick={cancel} className="gap-2">
                <X className="w-4 h-4" />
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">جارٍ التحميل...</div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">لا توجد بانرات بعد. أضف أول بانر إعلاني!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <Card key={b.id} className={`transition-all ${!b.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${bgMap[b.bgColor] || "bg-primary"}`} />
                      <Badge variant={b.isActive ? "default" : "secondary"} className="text-xs">
                        {b.isActive ? "مفعّل" : "معطّل"}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm truncate">{b.message}</p>
                    {b.link && <p className="text-xs text-muted-foreground dir-ltr">{b.link}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => toggleMutation.mutate(b)}>
                      {b.isActive ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => startEdit(b)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="text-destructive hover:text-destructive"
                      onClick={() => { if (confirm("حذف هذا البانر؟")) deleteMutation.mutate(b.id); }}
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
    </div>
  );
}
