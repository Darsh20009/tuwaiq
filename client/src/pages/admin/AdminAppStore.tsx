import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, XCircle, AlertTriangle, ExternalLink, Copy, Download,
  Smartphone, Apple, Globe, Shield, Image, FileText, Star, ChevronRight,
  MonitorSmartphone, Zap, Package, Lock, Users, MessageSquare, ClipboardList,
  Upload, Trash2, HardDrive, CloudUpload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SiGoogleplay } from "react-icons/si";
import { cn } from "@/lib/utils";

// ─── PWA check helpers ──────────────────────────────────────────────────────

interface CheckItem {
  id: string;
  label: string;
  description: string;
  status: "pass" | "warn" | "fail";
  detail?: string;
  link?: string;
}

function StatusIcon({ status }: { status: CheckItem["status"] }) {
  if (status === "pass") return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
  if (status === "warn") return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
  return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
}

function StatusBadge({ status }: { status: CheckItem["status"] }) {
  const map = { pass: ["اكتمل", "bg-emerald-100 text-emerald-700"], warn: ["تحذير", "bg-amber-100 text-amber-700"], fail: ["مطلوب", "bg-red-100 text-red-700"] };
  const [label, cls] = map[status];
  return <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", cls)}>{label}</span>;
}

function CheckRow({ item }: { item: CheckItem }) {
  const { toast } = useToast();
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-xl border transition-all",
      item.status === "pass" ? "border-emerald-100 bg-emerald-50/50" :
      item.status === "warn" ? "border-amber-100 bg-amber-50/50" :
      "border-red-100 bg-red-50/50"
    )}>
      <StatusIcon status={item.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-gray-800">{item.label}</p>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
        {item.detail && (
          <p className={cn("text-xs mt-1 font-medium",
            item.status === "pass" ? "text-emerald-700" :
            item.status === "warn" ? "text-amber-700" : "text-red-700"
          )}>{item.detail}</p>
        )}
      </div>
      {item.link && (
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs shrink-0">
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </a>
      )}
    </div>
  );
}

function StepCard({ num, title, children, done = false }: { num: number; title: string; children: React.ReactNode; done?: boolean }) {
  return (
    <div className={cn("border rounded-2xl overflow-hidden", done ? "border-emerald-200" : "border-gray-200")}>
      <div className={cn("flex items-center gap-3 px-4 py-3", done ? "bg-emerald-50" : "bg-gray-50")}>
        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shrink-0",
          done ? "bg-emerald-500 text-white" : "bg-gray-700 text-white"
        )}>
          {done ? <CheckCircle2 className="w-4 h-4" /> : num}
        </div>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="p-4 text-sm text-gray-700 space-y-2 leading-relaxed">{children}</div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const { toast } = useToast();
  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-green-400 text-xs rounded-xl p-3 overflow-x-auto font-mono leading-relaxed">{code}</pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); toast({ title: "✅ تم النسخ" }); }}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── PWA Checks ─────────────────────────────────────────────────────────────

function usePWAChecks() {
  const [checks, setChecks] = useState<CheckItem[]>([]);

  useEffect(() => {
    const run = async () => {
      const isHttps = location.protocol === "https:" || location.hostname === "localhost";
      let hasManifest = false;
      let hasSW = false;
      let hasIcon512 = false;
      let hasScreenshots = false;

      // Check manifest
      try {
        const r = await fetch("/manifest.json");
        if (r.ok) {
          const m = await r.json();
          hasManifest = true;
          hasIcon512 = m.icons?.some((ic: any) => ic.sizes?.includes("512x512")) ?? false;
          hasScreenshots = (m.screenshots?.length ?? 0) >= 1;
        }
      } catch {}

      // Check SW
      hasSW = "serviceWorker" in navigator;
      if (hasSW) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          hasSW = regs.length > 0;
        } catch {}
      }

      setChecks([
        {
          id: "https", label: "بروتوكول HTTPS آمن", description: "الموقع يجب أن يعمل على HTTPS لتشغيل PWA",
          status: isHttps ? "pass" : "fail", detail: isHttps ? `البروتوكول: ${location.protocol}` : "الموقع لا يعمل على HTTPS",
        },
        {
          id: "manifest", label: "ملف الـ Manifest", description: "يحتوي على معلومات التطبيق، الأيقونات، والألوان",
          status: hasManifest ? "pass" : "fail", detail: hasManifest ? "/manifest.json موجود ✓" : "manifest.json غير موجود",
          link: "/manifest.json",
        },
        {
          id: "sw", label: "Service Worker", description: "يتيح العمل بلا إنترنت وتحميل الموارد المؤقتة",
          status: hasSW ? "pass" : "warn", detail: hasSW ? "Service Worker مسجّل ✓" : "لم يُسجَّل Service Worker بعد — قد يظهر بعد أول زيارة",
        },
        {
          id: "icons", label: "أيقونة 512×512", description: "مطلوبة لمتجر Google Play وشاشة التثبيت",
          status: hasIcon512 ? "pass" : "fail", detail: hasIcon512 ? "أيقونة 512×512 موجودة ✓" : "الأيقونة 512×512 غير موجودة",
        },
        {
          id: "screenshots", label: "لقطات شاشة في Manifest", description: "مطلوبة لنافذة تثبيت PWA الغنية",
          status: hasScreenshots ? "pass" : "warn", detail: hasScreenshots ? "لقطات شاشة معرّفة ✓" : "لم يُعرَّف لقطات شاشة في manifest.json",
        },
        {
          id: "installable", label: "قابل للتثبيت (Installable)", description: "متطلبات تثبيت PWA على الجهاز مكتملة",
          status: hasManifest && hasSW && isHttps && hasIcon512 ? "pass" : "warn",
          detail: hasManifest && hasSW && isHttps && hasIcon512 ? "التطبيق جاهز للتثبيت كـ PWA ✓" : "أكمل المتطلبات أعلاه أولاً",
        },
      ]);
    };
    run();
  }, []);

  return checks;
}

// ─── Google Play section ─────────────────────────────────────────────────────

const GOOGLE_REQUIREMENTS: CheckItem[] = [
  { id: "g1", label: "حساب Google Play Console", description: "رسوم تسجيل لمرة واحدة: 25 دولار", status: "fail", detail: "يجب إنشاء حساب مطور على Google Play Console", link: "https://play.google.com/console" },
  { id: "g2", label: "أيقونة التطبيق (512×512 PNG)", description: "أيقونة عالية الجودة لصفحة التطبيق في المتجر", status: "pass", detail: "/images/icon-512.png موجودة ✓" },
  { id: "g3", label: "صورة الغلاف (Feature Graphic) 1024×500", description: "صورة تظهر في أعلى صفحة التطبيق في المتجر", status: "warn", detail: "يجب تصميم صورة 1024×500 بكسل لصفحة المتجر" },
  { id: "g4", label: "لقطات شاشة الهاتف (2-8 صور)", description: "أبعاد: عرض 1080×1920 أو 1080×2340 كحد أدنى", status: "warn", detail: "التقط 4-6 لقطات شاشة من الهاتف وارفعها" },
  { id: "g5", label: "وصف التطبيق المختصر (80 حرفاً)", description: "وصف قصير يظهر في نتائج البحث", status: "warn", detail: "اكتب وصفاً مختصراً للجمعية بحد أقصى 80 حرف" },
  { id: "g6", label: "وصف التطبيق الكامل (4000 حرف)", description: "وصف تفصيلي لمميزات التطبيق", status: "warn", detail: "اكتب وصفاً شاملاً بالعربية لجميع خدمات الجمعية" },
  { id: "g7", label: "سياسة الخصوصية", description: "رابط لسياسة الخصوصية مطلوب إلزامياً", status: "pass", detail: "متوفرة على /privacy-policy", link: "/privacy-policy" },
  { id: "g8", label: "تصنيف المحتوى (Content Rating)", description: "إجابة على استبيان تصنيف المحتوى في Play Console", status: "fail", detail: "يجب إكمال استبيان تصنيف المحتوى في Play Console" },
  { id: "g9", label: "12 مختبر + 14 يوم اختبار مغلق", description: "متطلب لطلب الوصول للإنتاج في Google Play", status: "fail", detail: "أنشئ مسار Closed Testing وادعُ 12 مختبراً على الأقل" },
  { id: "g10", label: "ملف assetlinks.json", description: "يربط تطبيق Android بنطاق الموقع للـ TWA", status: "fail", detail: "يُنشَأ تلقائياً عبر أداة Bubblewrap" },
];

const APPLE_REQUIREMENTS: CheckItem[] = [
  { id: "a1", label: "حساب Apple Developer ($99/سنة)", description: "اشتراك سنوي لنشر التطبيقات على App Store", status: "fail", detail: "سجّل في Apple Developer Program", link: "https://developer.apple.com/programs/" },
  { id: "a2", label: "جهاز Mac + Xcode", description: "مطلوب لبناء ورفع التطبيق إلى App Store", status: "warn", detail: "Xcode مجاني من App Store على Mac" },
  { id: "a3", label: "أيقونات iOS (20px إلى 1024px)", description: "مجموعة أيقونات بأحجام مختلفة لكل الأجهزة", status: "warn", detail: "يمكن توليدها من أيقونة 1024×1024 واحدة" },
  { id: "a4", label: "لقطات شاشة iPhone 6.7 بوصة", description: "1290×2796 بكسل — 2 صور على الأقل", status: "warn", detail: "استخدم Xcode Simulator لالتقاط اللقطات" },
  { id: "a5", label: "لقطات شاشة iPad 12.9 بوصة", description: "2048×2732 بكسل — مطلوب لدعم iPad", status: "warn", detail: "استخدم iPad Simulator في Xcode" },
  { id: "a6", label: "وصف التطبيق", description: "حتى 4000 حرف — يظهر في صفحة التطبيق", status: "warn", detail: "اكتب وصفاً شاملاً بالعربية لجمعية طويق" },
  { id: "a7", label: "كلمات البحث (Keywords)", description: "100 حرف — تؤثر على ظهور التطبيق في البحث", status: "warn", detail: "مثال: تبرع، جمعية خيرية، كفالة يتيم، زكاة، صدقة" },
  { id: "a8", label: "سياسة الخصوصية", description: "رابط مطلوب إلزامياً من Apple", status: "pass", detail: "متوفرة على /privacy-policy", link: "/privacy-policy" },
  { id: "a9", label: "Apple-specific Meta Tags", description: "وسوم HTML لدعم تثبيت PWA على iOS", status: "warn", detail: "apple-mobile-web-app-capable و apple-touch-icon" },
  { id: "a10", label: "مراجعة App Review (7-14 يوم)", description: "يراجع فريق Apple التطبيق قبل النشر", status: "fail", detail: "المراجعة تستغرق 1-7 أيام عادةً، وقد تمتد" },
];

function scoreOf(items: CheckItem[]) {
  const pass = items.filter(i => i.status === "pass").length;
  return Math.round((pass / items.length) * 100);
}

// ─── App Files Upload Panel ──────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadCard({
  platform, label, icon: Icon, accent, accept, fileInfo, onUploadDone,
}: {
  platform: "android" | "ios";
  label: string;
  icon: React.ComponentType<any>;
  accent: string;
  accept: string;
  fileInfo: any;
  onUploadDone: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/app-files/upload", { method: "POST", body: fd, credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      toast({ title: `✅ تم رفع ${label} بنجاح`, description: `الحجم: ${formatBytes(json.size)}` });
      qc.invalidateQueries({ queryKey: ["/api/app-files/info"] });
      onUploadDone();
    } catch (e: any) {
      toast({ title: "خطأ في الرفع", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/app-files/${platform}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message);
    },
    onSuccess: () => {
      toast({ title: "تم الحذف" });
      qc.invalidateQueries({ queryKey: ["/api/app-files/info"] });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <Card className={cn("overflow-hidden border-2 transition-all", dragging ? "border-dashed scale-[1.01]" : "border-transparent")}
      style={{ borderColor: dragging ? accent : undefined }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="w-5 h-5" style={{ color: accent }} />
            {label}
          </CardTitle>
          {fileInfo?.exists && (
            <a href={`/api/app-files/download/${platform}`} download>
              <Button size="sm" variant="outline" className="h-7 px-3 text-xs gap-1.5" data-testid={`btn-download-${platform}`}>
                <Download className="w-3.5 h-3.5" />تحميل
              </Button>
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {fileInfo?.exists ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + "20" }}>
              <HardDrive className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{fileInfo.filename}</p>
              <p className="text-xs text-gray-500">
                {formatBytes(fileInfo.size)} · {new Date(fileInfo.uploadedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
              onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending} data-testid={`btn-delete-${platform}`}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-dashed border-gray-200">
            <XCircle className="w-5 h-5 text-gray-300 shrink-0" />
            <p className="text-xs text-gray-400">لم يُرفع ملف بعد</p>
          </div>
        )}

        <div
          className={cn("relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all",
            dragging ? "bg-emerald-50 border-emerald-400" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          data-testid={`dropzone-${platform}`}
        >
          <input ref={inputRef} type="file" accept={accept} className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: accent, borderTopColor: "transparent" }} />
              <p className="text-xs text-gray-500">جارٍ الرفع...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-300" />
              <p className="text-sm font-bold text-gray-600">اسحب الملف هنا أو اضغط للاختيار</p>
              <p className="text-xs text-gray-400">{accept.split(",").join(" / ")} — بحد أقصى 200 ميغابايت</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AppFilesUploadPanel() {
  const { data: fileInfo, refetch } = useQuery<{ android: any; ios: any }>({
    queryKey: ["/api/app-files/info"],
  });

  return (
    <div className="space-y-4">
      <Card className="border-emerald-200 bg-emerald-50/60">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-3">
            <CloudUpload className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 text-sm">كيف يعمل النظام؟</p>
              <ol className="text-emerald-800 text-xs mt-1.5 space-y-1 list-decimal list-inside leading-relaxed">
                <li>أنشئ ملف APK (Android) من <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">pwabuilder.com</a> باستخدام رابط الموقع المنشور</li>
                <li>أنشئ ملف IPA (iOS) من Xcode باستخدام WKWebView أو Capacitor على جهاز Mac</li>
                <li>ارفع الملفين هنا — سيظهران فوراً في لوحة الموظفين للتحميل</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UploadCard
          platform="android"
          label="تطبيق Android (APK / AAB)"
          icon={SiGoogleplay as any}
          accent="#01875f"
          accept=".apk,.aab"
          fileInfo={fileInfo?.android}
          onUploadDone={refetch}
        />
        <UploadCard
          platform="ios"
          label="تطبيق iOS (IPA)"
          icon={Apple}
          accent="#555555"
          accept=".ipa"
          fileInfo={fileInfo?.ios}
          onUploadDone={refetch}
        />
      </div>

      <Card className="border-amber-200 bg-amber-50/60">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-sm">ملاحظة مهمة</p>
              <p className="text-amber-700 text-xs mt-1">
                ملفات APK المثبّتة مباشرة (خارج متجر Play) تتطلب تفعيل "السماح بمصادر غير معروفة" في إعدادات الجهاز.
                يُنصح برفع ملف AAB على Google Play Console للنشر الرسمي.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminAppStore() {
  const { toast } = useToast();
  const pwaChecks = usePWAChecks();
  const pwaScore = scoreOf(pwaChecks);
  const googleScore = scoreOf(GOOGLE_REQUIREMENTS);
  const appleScore = scoreOf(APPLE_REQUIREMENTS);

  const SHORT_DESC = "جمعية طويق الإنسانية — تبرع وكفل حاجاً أو يتيماً أو أسرة محتاجة من خلال تطبيق آمن ومرخص.";
  const LONG_DESC = `جمعية طويق للخدمات الإنسانية جمعية أهلية غير ربحية مرخصة في المملكة العربية السعودية برقم تسجيل 1000820300.

🕋 كفالة الحاج — ساعد حاجاً في أداء فريضة الحج بباقات تبدأ من 500 ريال.
👨‍👩‍👧 كفالة الأسر — ادعم الأسر المحتاجة من أرامل ومطلقات وأيتام.
🌱 كفالة اليتيم — أنت وكافل اليتيم كهاتين في الجنة.
💛 تفريج الكربة — فرّج كربة أخيك ويفرّج الله كربتك يوم القيامة.

مميزات التطبيق:
• تبرع آمن عبر بوابات دفع معتمدة (مصرف الراجحي)
• متابعة أثر تبرعاتك ومشاريع الجمعية
• شهادات تبرع رسمية
• استفسار عن الزكاة والصدقة
• تسجيل الحالات الإنسانية
• إشعارات فورية بالمشاريع الجديدة

الجمعية مرخصة من وزارة الموارد البشرية والتنمية الاجتماعية في المملكة العربية السعودية.`;
  const KEYWORDS = "تبرع،جمعية خيرية،كفالة يتيم،زكاة،صدقة،إنسانية،حاج،أسرة،كربة،Tuwaiq,charity,donation,zakat";

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `✅ تم نسخ ${label}` });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <MonitorSmartphone className="w-5 h-5" style={{ color: "hsl(152 42% 28%)" }} />
          <h1 className="font-black text-lg" style={{ color: "hsl(152 42% 28%)" }}>نشر التطبيق في متاجر التطبيقات</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">

        {/* Score overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "PWA جاهزية", score: pwaScore, icon: Zap, color: "hsl(152 42% 28%)" },
            { label: "Google Play", score: googleScore, icon: SiGoogleplay as any, color: "#01875f" },
            { label: "Apple App Store", score: appleScore, icon: Apple, color: "#555" },
          ].map(({ label, score, icon: Icon, color }) => (
            <Card key={label} className="text-center">
              <CardContent className="pt-5 pb-4">
                <Icon className="w-8 h-8 mx-auto mb-2" style={{ color }} />
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-black mb-2" style={{ color }}>{score}%</p>
                <Progress value={score} className="h-2" />
                <p className="text-[10px] text-gray-400 mt-1">
                  {score < 40 ? "يحتاج عمل كثير" : score < 70 ? "جيد — أكمل الباقي" : score < 100 ? "تقريباً جاهز" : "مكتمل ✓"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="files" dir="rtl">
          <TabsList className="w-full grid grid-cols-4 h-10">
            <TabsTrigger value="files" className="text-xs font-bold gap-1.5"><CloudUpload className="w-3.5 h-3.5" />ملفات التطبيق</TabsTrigger>
            <TabsTrigger value="pwa" className="text-xs font-bold gap-1.5"><Zap className="w-3.5 h-3.5" />PWA جاهزية</TabsTrigger>
            <TabsTrigger value="google" className="text-xs font-bold gap-1.5"><SiGoogleplay className="w-3.5 h-3.5" />Google Play</TabsTrigger>
            <TabsTrigger value="apple" className="text-xs font-bold gap-1.5"><Apple className="w-3.5 h-3.5" />App Store</TabsTrigger>
          </TabsList>

          {/* ── Files Upload Tab ── */}
          <TabsContent value="files" className="mt-4 space-y-4">
            <AppFilesUploadPanel />
          </TabsContent>

          {/* ── PWA Tab ── */}
          <TabsContent value="pwa" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">فحص جاهزية PWA</CardTitle>
                <CardDescription>التطبيق يعمل كـ Progressive Web App مما يتيح نشره في المتاجر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {pwaChecks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">جارٍ الفحص...</div>
                ) : (
                  pwaChecks.map(c => <CheckRow key={c.id} item={c} />)
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Apple-specific Meta Tags</CardTitle>
                <CardDescription>أضفها في index.html لتحسين تجربة iOS</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`<!-- في <head> داخل client/index.html -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="طويق">
<link rel="apple-touch-icon" href="/images/icon-192.png">
<link rel="apple-touch-icon" sizes="152x152" href="/images/icon-152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/images/icon-192.png">
<link rel="apple-touch-icon" sizes="167x167" href="/images/icon-192.png">`} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Google Play Tab ── */}
          <TabsContent value="google" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><SiGoogleplay className="w-5 h-5 text-[#01875f]" />متطلبات Google Play Store</CardTitle>
                <CardDescription>يتم النشر عبر TWA (Trusted Web Activity) — تطبيق Android يعرض موقعك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {GOOGLE_REQUIREMENTS.map(c => <CheckRow key={c.id} item={c} />)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">خطوات بناء APK بـ Bubblewrap</CardTitle>
                <CardDescription>Bubblewrap هي أداة Google الرسمية لتحويل PWA إلى تطبيق Android</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <StepCard num={1} title="تثبيت Node.js و Bubblewrap" done>
                  <CodeBlock code={`# تثبيت Bubblewrap CLI
npm install -g @bubblewrap/cli

# تحقق من التثبيت
bubblewrap --version`} />
                </StepCard>

                <StepCard num={2} title="إنشاء مشروع TWA">
                  <p className="text-gray-600 text-xs mb-2">شغّل الأمر أدناه في مجلد جديد وأدخل بيانات موقعك:</p>
                  <CodeBlock code={`mkdir tuwaiq-android && cd tuwaiq-android
bubblewrap init --manifest https://YOUR_DOMAIN.replit.app/manifest.json`} />
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                    💡 استبدل <strong>YOUR_DOMAIN</strong> بنطاق موقعك المنشور
                  </div>
                </StepCard>

                <StepCard num={3} title="بناء ملف APK">
                  <CodeBlock code={`# بناء التطبيق (يستغرق 5-10 دقائق أول مرة)
bubblewrap build

# ستجد الملفات في:
# app-release-signed.apk  ← للتثبيت المباشر
# app-release-bundle.aab  ← لرفعه على Google Play`} />
                </StepCard>

                <StepCard num={4} title="إضافة ملف التحقق assetlinks.json">
                  <p className="text-xs text-gray-600 mb-2">بعد إنشاء التطبيق، أضف هذا الملف على الخادم:</p>
                  <CodeBlock code={`# المسار: server/public/.well-known/assetlinks.json
# أو أضفه كـ route في server/routes.ts:

app.get('/.well-known/assetlinks.json', (req, res) => {
  res.json([{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.tuwaiq.app",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
    }
  }]);
});`} />
                </StepCard>

                <StepCard num={5} title="رفع AAB على Google Play Console">
                  <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
                    <li>افتح <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Play Console</a></li>
                    <li>أنشئ تطبيقاً جديداً باسم "جمعية طويق"</li>
                    <li>أكمل معلومات المتجر (الوصف، الأيقونة، لقطات الشاشة)</li>
                    <li>ارفع ملف <code className="bg-gray-100 px-1 rounded">.aab</code> في Internal Testing أولاً</li>
                    <li>ادعُ 12 مختبراً وانتظر 14 يوماً للحصول على Production Access</li>
                  </ul>
                </StepCard>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />نصوص المتجر جاهزة للنسخ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-600">الوصف المختصر (80 حرفاً)</p>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => copy(SHORT_DESC, "الوصف المختصر")}>
                      <Copy className="w-3 h-3 ml-1" />نسخ
                    </Button>
                  </div>
                  <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-800">{SHORT_DESC}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-600">الوصف الكامل</p>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => copy(LONG_DESC, "الوصف الكامل")}>
                      <Copy className="w-3 h-3 ml-1" />نسخ
                    </Button>
                  </div>
                  <div className="bg-gray-50 border rounded-lg p-3 text-xs text-gray-700 whitespace-pre-line max-h-48 overflow-y-auto">{LONG_DESC}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-600">كلمات البحث (Keywords)</p>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => copy(KEYWORDS, "الكلمات المفتاحية")}>
                      <Copy className="w-3 h-3 ml-1" />نسخ
                    </Button>
                  </div>
                  <div className="bg-gray-50 border rounded-lg p-3 text-xs text-gray-700">{KEYWORDS}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800 text-sm">متطلب 12 مختبر + 14 يوم</p>
                    <p className="text-amber-700 text-xs mt-1">
                      Google تشترط اختباراً مغلقاً (Closed Testing) بمشاركة 12 مختبراً على الأقل لمدة 14 يوماً قبل طلب الوصول للإنتاج.
                      ادعُ أصدقاء وموظفين لتجربة التطبيق في مرحلة الاختبار.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Apple Tab ── */}
          <TabsContent value="apple" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Apple className="w-5 h-5" />متطلبات Apple App Store</CardTitle>
                <CardDescription>يتم النشر كـ WKWebView App — تطبيق iOS يعرض موقعك بشكل كامل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {APPLE_REQUIREMENTS.map(c => <CheckRow key={c.id} item={c} />)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">خطوات بناء تطبيق iOS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StepCard num={1} title="إنشاء مشروع Xcode">
                  <p className="text-xs text-gray-600">في Xcode، أنشئ مشروع جديد نوع "App" وأضف WKWebView:</p>
                  <CodeBlock code={`// ViewController.swift
import WebKit

class ViewController: UIViewController {
    var webView: WKWebView!
    
    override func loadView() {
        let config = WKWebViewConfiguration()
        webView = WKWebView(frame: .zero, configuration: config)
        view = webView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        let url = URL(string: "https://YOUR_DOMAIN.replit.app")!
        webView.load(URLRequest(url: url))
    }
}`} />
                </StepCard>

                <StepCard num={2} title="توليد أيقونات iOS">
                  <p className="text-xs text-gray-600 mb-2">استخدم موقع <strong>appicon.co</strong> لتوليد جميع أحجام الأيقونات دفعة واحدة:</p>
                  <a href="https://www.appicon.co" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />افتح AppIcon.co
                    </Button>
                  </a>
                  <p className="text-xs text-gray-500 mt-2">ارفع أيقونة 1024×1024 وحمّل ملف AppIcon.appiconset الناتج</p>
                </StepCard>

                <StepCard num={3} title="التقاط لقطات الشاشة">
                  <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
                    <li>شغّل iPhone 15 Pro Max Simulator في Xcode</li>
                    <li>التقط 4-8 لقطات شاشة (⌘+S)</li>
                    <li>كرّر لـ iPad Pro 12.9" إذا أردت دعم iPad</li>
                    <li>الأبعاد المطلوبة: 1290×2796 للهاتف، 2048×2732 للـ iPad</li>
                  </ul>
                </StepCard>

                <StepCard num={4} title="رفع على App Store Connect">
                  <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
                    <li>افتح <a href="https://appstoreconnect.apple.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">App Store Connect</a></li>
                    <li>أنشئ تطبيقاً جديداً وأدخل جميع البيانات</li>
                    <li>ارفع ملف .ipa عبر Xcode Organizer أو Transporter</li>
                    <li>قدّم للمراجعة — تستغرق 1-7 أيام عادةً</li>
                  </ul>
                </StepCard>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />نصوص App Store جاهزة للنسخ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-600">اسم التطبيق (30 حرفاً)</p>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => copy("جمعية طويق الإنسانية", "اسم التطبيق")}>
                      <Copy className="w-3 h-3 ml-1" />نسخ
                    </Button>
                  </div>
                  <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-800">جمعية طويق الإنسانية</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-600">الوصف الترويجي (Promotional Text — 170 حرف)</p>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => copy(SHORT_DESC, "الوصف الترويجي")}>
                      <Copy className="w-3 h-3 ml-1" />نسخ
                    </Button>
                  </div>
                  <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-800">{SHORT_DESC}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-600">الوصف الكامل</p>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => copy(LONG_DESC, "الوصف الكامل")}>
                      <Copy className="w-3 h-3 ml-1" />نسخ
                    </Button>
                  </div>
                  <div className="bg-gray-50 border rounded-lg p-3 text-xs text-gray-700 whitespace-pre-line max-h-48 overflow-y-auto">{LONG_DESC}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-600">كلمات البحث (100 حرف)</p>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => copy(KEYWORDS, "الكلمات المفتاحية")}>
                      <Copy className="w-3 h-3 ml-1" />نسخ
                    </Button>
                  </div>
                  <div className="bg-gray-50 border rounded-lg p-3 text-xs text-gray-700">{KEYWORDS}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-800 text-sm">نصيحة: استخدم Capacitor بدلاً من Xcode يدوياً</p>
                    <p className="text-blue-700 text-xs mt-1">
                      Capacitor من Ionic يحوّل موقع الويب إلى تطبيق iOS/Android بكود أقل. يدعم كل ميزات الويب ويسهّل عملية البناء كثيراً.
                    </p>
                    <a href="https://capacitorjs.com/docs/getting-started" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="mt-2 text-xs bg-white gap-1.5">
                        <ExternalLink className="w-3 h-3" />تعرّف على Capacitor
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick links */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">روابط مفيدة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: "Google Play Console", url: "https://play.google.com/console", icon: SiGoogleplay as any, color: "#01875f" },
                { label: "App Store Connect", url: "https://appstoreconnect.apple.com", icon: Apple, color: "#555" },
                { label: "Bubblewrap (TWA Tool)", url: "https://github.com/GoogleChromeLabs/bubblewrap", icon: Package, color: "#1a73e8" },
                { label: "AppIcon Generator", url: "https://www.appicon.co", icon: Image, color: "#ff6b35" },
                { label: "PWA Builder (Microsoft)", url: "https://www.pwabuilder.com", icon: Globe, color: "#0078d4" },
                { label: "Capacitor (iOS + Android)", url: "https://capacitorjs.com", icon: Smartphone, color: "#119EFF" },
              ].map(({ label, url, icon: Icon, color }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 border rounded-xl hover:bg-gray-50 transition-colors group">
                  <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                  <span className="text-xs font-medium text-gray-700 flex-1">{label}</span>
                  <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
