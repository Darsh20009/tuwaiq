import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Briefcase, Plus, Edit, Trash2, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SidebarTrigger } from "@/components/ui/sidebar";

const emptyForm = {
  title: "",
  titleEn: "",
  department: "",
  departmentEn: "",
  description: "",
  descriptionEn: "",
  requirements: "",
  requirementsEn: "",
  isActive: true,
  customQuestions: [] as string[],
};

export default function AdminJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newQuestion, setNewQuestion] = useState("");

  const { data: jobs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/jobs"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/jobs", { credentials: "include" });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : [];
      } catch { return []; }
    },
  });

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowDialog(true);
  };

  const openEdit = (job: any) => {
    setForm({
      title: job.title || "",
      titleEn: job.titleEn || "",
      department: job.department || "",
      departmentEn: job.departmentEn || "",
      description: job.description || "",
      descriptionEn: job.descriptionEn || "",
      requirements: job.requirements || "",
      requirementsEn: job.requirementsEn || "",
      isActive: job.isActive !== false,
      customQuestions: job.customQuestions || [],
    });
    setEditingId(job.id || job._id);
    setShowDialog(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        await apiRequest("PUT", `/api/jobs/${editingId}`, form);
      } else {
        await apiRequest("POST", "/api/jobs", form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: editingId ? "✓ تم تحديث الوظيفة" : "✓ تم نشر الوظيفة" });
      setShowDialog(false);
    },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/jobs/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "✓ تم حذف الوظيفة" });
    },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    setForm({ ...form, customQuestions: [...form.customQuestions, newQuestion.trim()] });
    setNewQuestion("");
  };

  const removeQuestion = (i: number) => {
    const qs = [...form.customQuestions];
    qs.splice(i, 1);
    setForm({ ...form, customQuestions: qs });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-xl font-black">إدارة الوظائف</h1>
              <p className="text-xs text-muted-foreground">نشر وإدارة الوظائف الشاغرة</p>
            </div>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          وظيفة جديدة
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {(!jobs || jobs.length === 0) ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold">لا توجد وظائف</p>
                <p className="text-sm mt-1">أضف وظيفة جديدة للبدء</p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base">{job.title}</h3>
                        <Badge variant={job.isActive !== false ? "default" : "secondary"} className="text-[10px]">
                          {job.isActive !== false ? "مفعّلة" : "موقوفة"}
                        </Badge>
                      </div>
                      {job.department && (
                        <p className="text-sm text-muted-foreground mt-0.5">{job.department}</p>
                      )}
                      {job.description && (
                        <p className="text-sm text-foreground/70 mt-2 line-clamp-2">{job.description}</p>
                      )}
                      {job.customQuestions?.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {job.customQuestions.length} أسئلة مخصصة
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(job)}>
                        <Edit className="h-3.5 w-3.5" />
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`هل تريد حذف وظيفة "${job.title}"؟`)) {
                            deleteMutation.mutate(job.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل الوظيفة" : "إضافة وظيفة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">المسمى الوظيفي (عربي)</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="محاسب" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">المسمى (English)</Label>
                <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Accountant" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">القسم (عربي)</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="الحسابات" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">Department (English)</Label>
                <Input value={form.departmentEn} onChange={(e) => setForm({ ...form, departmentEn: e.target.value })} placeholder="Accounting" dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold">وصف الوظيفة</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف تفصيلي..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold">المتطلبات والشروط</Label>
              <Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="المتطلبات..." rows={3} />
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <Label className="text-xs font-bold flex items-center gap-2">
                أسئلة مخصصة للمتقدمين
                <Badge variant="outline" className="text-[10px]">{form.customQuestions.length}</Badge>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addQuestion()}
                  placeholder="أضف سؤالاً للمتقدم..."
                  className="flex-1"
                />
                <Button size="sm" onClick={addQuestion} disabled={!newQuestion.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.customQuestions.length > 0 && (
                <div className="space-y-2">
                  {form.customQuestions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                      <span className="text-xs text-muted-foreground font-bold">{i + 1}.</span>
                      <span className="text-sm flex-1">{q}</span>
                      <button onClick={() => removeQuestion(i)} className="text-destructive hover:text-destructive/80">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 border rounded-lg p-3">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <div>
                <p className="text-sm font-bold">الوظيفة مفعّلة</p>
                <p className="text-xs text-muted-foreground">تظهر في صفحة الوظائف للزوار</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                {editingId ? "حفظ التعديلات" : "نشر الوظيفة"}
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
