import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Save, Globe, Image, Search, CheckCircle2, AlertTriangle,
  Edit2, Trash2, Plus, Eye, Share2, ExternalLink,
} from "lucide-react";

const KNOWN_ROUTES = [
  { path: "/", label: "الصفحة الرئيسية", defaultImage: "/images/og-banner1.png" },
  { path: "/donate", label: "صفحة التبرع", defaultImage: "/images/og-banner2.png" },
  { path: "/bank-transfer", label: "التحويل البنكي", defaultImage: "/images/og-banner1.png" },
  { path: "/services", label: "الخدمات", defaultImage: "/images/og-water.png" },
  { path: "/services/hajj", label: "كفالة حاج", defaultImage: "/images/og-banner1.png" },
  { path: "/services/families", label: "كفالة أسر أرامل ومطلقات", defaultImage: "/images/og-banner1.png" },
  { path: "/services/orphan", label: "كفالة يتيم", defaultImage: "/images/og-banner1.png" },
  { path: "/services/relief", label: "تفريج كربة", defaultImage: "/images/og-banner1.png" },
  { path: "/campaigns", label: "المشاريع الإنسانية", defaultImage: "/images/og-banner2.png" },
  { path: "/about", label: "من نحن", defaultImage: "/images/og-banner1.png" },
  { path: "/contact", label: "تواصل معنا", defaultImage: "/images/og-banner1.png" },
  { path: "/leaderboard", label: "قائمة الشرف", defaultImage: "/images/og-banner1.png" },
  { path: "/volunteer", label: "تطوع معنا", defaultImage: "/images/og-banner1.png" },
  { path: "/jobs", label: "التوظيف", defaultImage: "/images/og-banner1.png" },
];

interface SEOOverride {
  path: string;
  title?: string;
  description?: string;
  image?: string;
}

interface EditState {
  path: string;
  title: string;
  description: string;
  image: string;
}

export default function AdminSEO() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<EditState | null>(null);
  const [customPath, setCustomPath] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  const { data, isLoading } = useQuery<{ overrides: SEOOverride[]; staticRoutes: string[] }>({
    queryKey: ["/api/admin/seo"],
    queryFn: async () => {
      const res = await fetch("/api/admin/seo", { credentials: "include" });
      if (!res.ok) return { overrides: [], staticRoutes: [] };
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: EditState) => {
      const res = await fetch(`/api/admin/seo?path=${encodeURIComponent(payload.path)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: payload.title,
          description: payload.description,
          image: payload.image,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo"] });
      toast({ title: "✓ تم حفظ إعدادات SEO" });
      setEditing(null);
    },
    onError: () => {
      toast({ title: "خطأ في الحفظ", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (path: string) => {
      const res = await fetch(`/api/admin/seo?path=${encodeURIComponent(path)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo"] });
      toast({ title: "✓ تم حذف التخصيص" });
    },
  });

  const overrideMap = new Map((data?.overrides || []).map((o) => [o.path, o]));

  const handleEdit = (path: string, label?: string) => {
    const existing = overrideMap.get(path);
    const route = KNOWN_ROUTES.find((r) => r.path === path);
    setEditing({
      path,
      title: existing?.title || label || "",
      description: existing?.description || "",
      image: existing?.image || route?.defaultImage || "",
    });
  };

  const handleAddCustom = () => {
    if (!customPath.trim()) return;
    const path = customPath.startsWith("/") ? customPath : `/${customPath}`;
    handleEdit(path, "");
    setCustomPath("");
    setShowCustomForm(false);
  };

  const absUrl = (path: string) => `${window.location.origin}${path}`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-xl font-black">إدارة SEO ومشاركة الروابط</h1>
              <p className="text-xs text-muted-foreground">تخصيص العنوان والوصف والصورة لكل صفحة عند مشاركتها</p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowCustomForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة صفحة مخصصة
        </Button>
      </div>

      {/* Info banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-3">
          <div className="flex gap-3 text-sm text-blue-800">
            <Share2 className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <p className="font-bold mb-1">كيف يعمل هذا النظام؟</p>
              <p>عندما يشارك أحد رابطاً من موقعك في WhatsApp أو Twitter أو Facebook، تظهر الصورة والعنوان والوصف المحددة هنا. يتم اكتشاف روبوتات المشاركة تلقائياً وتقديم بيانات مخصصة لها.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom path form */}
      {showCustomForm && (
        <Card className="border-dashed border-2 border-primary/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-xs font-bold text-muted-foreground">مسار الصفحة (مثال: /news/article-1)</Label>
                <Input
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  placeholder="/custom-page"
                  dir="ltr"
                  className="mt-1 font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                />
              </div>
              <div className="pt-5 flex gap-2">
                <Button onClick={handleAddCustom} size="sm">إضافة</Button>
                <Button variant="outline" size="sm" onClick={() => setShowCustomForm(false)}>إلغاء</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route cards */}
      <div className="space-y-3">
        {KNOWN_ROUTES.map((route) => {
          const override = overrideMap.get(route.path);
          const hasCustom = !!override;
          const currentImage = override?.image || route.defaultImage;

          return (
            <Card
              key={route.path}
              className={`transition-all ${editing?.path === route.path ? "ring-2 ring-primary/30 bg-primary/5" : ""}`}
            >
              <CardContent className="pt-4 pb-4">
                {editing?.path === route.path ? (
                  /* Edit form */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm">{route.label}</p>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{route.path}</code>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">العنوان (og:title)</Label>
                      <Input
                        value={editing.title}
                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        placeholder="عنوان الصفحة عند مشاركتها"
                        maxLength={60}
                      />
                      <p className="text-xs text-muted-foreground text-left">{editing.title.length}/60</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">الوصف (og:description)</Label>
                      <Textarea
                        value={editing.description}
                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                        placeholder="وصف مختصر يظهر عند مشاركة الرابط"
                        rows={2}
                        maxLength={160}
                      />
                      <p className="text-xs text-muted-foreground text-left">{editing.description.length}/160</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">رابط الصورة (og:image)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={editing.image}
                          onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                          placeholder="/images/og-banner1.png"
                          dir="ltr"
                          className="font-mono flex-1"
                        />
                      </div>
                      {/* Image presets */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {[
                          { label: "بانر 1", value: "/images/og-banner1.png" },
                          { label: "بانر 2", value: "/images/og-banner2.png" },
                          { label: "سقيا الماء", value: "/images/og-water.png" },
                          { label: "رمضانية", value: "/images/og-ramadan.png" },
                          { label: "إفطار", value: "/images/og-iftar.png" },
                        ].map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setEditing({ ...editing, image: p.value })}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${editing.image === p.value ? "bg-primary text-white border-primary" : "border-border hover:bg-muted"}`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      {/* Image preview */}
                      {editing.image && (
                        <div className="mt-2 rounded-xl overflow-hidden border" style={{ maxHeight: "120px" }}>
                          <img
                            src={editing.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => saveMutation.mutate(editing)}
                        disabled={saveMutation.isPending}
                        className="gap-2"
                        size="sm"
                      >
                        {saveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        حفظ
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditing(null)}>إلغاء</Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center gap-4">
                    {/* Image thumbnail */}
                    <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 border bg-muted">
                      <img
                        src={currentImage}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm">{route.label}</p>
                        {hasCustom ? (
                          <Badge variant="default" className="text-xs gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> مخصص
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Globe className="h-2.5 w-2.5" /> افتراضي
                          </Badge>
                        )}
                      </div>
                      <code className="text-xs text-muted-foreground font-mono">{route.path}</code>
                      {hasCustom && override?.title && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">العنوان: {override.title}</p>
                      )}
                      {hasCustom && override?.description && (
                        <p className="text-xs text-muted-foreground truncate">الوصف: {override.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={route.path} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="عرض الصفحة">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(route.path, route.label)}
                        title="تعديل"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      {hasCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(route.path)}
                          disabled={deleteMutation.isPending}
                          title="حذف التخصيص"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Custom overrides not in KNOWN_ROUTES */}
        {(data?.overrides || [])
          .filter((o) => !KNOWN_ROUTES.some((r) => r.path === o.path))
          .map((override) => (
            <Card key={override.path} className={editing?.path === override.path ? "ring-2 ring-primary/30 bg-primary/5" : ""}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 border bg-muted">
                    {override.image && (
                      <img src={override.image} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs font-mono font-bold">{override.path}</code>
                      <Badge variant="default" className="text-xs">مخصص</Badge>
                    </div>
                    {override.title && <p className="text-xs text-muted-foreground truncate">العنوان: {override.title}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(override.path)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(override.path)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Preview note */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4 pb-3">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-bold text-foreground">ملاحظات مهمة:</p>
            <p>• الصور المتاحة في الموقع: <code className="font-mono">/images/og-banner1.png</code>, <code className="font-mono">/images/og-banner2.png</code>, <code className="font-mono">/images/og-water.png</code>, <code className="font-mono">/images/og-ramadan.png</code>, <code className="font-mono">/images/og-iftar.png</code></p>
            <p>• يمكنك أيضاً استخدام روابط صور خارجية كاملة تبدأ بـ <code className="font-mono">https://</code></p>
            <p>• الأبعاد المثالية للصور: <strong>1200 × 630 بكسل</strong></p>
            <p>• تغييرات OG تظهر مباشرة لروبوتات المشاركة، لكن WhatsApp وFacebook يخزنون الروابط مؤقتاً لعدة ساعات</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
