import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload, Eye, EyeOff, Image, Film, Plus, X, GripVertical } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { SliderItem } from "@shared/schema";

function UploadDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    primaryLink: "/donate",
    primaryLabel: "تبرع الآن",
    secondaryLink: "",
    secondaryLabel: "",
    order: "0",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error("اختر ملفاً أولاً");
      const fd = new FormData();
      fd.append("file", file);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const res = await fetch("/api/admin/slider", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slider"] });
      toast({ title: "تمت الإضافة بنجاح" });
      onClose();
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");
    setPreview({ url, type: isVideo ? "video" : "image" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-heading font-bold text-lg">إضافة شريحة جديدة</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <Label className="mb-2 block">الملف (صورة أو فيديو) *</Label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                preview.type === "video" ? (
                  <video src={preview.url} className="max-h-40 mx-auto rounded-lg" controls />
                ) : (
                  <img src={preview.url} className="max-h-40 mx-auto rounded-lg object-contain" alt="preview" />
                )
              ) : (
                <div className="text-gray-400">
                  <Upload className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">اضغط لاختيار صورة أو فيديو من جهازك</p>
                  <p className="text-xs mt-1">JPG, PNG, MP4, MOV</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={onFileChange} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-sm">العنوان</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="العنوان الرئيسي" />
            </div>
            <div>
              <Label className="mb-1 block text-sm">الترتيب</Label>
              <Input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} />
            </div>
          </div>

          <div>
            <Label className="mb-1 block text-sm">الوصف</Label>
            <Input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="نص توضيحي أسفل العنوان" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-sm">رابط الزر الأول</Label>
              <Input value={form.primaryLink} onChange={e => setForm(p => ({ ...p, primaryLink: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1 block text-sm">نص الزر الأول</Label>
              <Input value={form.primaryLabel} onChange={e => setForm(p => ({ ...p, primaryLabel: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-sm">رابط الزر الثاني</Label>
              <Input value={form.secondaryLink} onChange={e => setForm(p => ({ ...p, secondaryLink: e.target.value }))} placeholder="اختياري" />
            </div>
            <div>
              <Label className="mb-1 block text-sm">نص الزر الثاني</Label>
              <Input value={form.secondaryLabel} onChange={e => setForm(p => ({ ...p, secondaryLabel: e.target.value }))} placeholder="اختياري" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t">
          <Button className="flex-1" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "جاري الرفع..." : "إضافة الشريحة"}
          </Button>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </div>
    </div>
  );
}

function SliderCard({ item, onDelete, onToggle }: {
  item: SliderItem & { id: string };
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col"
      style={{ border: "1px solid hsl(35 15% 88%)", opacity: item.isActive ? 1 : 0.6 }}
      data-testid={`slider-card-${item.id}`}
    >
      <div className="relative h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {item.mediaType === "video" ? (
          <video src={item.mediaUrl} className="w-full h-full object-cover" muted playsInline />
        ) : (
          <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${item.mediaType === "video" ? "bg-purple-600" : "bg-blue-500"}`}>
            {item.mediaType === "video" ? <Film className="w-3 h-3 inline ml-1" /> : <Image className="w-3 h-3 inline ml-1" />}
            {item.mediaType === "video" ? "فيديو" : "صورة"}
          </span>
        </div>
        {!item.isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-bold">مخفي</span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1">
        <h3 className="font-heading font-bold text-sm mb-1 line-clamp-1">{item.title || "بدون عنوان"}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.subtitle || "—"}</p>
        {item.primaryLabel && (
          <div className="text-xs text-gray-400">
            <span className="font-medium">الزر الأول:</span> {item.primaryLabel} → {item.primaryLink}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-3 border-t" style={{ borderColor: "hsl(35 15% 88%)" }}>
        <div className="flex items-center gap-2">
          {item.isActive ? (
            <Eye className="w-4 h-4 text-green-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
          <Switch
            checked={item.isActive}
            onCheckedChange={() => onToggle(item.id)}
            data-testid={`toggle-slider-${item.id}`}
          />
        </div>
        <button
          className="text-red-500 hover:text-red-700 p-1"
          onClick={() => onDelete(item.id)}
          data-testid={`delete-slider-${item.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminSlider() {
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);

  const { data: items = [], isLoading } = useQuery<(SliderItem & { id: string })[]>({
    queryKey: ["/api/admin/slider"],
    queryFn: async () => {
      const res = await fetch("/api/admin/slider");
      if (!res.ok) throw new Error("فشل جلب الشرائح");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/slider/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slider"] });
      toast({ title: "تم حذف الشريحة" });
    },
    onError: () => toast({ title: "خطأ في الحذف", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/slider/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) throw new Error("فشل التبديل");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/slider"] }),
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  return (
    <div dir="rtl" className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <div>
            <h1 className="text-xl md:text-2xl font-black font-heading">إدارة البانر الرئيسي</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">أضف صوراً وفيديوهات تظهر في بانر الصفحة الرئيسية</p>
          </div>
        </div>
        <Button onClick={() => setShowUpload(true)} className="flex items-center gap-2" data-testid="btn-add-slide">
          <Plus className="w-4 h-4" />
          إضافة شريحة
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border" style={{ borderColor: "hsl(35 15% 88%)" }}>
          <Film className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="font-heading font-bold text-lg mb-2">لا توجد شرائح بعد</h3>
          <p className="text-gray-500 text-sm mb-4">اضغط "إضافة شريحة" لرفع صورة أو فيديو</p>
          <Button onClick={() => setShowUpload(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة أول شريحة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <SliderCard
              key={item.id}
              item={item}
              onDelete={(id) => deleteMutation.mutate(id)}
              onToggle={(id) => toggleMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700 border border-blue-100">
        <strong>ملاحظة:</strong> الشرائح المخفية لا تظهر للزوار. الترتيب يحدد أيها يُعرض أولاً.
        إذا لم تكن هناك أي شريحة مفعّلة، يظهر البانر فارغاً.
      </div>

      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
    </div>
  );
}
