import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2, Save, Eye, EyeOff, CheckCircle2, XCircle,
  AlertTriangle, Zap, Activity, TrendingUp, DollarSign,
  Phone, Mail, Clock, Target, Users, BarChart3,
  Wifi, WifiOff, RefreshCw, ArrowUpRight, ShieldCheck,
  MousePointerClick, Megaphone, Link2,
} from "lucide-react";
import { SiMeta, SiSnapchat, SiTiktok, SiInstagram } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const METHOD_LABEL: Record<string, string> = {
  online: "دفع إلكتروني",
  rajhi: "الراجحي",
  bank_transfer: "تحويل بنكي",
  cash: "نقدي",
};
const METHOD_COLOR: Record<string, string> = {
  online: "bg-blue-100 text-blue-700 border-blue-200",
  rajhi: "bg-emerald-100 text-emerald-700 border-emerald-200",
  bank_transfer: "bg-amber-100 text-amber-700 border-amber-200",
  cash: "bg-slate-100 text-slate-700 border-slate-200",
};
const STATUS_LABEL: Record<string, string> = {
  confirmed: "مؤكد", success: "مؤكد", pending: "قيد المراجعة", failed: "فشل",
};
const STATUS_COLOR: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

type Platform = "facebook" | "snapchat" | "tiktok";

interface PlatformCardProps {
  name: string;
  subtitle?: string;
  icon: any;
  iconColor: string;
  bgFrom: string;
  pixelId?: string;
  hasToken?: boolean;
  active: boolean;
  onConfigure: () => void;
  isConfiguring: boolean;
  linked?: { label: string; icon: any };
}

function PlatformCard({
  name, subtitle, icon: Icon, iconColor, pixelId, hasToken, active, onConfigure, isConfiguring, linked,
}: PlatformCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all cursor-default ${
      isConfiguring
        ? "border-primary/40 bg-primary/5 shadow-md"
        : active
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white shadow-md shadow-emerald-100"
          : "border-border/50 bg-muted/20"
    }`}>
      {active && <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${iconColor}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="font-black text-sm">{name}</p>
            {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
            <div className="flex items-center gap-1.5 mt-0.5">
              {active ? (
                <><Wifi className="h-3 w-3 text-emerald-500" /><span className="text-xs font-bold text-emerald-600">نشط</span></>
              ) : (
                <><WifiOff className="h-3 w-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">غير مُفعَّل</span></>
              )}
              {linked && (
                <span className="flex items-center gap-1 text-[10px] bg-violet-100 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5 font-bold">
                  <Link2 className="h-2.5 w-2.5" />
                  {linked.label}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant={isConfiguring ? "default" : active ? "outline" : "default"}
          className="gap-1.5 shrink-0"
          onClick={onConfigure}
          data-testid={`button-configure-${name}`}
        >
          {isConfiguring ? <RefreshCw className="h-3 w-3" /> : active ? <RefreshCw className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
          {isConfiguring ? "إغلاق" : active ? "تعديل" : "تفعيل"}
        </Button>
      </div>

      {active && pixelId && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium w-16 shrink-0">Pixel ID:</span>
            <code className="bg-white border border-border/60 rounded px-2 py-0.5 font-mono text-xs flex-1 truncate">{pixelId}</code>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium w-16 shrink-0">CAPI:</span>
            {hasToken ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="h-3.5 w-3.5" />مُفعَّل ✓</span>
            ) : (
              <span className="flex items-center gap-1 text-red-500"><XCircle className="h-3.5 w-3.5" />غير مُعيَّن</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigPanel({
  title, icon: Icon, iconClass, fields, onSave, onCancel, isSaving, canSave,
}: {
  title: string; icon: any; iconClass: string;
  fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  onSave: () => void; onCancel: () => void;
  isSaving: boolean; canSave: boolean;
  helpText?: { title: string; lines: string[] };
}) {
  return null; // handled inline below
}

export default function AdminTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [configuring, setConfiguring] = useState<Platform | null>(null);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [fbForm, setFbForm] = useState({ facebookPixelId: "", facebookCAPIToken: "" });
  const [snapForm, setSnapForm] = useState({ snapchatPixelId: "", snapchatCAPIToken: "" });
  const [tiktokForm, setTiktokForm] = useState({ tiktokPixelId: "", tiktokCAPIToken: "" });
  const [donorSearch, setDonorSearch] = useState("");

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings", { credentials: "include" });
      return res.ok ? res.json() : {};
    },
  });

  const { data: donations = [], isLoading: donationsLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/admin/donations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/donations?limit=200", { credentials: "include" });
      return res.ok ? res.json() : [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "✓ تم حفظ إعدادات التتبع" });
      setConfiguring(null);
    },
    onError: () => toast({ title: "خطأ في الحفظ", variant: "destructive" }),
  });

  const toggleToken = (key: string) => setShowTokens((p) => ({ ...p, [key]: !p[key] }));
  const openConfig = (p: Platform) => {
    if (configuring === p) { setConfiguring(null); return; }
    if (p === "facebook") setFbForm({ facebookPixelId: settings?.facebookPixelId || "", facebookCAPIToken: settings?.facebookCAPIToken || "" });
    if (p === "snapchat") setSnapForm({ snapchatPixelId: settings?.snapchatPixelId || "", snapchatCAPIToken: settings?.snapchatCAPIToken || "" });
    if (p === "tiktok") setTiktokForm({ tiktokPixelId: settings?.tiktokPixelId || "", tiktokCAPIToken: settings?.tiktokCAPIToken || "" });
    setConfiguring(p);
  };

  const fbActive = !!settings?.facebookPixelId;
  const snapActive = !!settings?.snapchatPixelId;
  const tiktokActive = !!settings?.tiktokPixelId;

  const confirmed = donations.filter((d) => d.status === "confirmed" || d.status === "success");
  const totalRev = confirmed.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const onlineRev = confirmed.filter((d) => d.paymentMethod === "online" || d.paymentMethod === "rajhi")
    .reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const today = confirmed.filter((d) => {
    const date = new Date(d.createdAt || Date.now());
    return date.toDateString() === new Date().toDateString();
  });

  const filtered = donorSearch
    ? donations.filter((d) =>
        d.donorName?.toLowerCase().includes(donorSearch.toLowerCase()) ||
        d.mobile?.includes(donorSearch) ||
        d.email?.toLowerCase().includes(donorSearch.toLowerCase())
      )
    : donations.slice(0, 60);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-md">
                <MousePointerClick className="h-4 w-4 text-white" />
              </div>
              التتبع الإعلاني وتحليل العملاء
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Browser Pixel + Server-Side CAPI — كل منصة تُرسَل لها الأحداث بدون تعارض</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" />تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي التبرعات المؤكدة", value: `${totalRev.toLocaleString("ar-SA")} ر.س`, icon: DollarSign, gradient: "from-emerald-500 to-emerald-700" },
          { label: "من الدفع الإلكتروني", value: `${onlineRev.toLocaleString("ar-SA")} ر.س`, icon: TrendingUp, gradient: "from-blue-500 to-blue-700" },
          { label: "تحويلات اليوم", value: today.length, icon: Clock, gradient: "from-violet-500 to-violet-700" },
          { label: "إجمالي التحويلات", value: confirmed.length, icon: Target, gradient: "from-rose-500 to-rose-700" },
        ].map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${s.gradient} text-white shadow-md`}>
            <div className="absolute -left-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[10px] font-bold leading-tight">{s.label}</p>
                <p className="text-xl font-black mt-1">{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="h-4 w-4 text-primary" />
          <h2 className="font-black text-sm">منصات الإعلان</h2>
          <Badge variant="outline" className="text-[10px]">Browser Pixel + Server CAPI</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <PlatformCard
            name="Meta / Facebook"
            subtitle="Facebook Ads + Instagram Ads"
            icon={SiMeta}
            iconColor="bg-[#1877F2] text-white"
            bgFrom="from-blue-50"
            pixelId={settings?.facebookPixelId}
            hasToken={!!settings?.facebookCAPIToken}
            active={fbActive}
            onConfigure={() => openConfig("facebook")}
            isConfiguring={configuring === "facebook"}
          />
          <PlatformCard
            name="Instagram Ads"
            subtitle="يعمل تلقائياً مع Facebook Pixel"
            icon={SiInstagram}
            iconColor="bg-gradient-to-br from-pink-500 to-violet-600 text-white"
            bgFrom="from-pink-50"
            pixelId={fbActive ? settings?.facebookPixelId : undefined}
            hasToken={!!settings?.facebookCAPIToken}
            active={fbActive}
            onConfigure={() => openConfig("facebook")}
            isConfiguring={configuring === "facebook"}
            linked={{ label: "مرتبط بـ Facebook", icon: SiMeta }}
          />
          <PlatformCard
            name="Snapchat"
            icon={SiSnapchat}
            iconColor="bg-[#FFFC00] text-black"
            bgFrom="from-yellow-50"
            pixelId={settings?.snapchatPixelId}
            hasToken={!!settings?.snapchatCAPIToken}
            active={snapActive}
            onConfigure={() => openConfig("snapchat")}
            isConfiguring={configuring === "snapchat"}
          />
          <PlatformCard
            name="TikTok"
            icon={SiTiktok}
            iconColor="bg-black text-white"
            bgFrom="from-slate-50"
            pixelId={settings?.tiktokPixelId}
            hasToken={!!settings?.tiktokCAPIToken}
            active={tiktokActive}
            onConfigure={() => openConfig("tiktok")}
            isConfiguring={configuring === "tiktok"}
          />
        </div>

        {/* Instagram note */}
        <div className="mt-3 flex items-start gap-2 text-xs text-violet-800 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
          <SiInstagram size={14} className="text-violet-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Instagram Ads — لا يحتاج إعداداً منفصلاً</p>
            <p className="text-violet-600">إعلانات إنستغرام تستخدم نفس Facebook Pixel تماماً. بمجرد تفعيل Meta Pixel، تبدأ إنستغرام تلقائياً في تتبع التحويلات وإرسال أحداث CAPI.</p>
          </div>
        </div>

        {!fbActive && !snapActive && !tiktokActive && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div>
              <p className="font-bold">لم يتم تفعيل أي منصة بعد</p>
              <p className="text-amber-600">اضغط "تفعيل" على أي منصة وأدخل الـ Pixel ID + CAPI Token لبدء التتبع.</p>
            </div>
          </div>
        )}
      </div>

      {/* Config Panels */}
      {configuring === "facebook" && (
        <div className="rounded-2xl border-2 border-[#1877F2]/30 bg-blue-50/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <SiMeta size={18} className="text-[#1877F2]" />
            <h3 className="font-black text-sm text-[#1877F2]">إعداد Meta Pixel (Facebook + Instagram)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Facebook Pixel ID</Label>
              <Input value={fbForm.facebookPixelId} onChange={(e) => setFbForm({ ...fbForm, facebookPixelId: e.target.value })}
                placeholder="123456789012345" dir="ltr" className="font-mono bg-white" data-testid="input-fb-pixel-id" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">CAPI Access Token</Label>
              <div className="relative">
                <Input type={showTokens.fb ? "text" : "password"} value={fbForm.facebookCAPIToken}
                  onChange={(e) => setFbForm({ ...fbForm, facebookCAPIToken: e.target.value })}
                  placeholder="EAAxxxxxx..." dir="ltr" className="font-mono bg-white pl-10" data-testid="input-fb-capi-token" />
                <button type="button" onClick={() => toggleToken("fb")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showTokens.fb ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
            <p className="font-bold">من أين تحصل على البيانات؟</p>
            <p>Pixel ID: Business Manager → Events Manager → الـ Pixel الخاص بك</p>
            <p>Token: Events Manager → Settings → Conversions API → Generate Access Token</p>
            <p className="text-blue-700 font-medium mt-1">✓ نفس الـ Pixel يغطي Facebook + Instagram تلقائياً</p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2 bg-[#1877F2] hover:bg-[#1566d3]"
              onClick={() => saveMutation.mutate(fbForm)}
              disabled={saveMutation.isPending || !fbForm.facebookPixelId} data-testid="button-save-fb">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setConfiguring(null)}>إلغاء</Button>
          </div>
        </div>
      )}

      {configuring === "snapchat" && (
        <div className="rounded-2xl border-2 border-yellow-400/50 bg-yellow-50/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <SiSnapchat size={18} className="text-yellow-600" />
            <h3 className="font-black text-sm text-yellow-700">إعداد Snapchat Pixel</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Snapchat Pixel ID</Label>
              <Input value={snapForm.snapchatPixelId} onChange={(e) => setSnapForm({ ...snapForm, snapchatPixelId: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" dir="ltr" className="font-mono bg-white" data-testid="input-snap-pixel-id" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">CAPI Bearer Token</Label>
              <div className="relative">
                <Input type={showTokens.snap ? "text" : "password"} value={snapForm.snapchatCAPIToken}
                  onChange={(e) => setSnapForm({ ...snapForm, snapchatCAPIToken: e.target.value })}
                  placeholder="Bearer token من Snap Ads Manager" dir="ltr" className="font-mono bg-white pl-10" data-testid="input-snap-capi-token" />
                <button type="button" onClick={() => toggleToken("snap")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showTokens.snap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 space-y-1">
            <p className="font-bold">من أين تحصل على البيانات؟</p>
            <p>Pixel ID: Snap Ads Manager → Assets → Pixels</p>
            <p>Token: نفس الصفحة → Conversions API → Generate Token</p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => saveMutation.mutate(snapForm)}
              disabled={saveMutation.isPending || !snapForm.snapchatPixelId} data-testid="button-save-snap">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setConfiguring(null)}>إلغاء</Button>
          </div>
        </div>
      )}

      {configuring === "tiktok" && (
        <div className="rounded-2xl border-2 border-slate-400/30 bg-slate-50/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <SiTiktok size={18} className="text-black" />
            <h3 className="font-black text-sm">إعداد TikTok Pixel</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">TikTok Pixel Code (Pixel ID)</Label>
              <Input value={tiktokForm.tiktokPixelId} onChange={(e) => setTiktokForm({ ...tiktokForm, tiktokPixelId: e.target.value })}
                placeholder="CXXXXXXXXXXXXXXXX" dir="ltr" className="font-mono bg-white" data-testid="input-tiktok-pixel-id" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Events API Access Token</Label>
              <div className="relative">
                <Input type={showTokens.tiktok ? "text" : "password"} value={tiktokForm.tiktokCAPIToken}
                  onChange={(e) => setTiktokForm({ ...tiktokForm, tiktokCAPIToken: e.target.value })}
                  placeholder="Access token من TikTok Events Manager" dir="ltr" className="font-mono bg-white pl-10" data-testid="input-tiktok-capi-token" />
                <button type="button" onClick={() => toggleToken("tiktok")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showTokens.tiktok ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 space-y-1">
            <p className="font-bold">من أين تحصل على البيانات؟</p>
            <p>Pixel ID: TikTok Ads Manager → Assets → Events → Web Events → الـ Pixel الخاص بك (Pixel Code)</p>
            <p>Access Token: نفس الصفحة → Settings → Generate Access Token</p>
            <p className="text-slate-600 font-medium mt-1">الحدث المرسَل: <code className="bg-slate-200 px-1 rounded">CompletePayment</code> (مكافئ Purchase)</p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2 bg-black hover:bg-slate-800 text-white"
              onClick={() => saveMutation.mutate(tiktokForm)}
              disabled={saveMutation.isPending || !tiktokForm.tiktokPixelId} data-testid="button-save-tiktok">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setConfiguring(null)}>إلغاء</Button>
          </div>
        </div>
      )}

      {/* How it works */}
      <Card className="border-border/50 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            كيف يعمل التتبع؟ — مزدوج ومضمون بدون تكرار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            {[
              "المتبرع يُكمل الدفع",
              "الراجحي يُرسل تأكيداً للسيرفر",
              "السيرفر يُرسل CAPI لكل منصة (SHA-256)",
              "المتصفح يُطلق Pixel من جانب العميل",
              "كل منصة تحسب تحويلاً واحداً فقط بـ Deduplication",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</div>
                <span className="font-medium">{step}</span>
                {i < 4 && <ArrowUpRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-500" />إذا لم يصل الـ Callback — يُسترد تلقائياً كل 10 دقائق</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-500" />الجلسة لا تنتهي (30 يوم متجدد)</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-500" />فشل CAPI لا يوقف التأكيد</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Donor Journey */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-black text-sm">رحلة العملاء والمتبرعين</h2>
            <Badge variant="outline" className="text-[10px]">{donations.length} عملية</Badge>
          </div>
          <div className="relative w-64">
            <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="بحث..." value={donorSearch} onChange={(e) => setDonorSearch(e.target.value)}
              className="pr-9 h-9 text-sm" data-testid="input-search-donors" />
          </div>
        </div>

        {donationsLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((d: any) => {
              const isConfirmed = d.status === "confirmed" || d.status === "success";
              const isOnline = d.paymentMethod === "online" || d.paymentMethod === "rajhi";
              const date = d.createdAt ? new Date(d.createdAt) : null;
              return (
                <div key={d.id} className={`flex items-center gap-4 p-4 rounded-2xl border bg-card transition-all hover:shadow-sm hover:-translate-y-px ${isConfirmed ? "border-emerald-100 hover:border-emerald-200" : "border-border/40"}`}
                  data-testid={`row-donation-${d.id}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0 ${isConfirmed ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : "bg-gradient-to-br from-slate-400 to-slate-600"}`}>
                    {(d.donorName || "؟")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">{d.donorName || "—"}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLOR[d.status] || "bg-muted text-muted-foreground border-border"}`}>
                        {STATUS_LABEL[d.status] || d.status}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${METHOD_COLOR[d.paymentMethod] || "bg-muted text-muted-foreground border-border"}`}>
                        {METHOD_LABEL[d.paymentMethod] || d.paymentMethod || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      {d.mobile && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{d.mobile}</span>}
                      {d.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{d.email}</span>}
                      {d.type && <span className="text-xs text-muted-foreground">{d.type}</span>}
                      {date && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{format(date, "d MMM yyyy — HH:mm", { locale: ar })}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className={`text-base font-black ${isConfirmed ? "text-emerald-700" : "text-muted-foreground"}`}>
                      {Number(d.amount || 0).toLocaleString("ar-SA")} ر.س
                    </p>
                    {isConfirmed && isOnline && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-violet-600">
                        <ShieldCheck className="h-3 w-3" />CAPI ✓
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
