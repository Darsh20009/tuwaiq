import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus, Trash2, Edit2, Save, X, Link2, Eye, ChevronDown, ChevronUp,
  FileText, Image, Video, Mic, AlignLeft, CheckSquare, List, MapPin, ToggleLeft
} from "lucide-react";

const FIELD_TYPES = [
  { value: "text", label: "نص قصير", icon: AlignLeft, color: "#4285F4" },
  { value: "textarea", label: "نص طويل", icon: FileText, color: "#0F9D58" },
  { value: "file", label: "ملف", icon: FileText, color: "#F4B400" },
  { value: "image", label: "صورة", icon: Image, color: "#DB4437" },
  { value: "video", label: "فيديو", icon: Video, color: "#9C27B0" },
  { value: "audio", label: "صوت", icon: Mic, color: "#00BCD4" },
  { value: "select", label: "قائمة اختيار", icon: List, color: "#FF5722" },
  { value: "radio", label: "اختيار واحد", icon: CheckSquare, color: "#607D8B" },
  { value: "checkbox", label: "اختيارات متعددة", icon: CheckSquare, color: "#795548" },
  { value: "location", label: "الموقع الجغرافي", icon: MapPin, color: "#4CAF50" },
];

function getFieldIcon(type: string) {
  const t = FIELD_TYPES.find(f => f.value === type);
  if (!t) return <AlignLeft className="w-4 h-4" />;
  const Icon = t.icon;
  return <Icon className="w-4 h-4" style={{ color: t.color }} />;
}

interface Question {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

function QuestionEditor({ q, onChange, onDelete }: { q: Question; onChange: (q: Question) => void; onDelete: () => void }) {
  const [optionInput, setOptionInput] = useState("");
  const needsOptions = ["select", "radio", "checkbox"].includes(q.type);

  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100">
          {getFieldIcon(q.type)}
        </div>
        <Input
          value={q.label}
          onChange={e => onChange({ ...q, label: e.target.value })}
          placeholder="نص السؤال..."
          className="flex-1 text-sm font-medium"
          dir="rtl"
        />
        <button onClick={onDelete} className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FIELD_TYPES.map(ft => (
          <button
            key={ft.value}
            onClick={() => onChange({ ...q, type: ft.value })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${q.type === ft.value ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
            style={q.type === ft.value ? { background: ft.color, borderColor: ft.color } : {}}
          >
            {ft.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={q.required}
            onChange={e => onChange({ ...q, required: e.target.checked })}
            className="w-3.5 h-3.5 accent-primary"
          />
          إجباري
        </label>
        {!needsOptions && (
          <Input
            value={q.placeholder || ""}
            onChange={e => onChange({ ...q, placeholder: e.target.value })}
            placeholder="نص توضيحي اختياري..."
            className="flex-1 text-xs h-7"
            dir="rtl"
          />
        )}
      </div>

      {needsOptions && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={optionInput}
              onChange={e => setOptionInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && optionInput.trim()) {
                  onChange({ ...q, options: [...(q.options || []), optionInput.trim()] });
                  setOptionInput("");
                }
              }}
              placeholder="اكتب خياراً ثم اضغط Enter..."
              className="flex-1 text-xs h-8"
              dir="rtl"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                if (optionInput.trim()) {
                  onChange({ ...q, options: [...(q.options || []), optionInput.trim()] });
                  setOptionInput("");
                }
              }}
            >
              إضافة
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(q.options || []).map((opt, i) => (
              <span key={i} className="flex items-center gap-1 bg-primary/8 text-primary text-xs px-2 py-0.5 rounded-lg">
                {opt}
                <button onClick={() => onChange({ ...q, options: (q.options || []).filter((_, j) => j !== i) })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCases() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [draft, setDraft] = useState<any>({ title: "", description: "", questions: [], isActive: true });

  const { data: forms = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/case-forms"] });
  const { data: stats } = useQuery<any>({ queryKey: ["/api/admin/cases/stats"] });

  const createMutation = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/admin/case-forms", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-forms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cases/stats"] });
      setShowNewForm(false);
      setDraft({ title: "", description: "", questions: [], isActive: true });
      toast({ title: "تم إنشاء النموذج بنجاح" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => apiRequest("PUT", `/api/admin/case-forms/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-forms"] });
      setEditingId(null);
      toast({ title: "تم التحديث بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/case-forms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-forms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cases/stats"] });
      toast({ title: "تم الحذف" });
    },
  });

  const toggleActive = (form: any) => {
    updateMutation.mutate({ id: form._id, body: { isActive: !form.isActive } });
  };

  const addQuestion = (target: any, setTarget: (v: any) => void) => {
    const q: Question = { id: Date.now().toString(), label: "", type: "text", required: false };
    setTarget({ ...target, questions: [...target.questions, q] });
  };

  const updateQuestion = (target: any, setTarget: (v: any) => void, idx: number, q: Question) => {
    const qs = [...target.questions];
    qs[idx] = q;
    setTarget({ ...target, questions: qs });
  };

  const removeQuestion = (target: any, setTarget: (v: any) => void, idx: number) => {
    setTarget({ ...target, questions: target.questions.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-black font-heading">إدارة الحالات الخاصة</h1>
            <p className="text-muted-foreground text-sm mt-0.5">أنشئ نماذج تسجيل مخصصة للحالات الإنسانية</p>
          </div>
        </div>
        <Button onClick={() => setShowNewForm(true)} className="gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> نموذج جديد
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "نماذج نشطة", value: stats.activeForms, color: "#059669" },
            { label: "حالات جديدة", value: stats.new, color: "#d97706" },
            { label: "مقبولة", value: stats.accepted, color: "#4285F4" },
            { label: "مرفوضة", value: stats.rejected, color: "#dc2626" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* New form creator */}
      {showNewForm && (
        <FormEditor
          form={draft}
          onChange={setDraft}
          onSave={() => createMutation.mutate(draft)}
          onCancel={() => setShowNewForm(false)}
          isSaving={createMutation.isPending}
          isNew
        />
      )}

      {/* Forms list */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">جاري التحميل...</div>
      ) : forms.length === 0 && !showNewForm ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">لا توجد نماذج حتى الآن</p>
          <p className="text-sm mt-1">اضغط "نموذج جديد" لإنشاء أول نموذج لتسجيل الحالات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {forms.map((form: any) => (
            editingId === form._id ? (
              <EditingFormEditor
                key={form._id}
                form={form}
                onSave={(body: any) => updateMutation.mutate({ id: form._id, body })}
                onCancel={() => setEditingId(null)}
                isSaving={updateMutation.isPending}
              />
            ) : (
              <Card key={form._id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                <div className="h-1 w-full" style={{ background: form.isActive ? "hsl(152 42% 45%)" : "#9ca3af" }} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-lg truncate">{form.title}</h3>
                        <Badge variant={form.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                          {form.isActive ? "نشط" : "موقوف"}
                        </Badge>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {form.questions?.length || 0} سؤال
                        </Badge>
                        <Badge variant="outline" className="text-xs shrink-0 text-amber-600 border-amber-200">
                          {form.submissionsCount || 0} تقديم
                        </Badge>
                      </div>
                      {form.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{form.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-lg break-all">
                          /cases/{form.slug}
                        </span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/cases/${form.slug}`); toast({ title: "تم نسخ الرابط" }); }}
                          className="text-xs text-muted-foreground hover:text-primary underline"
                        >نسخ</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <button
                        onClick={() => toggleActive(form)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${form.isActive ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                        title={form.isActive ? "إيقاف" : "تفعيل"}
                      >
                        <ToggleLeft className="w-4 h-4" />
                      </button>
                      <a href={`/cases/${form.slug}`} target="_blank" rel="noreferrer">
                        <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </a>
                      <button
                        onClick={() => setEditingId(form._id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm("هل تريد حذف هذا النموذج؟")) deleteMutation.mutate(form._id); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
}

function FormEditor({ form, onChange, onSave, onCancel, isSaving, isNew }: any) {
  return (
    <Card className="border-2 border-primary/20 rounded-2xl shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-black flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          {isNew ? "إنشاء نموذج جديد" : "تعديل النموذج"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={form.title}
          onChange={e => onChange({ ...form, title: e.target.value })}
          placeholder="عنوان النموذج (مثال: طلب دعم غذائي)"
          className="font-bold text-base"
          dir="rtl"
        />
        <Textarea
          value={form.description}
          onChange={e => onChange({ ...form, description: e.target.value })}
          placeholder="وصف مختصر للنموذج وهدفه..."
          rows={2}
          dir="rtl"
          className="text-sm resize-none"
        />

        <div className="space-y-3">
          <p className="text-sm font-bold text-muted-foreground">الأسئلة ({form.questions.length})</p>
          {form.questions.map((q: Question, i: number) => (
            <QuestionEditor
              key={q.id}
              q={q}
              onChange={nq => onChange({ ...form, questions: form.questions.map((x: any, j: number) => j === i ? nq : x) })}
              onDelete={() => onChange({ ...form, questions: form.questions.filter((_: any, j: number) => j !== i) })}
            />
          ))}
          <button
            onClick={() => onChange({ ...form, questions: [...form.questions, { id: Date.now().toString(), label: "", type: "text", required: false }] })}
            className="w-full py-3 border-2 border-dashed border-primary/25 rounded-2xl text-primary text-sm font-bold hover:border-primary/50 hover:bg-primary/3 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> إضافة سؤال
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={onSave} disabled={!form.title || isSaving} className="gap-2 rounded-xl">
            <Save className="w-4 h-4" />
            {isSaving ? "جاري الحفظ..." : "حفظ النموذج"}
          </Button>
          <Button variant="outline" onClick={onCancel} className="gap-2 rounded-xl">
            <X className="w-4 h-4" /> إلغاء
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EditingFormEditor({ form, onSave, onCancel, isSaving }: any) {
  const [draft, setDraft] = useState({ ...form });
  return <FormEditor form={draft} onChange={setDraft} onSave={() => onSave(draft)} onCancel={onCancel} isSaving={isSaving} />;
}
