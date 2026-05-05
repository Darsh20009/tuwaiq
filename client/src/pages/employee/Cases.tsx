import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  ClipboardList, MapPin, Brain, CheckCircle, XCircle, Eye, Clock,
  FileText, Image, Video, Mic, Loader2, ChevronDown, ChevronUp,
  Sparkles, AlertTriangle, User
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  new:      { label: "جديدة", color: "#d97706", bg: "#fef3c7", icon: Clock },
  reviewed: { label: "قيد المراجعة", color: "#0284c7", bg: "#e0f2fe", icon: Eye },
  accepted: { label: "مقبولة", color: "#059669", bg: "#d1fae5", icon: CheckCircle },
  rejected: { label: "مرفوضة", color: "#dc2626", bg: "#fee2e2", icon: XCircle },
};

function AttachmentPreview({ url }: { url: string }) {
  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const isVid = /\.(mp4|webm|mov)$/i.test(url);
  const isAud = /\.(mp3|wav|ogg|m4a)$/i.test(url);
  const fullUrl = url.startsWith("/") ? url : `/${url}`;

  if (isImg) return <img src={fullUrl} alt="مرفق" className="w-full max-h-48 object-contain rounded-xl border border-gray-100" />;
  if (isVid) return <video src={fullUrl} controls className="w-full max-h-48 rounded-xl border border-gray-100" />;
  if (isAud) return <audio src={fullUrl} controls className="w-full" />;
  return (
    <a href={fullUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary text-sm underline">
      <FileText className="w-4 h-4" /> عرض الملف المرفق
    </a>
  );
}

function CaseCard({ sub, onRefresh }: { sub: any; onRefresh: () => void }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(sub.employeeNotes || "");
  const [showAI, setShowAI] = useState(false);

  const statusMutation = useMutation({
    mutationFn: ({ status, employeeNotes }: any) =>
      apiRequest("PATCH", `/api/employee/cases/${sub._id}/status`, { status, employeeNotes }),
    onSuccess: () => { onRefresh(); toast({ title: "تم تحديث الحالة" }); },
  });

  const aiMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/employee/cases/${sub._id}/analyze`),
    onSuccess: () => { onRefresh(); setShowAI(true); toast({ title: "اكتمل التحليل الذكي ✓" }); },
    onError: () => toast({ title: "تعذّر التحليل", variant: "destructive" }),
  });

  const sc = STATUS_CONFIG[sub.status] || STATUS_CONFIG.new;
  const StatusIcon = sc.icon;

  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
      <div className="h-1 w-full" style={{ background: sc.color }} />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-black text-base">{sub.formTitle}</span>
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{ color: sc.color, backgroundColor: sc.bg }}
              >
                <StatusIcon className="w-3 h-3" /> {sc.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(sub.submittedAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            {sub.location && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-700">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-xs">{sub.location.address || `${sub.location.lat?.toFixed(4)}, ${sub.location.lng?.toFixed(4)}`}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* AI quick badge */}
        {sub.aiAnalysis && !showAI && (
          <button
            onClick={() => setShowAI(true)}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors text-right"
          >
            <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
            <span className="text-xs text-violet-800 font-bold">عرض تحليل الذكاء الاصطناعي</span>
          </button>
        )}

        {/* AI Analysis Panel */}
        {showAI && sub.aiAnalysis && (
          <div className="p-4 rounded-2xl border border-violet-200" style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-black text-violet-700">تحليل الذكاء الاصطناعي</span>
              <button onClick={() => setShowAI(false)} className="mr-auto text-xs text-violet-400 hover:text-violet-600">إخفاء</button>
            </div>
            <p className="text-xs text-violet-900 whitespace-pre-wrap leading-relaxed">{sub.aiAnalysis}</p>
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <div className="space-y-2">
              {Object.entries(sub.answers).map(([k, v]) => {
                const isUrl = typeof v === "string" && v.startsWith("/uploads");
                return (
                  <div key={k} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <p className="text-xs font-bold text-muted-foreground mb-1">{k}</p>
                    {isUrl ? (
                      <AttachmentPreview url={v as string} />
                    ) : (
                      <p className="text-sm break-words">{Array.isArray(v) ? v.join("، ") : String(v)}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI Analyze button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50"
              onClick={() => aiMutation.mutate()}
              disabled={aiMutation.isPending}
            >
              {aiMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحليل الذكي...</>
              ) : (
                <><Brain className="w-4 h-4" /> {sub.aiAnalysis ? "إعادة التحليل بالذكاء الاصطناعي" : "تحليل الحالة بالذكاء الاصطناعي"}</>
              )}
            </Button>

            {/* Notes */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground">ملاحظات الموظف</p>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="أضف ملاحظاتك حول هذه الحالة..."
                rows={2}
                dir="rtl"
                className="text-sm resize-none rounded-xl"
              />
            </div>

            {/* Status actions */}
            <div className="flex flex-wrap gap-2">
              {["reviewed", "accepted", "rejected"].map(st => {
                const c = STATUS_CONFIG[st];
                const Icon = c.icon;
                return (
                  <button
                    key={st}
                    onClick={() => statusMutation.mutate({ status: st, employeeNotes: notes })}
                    disabled={statusMutation.isPending || sub.status === st}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border disabled:opacity-40"
                    style={sub.status === st ? { backgroundColor: c.bg, color: c.color, borderColor: c.color } : { backgroundColor: "white", color: c.color, borderColor: c.color + "66" }}
                  >
                    <Icon className="w-3.5 h-3.5" /> {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EmployeeCases() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/employee/cases", statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/employee/cases?${params}`);
      return res.json();
    },
  });

  const { data: forms } = useQuery<any[]>({ queryKey: ["/api/case-forms"] });

  const items: any[] = data?.items || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-black font-heading">الحالات الخاصة</h1>
          <p className="text-muted-foreground text-sm mt-0.5">مراجعة وتحليل الحالات المسجّلة</p>
        </div>
      </div>

      {/* Summary banner */}
      <div className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, hsl(152 55% 18%) 0%, hsl(175 55% 22%) 100%)" }}>
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-white font-black text-lg leading-none">{total} حالة</p>
          <p className="text-white/70 text-xs mt-0.5">إجمالي الحالات المسجّلة في النظام</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-amber-200 text-xs font-bold">الذكاء الاصطناعي جاهز للتحليل</span>
        </div>
        <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-white/5" />
      </div>

      {/* Active forms quick links */}
      {Array.isArray(forms) && forms.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2">نماذج التسجيل النشطة:</p>
          <div className="flex flex-wrap gap-2">
            {forms.map((f: any) => (
              <a key={f._id} href={`/cases/${f.slug}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-primary/20 text-primary text-xs font-bold hover:bg-primary/5 transition-colors shadow-sm">
                <Eye className="w-3.5 h-3.5" /> {f.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "", label: "الكل" },
          { value: "new", label: "جديدة" },
          { value: "reviewed", label: "قيد المراجعة" },
          { value: "accepted", label: "مقبولة" },
          { value: "rejected", label: "مرفوضة" },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${statusFilter === f.value ? "text-white bg-primary border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cases list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold">لا توجد حالات</p>
          <p className="text-sm mt-1">لم يتم تسجيل أي حالات بهذا الفلتر بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((sub: any) => (
            <CaseCard key={sub._id} sub={sub} onRefresh={() => refetch()} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-xl">السابق</Button>
          <span className="text-sm text-muted-foreground">{page} / {pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-xl">التالي</Button>
        </div>
      )}
    </div>
  );
}
