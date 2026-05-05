import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Newspaper, Plus, Edit, Trash2, Calendar, Eye, Globe, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ImageUpload } from "@/components/ImageUpload";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ color: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const CATEGORIES: any = {
  general: "عام",
  events: "فعاليات",
  announcements: "إعلانات",
  reports: "تقارير",
  news: "أخبار",
};

const emptyForm = {
  title: "", titleEn: "",
  summary: "", summaryEn: "",
  content: "", contentEn: "",
  imageUrl: "", category: "general",
  isPublished: true,
};

export default function AdminNews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [langTab, setLangTab] = useState<"ar" | "en">("ar");

  const { data: news, isLoading } = useQuery<any[]>({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const res = await fetch("/api/news?all=1", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setLangTab("ar");
    setShowDialog(true);
  };

  const openEdit = (item: any) => {
    setForm({
      title: item.title || "",
      titleEn: item.titleEn || "",
      summary: item.summary || "",
      summaryEn: item.summaryEn || "",
      content: item.content || "",
      contentEn: item.contentEn || "",
      imageUrl: item.imageUrl || "",
      category: item.category || "general",
      isPublished: item.isPublished ?? true,
    });
    setEditingId(item.id || item._id);
    setLangTab("ar");
    setShowDialog(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = form.title.replace(/\s+/g, "-").replace(/[^\w\u0600-\u06FF-]/g, "").toLowerCase() + "-" + Date.now();
      if (editingId) {
        await apiRequest("PUT", `/api/news/${editingId}`, form);
      } else {
        await apiRequest("POST", "/api/news", { ...form, slug });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: editingId ? "✓ تم تحديث الخبر" : "✓ تم نشر الخبر بنجاح" });
      setShowDialog(false);
    },
    onError: () => toast({ title: "خطأ", description: "فشلت العملية", variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      await apiRequest("PATCH", `/api/news/${id}/publish`, { isPublished });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: vars.isPublished ? "✓ تم نشر الخبر" : "✓ تم إخفاء الخبر" });
    },
    onError: () => toast({ title: "خطأ", description: "فشل التحديث", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/news/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "✓ تم حذف الخبر" });
    },
    onError: () => toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" }),
  });

  const list = news || [];
  const publishedCount = list.filter(n => n.isPublished !== false).length;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto" dir="rtl">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <Newspaper className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-black">الأخبار والمقالات</h1>
            <p className="text-xs text-muted-foreground">{list.length} مقال — {publishedCount} منشور</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2" data-testid="button-add-news">
          <Plus className="h-4 w-4" />
          خبر جديد
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : list.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">لا توجد أخبار حتى الآن</p>
            <p className="text-sm mt-1">أضف خبرك الأول بالضغط على "خبر جديد"</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {list.map((item: any) => {
            const id = item.id || item._id;
            const published = item.isPublished !== false;
            return (
              <Card key={id} className={`overflow-hidden hover:shadow-sm transition-shadow ${!published ? "opacity-60" : ""}`} data-testid={`card-news-${id}`}>
                <CardContent className="p-0">
                  <div className="flex gap-0">
                    {item.imageUrl && (
                      <div className="w-24 h-24 shrink-0 overflow-hidden bg-muted">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                    <div className="flex-1 p-4 flex items-start justify-between gap-4 min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-black text-base truncate">{item.title}</h3>
                          <Badge variant={published ? "default" : "secondary"} className="text-xs shrink-0 gap-1">
                            {published ? <Globe className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                            {published ? "منشور" : "مخفي"}
                          </Badge>
                          {item.category && item.category !== "general" && (
                            <Badge variant="outline" className="text-xs shrink-0">{CATEGORIES[item.category] || item.category}</Badge>
                          )}
                        </div>
                        {item.summary && <p className="text-sm text-muted-foreground line-clamp-1">{item.summary}</p>}
                        {item.titleEn && <p className="text-xs text-muted-foreground truncate mt-0.5" dir="ltr">{item.titleEn}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          {item.createdAt && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                            </span>
                          )}
                          {item.slug && (
                            <a href={`/news/${item.slug || id}`} target="_blank" className="text-xs text-primary flex items-center gap-1 hover:underline">
                              <Eye className="h-3 w-3" />
                              معاينة
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={published}
                            onCheckedChange={(v) => publishMutation.mutate({ id, isPublished: v })}
                            disabled={publishMutation.isPending}
                            data-testid={`toggle-publish-${id}`}
                          />
                          <span className="text-xs text-muted-foreground">{published ? "نشر" : "إخفاء"}</span>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => openEdit(item)} data-testid={`button-edit-${id}`}>
                          <Edit className="h-3.5 w-3.5" />
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => { if (confirm("هل تريد حذف هذا الخبر؟")) deleteMutation.mutate(id); }}
                          data-testid={`button-delete-news-${id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent dir="rtl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل الخبر" : "إضافة خبر جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">العنوان (عربي) *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان الخبر" data-testid="input-news-title" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">العنوان (English)</Label>
                <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="News title" dir="ltr" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">ملخص (عربي)</Label>
                <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="ملخص قصير يظهر في القائمة..." rows={2} className="text-sm resize-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">Summary (English)</Label>
                <Textarea value={form.summaryEn} onChange={(e) => setForm({ ...form, summaryEn: e.target.value })} placeholder="Short summary..." rows={2} className="text-sm resize-none" dir="ltr" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">التصنيف</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">عام</SelectItem>
                    <SelectItem value="events">فعاليات</SelectItem>
                    <SelectItem value="announcements">إعلانات</SelectItem>
                    <SelectItem value="reports">تقارير</SelectItem>
                    <SelectItem value="news">أخبار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">الحالة</Label>
                <div className="flex items-center gap-3 h-9 px-3 border rounded-md bg-muted/20">
                  <Switch checked={form.isPublished} onCheckedChange={v => setForm({ ...form, isPublished: v })} />
                  <span className="text-sm">{form.isPublished ? "منشور للعامة" : "مسودة (مخفي)"}</span>
                </div>
              </div>
            </div>

            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              label="صورة الخبر"
              testId="news-image"
            />

            <div className="flex gap-2 border-b pb-1">
              <Button variant={langTab === "ar" ? "default" : "ghost"} size="sm" onClick={() => setLangTab("ar")}>المحتوى عربي</Button>
              <Button variant={langTab === "en" ? "default" : "ghost"} size="sm" onClick={() => setLangTab("en")}>English Content</Button>
            </div>
            {langTab === "ar" ? (
              <div className="rounded-lg overflow-hidden border min-h-[200px]">
                <ReactQuill theme="snow" value={form.content} onChange={(v) => setForm({ ...form, content: v })} modules={quillModules} style={{ minHeight: "200px" }} />
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border min-h-[200px]" dir="ltr">
                <ReactQuill theme="snow" value={form.contentEn} onChange={(v) => setForm({ ...form, contentEn: v })} modules={quillModules} style={{ minHeight: "200px" }} />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title} data-testid="button-save-news">
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                {editingId ? "حفظ التعديلات" : "نشر الخبر"}
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
