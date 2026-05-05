import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle, MapPin, Loader2, Upload, AlertCircle, ChevronRight, Image, Video, Mic, FileText
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

function LocationField({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const detect = () => {
    if (!navigator.geolocation) { setError("المتصفح لا يدعم تحديد الموقع"); return; }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let address = "";
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const d = await r.json();
          address = d.display_name || "";
        } catch {}
        onChange({ lat, lng, address });
        setLoading(false);
      },
      (err) => { setError("تعذّر تحديد الموقع: " + err.message); setLoading(false); }
    );
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={detect}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-bold text-sm hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        {loading ? "جاري تحديد موقعك..." : value ? "تحديث الموقع" : "تحديد موقعي الآن"}
      </button>
      {value && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          <div className="text-xs text-green-800">
            <p className="font-bold">تم تحديد الموقع ✓</p>
            <p className="mt-0.5 text-green-700 break-words">{value.address || `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="p-2 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}

function FileUploadField({ type, label, value, onChange }: { type: string; label: string; value: File | null; onChange: (f: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const accept = type === "image" ? "image/*" : type === "video" ? "video/*" : type === "audio" ? "audio/*" : "*/*";
  const Icon = type === "image" ? Image : type === "video" ? Video : type === "audio" ? Mic : FileText;

  return (
    <div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => onChange(e.target.files?.[0] || null)} />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-full py-4 border-2 border-dashed rounded-2xl flex flex-col items-center gap-2 transition-colors hover:border-primary hover:bg-primary/3"
        style={{ borderColor: value ? "hsl(152 42% 45%)" : undefined }}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${value ? "bg-green-100" : "bg-gray-100"}`}>
          <Icon className={`w-6 h-6 ${value ? "text-green-600" : "text-gray-400"}`} />
        </div>
        {value ? (
          <div className="text-center">
            <p className="text-sm font-bold text-green-700">تم اختيار الملف ✓</p>
            <p className="text-xs text-muted-foreground mt-0.5 break-all px-4">{value.name}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-bold text-gray-600">اضغط لرفع {label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">أو اسحب وأفلت الملف هنا</p>
          </div>
        )}
      </button>
    </div>
  );
}

export default function CaseFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [location, setLocation] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: form, isLoading, isError } = useQuery<any>({
    queryKey: [`/api/case-forms/${slug}`],
    enabled: !!slug,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      const textAnswers: Record<string, any> = {};
      for (const [k, v] of Object.entries(answers)) {
        if (!(v instanceof File)) textAnswers[k] = v;
      }
      fd.append("answers", JSON.stringify(textAnswers));
      if (location) {
        fd.append("lat", String(location.lat));
        fd.append("lng", String(location.lng));
        if (location.address) fd.append("address", location.address);
      }
      for (const [fieldId, file] of Object.entries(files)) {
        fd.append(fieldId, file);
      }
      const res = await fetch(`/api/case-forms/${slug}/submit`, { method: "POST", body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "خطأ"); }
      return res.json();
    },
    onSuccess: () => setSubmitted(true),
    onError: (e: any) => toast({ title: "حدث خطأ", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    for (const q of form.questions) {
      if (q.required) {
        const v = answers[q.id];
        const f = files[q.id];
        if (!v && !f) {
          toast({ title: "يرجى ملء الحقول الإجبارية", description: `الحقل "${q.label}" مطلوب`, variant: "destructive" });
          return;
        }
      }
    }
    submitMutation.mutate();
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">جاري تحميل النموذج...</p>
      </div>
    </div>
  );

  if (isError || !form) return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-3 p-8">
        <AlertCircle className="w-14 h-14 text-red-400 mx-auto" />
        <h2 className="text-xl font-black">النموذج غير موجود</h2>
        <p className="text-muted-foreground text-sm">تأكد من صحة الرابط أو تواصل مع الجمعية</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-green-700">تم استلام طلبك بنجاح!</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              شكراً لك. سيتم مراجعة حالتك من قِبل فريق الجمعية والتواصل معك في أقرب وقت ممكن.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800 text-right">
            <p className="font-bold mb-1">تذكّر:</p>
            <p>جمعية طويق تتواصل عبر القنوات الرسمية فقط. لا تشارك بياناتك مع أي جهة أخرى.</p>
          </div>
          <a href="/">
            <Button className="rounded-2xl gap-2">
              العودة للرئيسية <ChevronRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(152 55% 18%) 0%, hsl(152 48% 26%) 50%, hsl(175 55% 25%) 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,80 Q100,20 200,80 Q300,140 400,80 L400,160 L0,160 Z" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <CheckCircle className="w-3.5 h-3.5" /> جمعية طويق للخدمات الإنسانية
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{form.title}</h1>
          {form.description && (
            <p className="text-white/80 mt-3 text-sm leading-relaxed">{form.description}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4 text-white/60 text-xs">
            <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {form.questions.length} سؤال</span>
            <span>•</span>
            <span>{form.submissionsCount} تقديم سابق</span>
          </div>
        </div>
        <svg viewBox="0 0 400 40" className="w-full block" height="40">
          <path d="M0,40 L0,20 Q50,0 100,20 Q150,40 200,20 Q250,0 300,20 Q350,40 400,20 L400,40 Z" fill="hsl(35 28% 97%)" />
        </svg>
      </div>

      <div className="flex-1 py-8 px-4" style={{ backgroundColor: "hsl(35 28% 97%)" }}>
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">

          {form.questions.map((q: any, idx: number) => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <label className="block font-bold text-sm text-gray-800">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-black ml-2">{idx + 1}</span>
                {q.label}
                {q.required && <span className="text-red-500 mr-1">*</span>}
              </label>

              {q.type === "text" && (
                <Input
                  value={answers[q.id] || ""}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder={q.placeholder || "اكتب إجابتك هنا..."}
                  className="rounded-xl"
                  dir="rtl"
                  required={q.required}
                />
              )}

              {q.type === "textarea" && (
                <Textarea
                  value={answers[q.id] || ""}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder={q.placeholder || "اكتب تفاصيلك هنا..."}
                  rows={4}
                  className="rounded-xl resize-none"
                  dir="rtl"
                  required={q.required}
                />
              )}

              {(q.type === "file" || q.type === "image" || q.type === "video" || q.type === "audio") && (
                <FileUploadField
                  type={q.type}
                  label={q.label}
                  value={files[q.id] || null}
                  onChange={f => {
                    if (f) setFiles({ ...files, [q.id]: f });
                    else { const nf = { ...files }; delete nf[q.id]; setFiles(nf); }
                  }}
                />
              )}

              {q.type === "select" && (
                <select
                  value={answers[q.id] || ""}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  dir="rtl"
                  required={q.required}
                >
                  <option value="">— اختر —</option>
                  {(q.options || []).map((o: string) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}

              {q.type === "radio" && (
                <div className="space-y-2">
                  {(q.options || []).map((o: string) => (
                    <label key={o} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:border-primary/30 hover:bg-primary/3 transition-colors">
                      <input
                        type="radio"
                        name={q.id}
                        value={o}
                        checked={answers[q.id] === o}
                        onChange={() => setAnswers({ ...answers, [q.id]: o })}
                        className="accent-primary w-4 h-4"
                      />
                      <span className="text-sm">{o}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "checkbox" && (
                <div className="space-y-2">
                  {(q.options || []).map((o: string) => {
                    const selected: string[] = answers[q.id] || [];
                    return (
                      <label key={o} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:border-primary/30 hover:bg-primary/3 transition-colors">
                        <input
                          type="checkbox"
                          checked={selected.includes(o)}
                          onChange={e => {
                            const ns = e.target.checked ? [...selected, o] : selected.filter(s => s !== o);
                            setAnswers({ ...answers, [q.id]: ns });
                          }}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm">{o}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === "location" && (
                <LocationField value={location} onChange={setLocation} />
              )}
            </div>
          ))}

          {/* Auto location if no location field but form exists */}
          {!form.questions.some((q: any) => q.type === "location") && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="font-bold text-sm mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> موقعك الجغرافي (اختياري)
              </p>
              <LocationField value={location} onChange={setLocation} />
            </div>
          )}

          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full py-4 rounded-2xl font-black text-base gap-2 shadow-lg"
            style={{ background: "linear-gradient(135deg, hsl(152 52% 30%) 0%, hsl(175 50% 26%) 100%)" }}
          >
            {submitMutation.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> جاري الإرسال...</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> إرسال الطلب</>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            بياناتك محمية وسرية ✓ تعالج حصرياً من قِبل جمعية طويق للخدمات الإنسانية
          </p>
        </form>
      </div>

      <Footer />
    </div>
  );
}
