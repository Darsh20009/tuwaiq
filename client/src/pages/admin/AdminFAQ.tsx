import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Pencil, Trash2, Save, X, HelpCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

const empty = { question: "", answer: "", order: 0, isActive: true };

export default function AdminFAQ() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);

  const { data: faqs = [], isLoading } = useQuery<FAQ[]>({
    queryKey: ["/api/admin/faqs"],
    queryFn: async () => {
      const r = await fetch("/api/admin/faqs", { credentials: "include" });
      return r.ok ? r.json() : [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editing) {
        return apiRequest("PUT", `/api/admin/faqs/${editing.id}`, data);
      }
      return apiRequest("POST", "/api/admin/faqs", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      qc.invalidateQueries({ queryKey: ["/api/faqs"] });
      setEditing(null);
      setCreating(false);
      setForm(empty);
      toast({ title: "تم الحفظ بنجاح" });
    },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/faqs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      qc.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "تم الحذف" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (faq: FAQ) =>
      apiRequest("PUT", `/api/admin/faqs/${faq.id}`, { ...faq, isActive: !faq.isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      qc.invalidateQueries({ queryKey: ["/api/faqs"] });
    },
  });

  const startEdit = (faq: FAQ) => {
    setEditing(faq);
    setCreating(false);
    setForm({ question: faq.question, answer: faq.answer, order: faq.order, isActive: faq.isActive });
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm(empty);
  };

  const cancel = () => { setEditing(null); setCreating(false); setForm(empty); };

  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast({ title: "السؤال والجواب مطلوبان", variant: "destructive" });
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              الأسئلة الشائعة
            </h1>
            <p className="text-sm text-muted-foreground">إدارة الأسئلة والأجوبة المعروضة للزوار</p>
          </div>
        </div>
        <Button onClick={startCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          سؤال جديد
        </Button>
      </div>

      {(creating || editing) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">{editing ? "تعديل السؤال" : "سؤال جديد"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>السؤال *</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="ما هو السؤال؟"
              />
            </div>
            <div className="space-y-2">
              <Label>الجواب *</Label>
              <textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="اكتب الإجابة هنا..."
                rows={4}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الترتيب</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant={form.isActive ? "default" : "outline"}
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className="w-full gap-2"
                >
                  {form.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {form.isActive ? "مفعّل" : "معطّل"}
                </Button>
              </div>
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
      ) : faqs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">لا توجد أسئلة بعد. أضف أول سؤال!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id} className={`transition-all ${!faq.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={faq.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                        {faq.isActive ? "مفعّل" : "معطّل"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">ترتيب: {faq.order}</span>
                    </div>
                    <p className="font-semibold text-sm mb-1">{faq.question}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleMutation.mutate(faq)}
                      title={faq.isActive ? "تعطيل" : "تفعيل"}
                    >
                      {faq.isActive ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => startEdit(faq)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => { if (confirm("حذف هذا السؤال؟")) deleteMutation.mutate(faq.id); }}
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
