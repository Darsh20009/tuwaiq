import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  MousePointerClick, Megaphone,
} from "lucide-react";
import { SiMeta, SiSnapchat } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const METHOD_LABEL: Record<string, string> = {
  online: "دفع إلكتروني",
  bank_transfer: "تحويل بنكي",
  cash: "نقدي",
};
const METHOD_COLOR: Record<string, string> = {
  online: "bg-blue-100 text-blue-700 border-blue-200",
  bank_transfer: "bg-amber-100 text-amber-700 border-amber-200",
  cash: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "مؤكد",
  pending: "قيد المراجعة",
  failed: "فشل",
  success: "مؤكد",
};
const STATUS_COLOR: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

function PlatformStatusCard({
  name, icon: Icon, color, pixelId, hasToken, active, onConfigure,
}: {
  name: string;
  icon: any;
  color: string;
  pixelId?: string;
  hasToken?: boolean;
  active: boolean;
  onConfigure: () => void;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all ${
      active ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white shadow-md shadow-emerald-100" : "border-border/50 bg-muted/20"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${color}`}>
            <Icon size={22} />
          </div>
          <div>
            <p className="font-black text-base">{name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {active ? (
                <>
                  <Wifi className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">متصل ونشط</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">غير مُفعَّل</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant={active ? "outline" : "default"}
          className="gap-1.5 shrink-0"
          onClick={onConfigure}
        >
          {active ? <RefreshCw className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
          {active ? "تعديل" : "تفعيل"}
        </Button>
      </div>

      {active && pixelId && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium w-16 shrink-0">Pixel ID:</span>
            <code className="bg-white border border-border/60 rounded px-2 py-0.5 font-mono text-xs flex-1 truncate">{pixelId}</code>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium w-16 shrink-0">CAPI Token:</span>
            <div className="flex items-center gap-1.5">
              {hasToken ? (
                <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><span className="text-emerald-600 font-bold">مُعيَّن ✓</span></>
              ) : (
                <><XCircle className="h-3.5 w-3.5 text-red-400" /><span className="text-red-500">غير مُعيَّن</span></>
              )}
            </div>
          </div>
        </div>
      )}

      {active && (
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      )}
    </div>
  );
}

export default function AdminTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [configuring, setConfiguring] = useState<"facebook" | "snapchat" | null>(null);
  const [showFbToken, setShowFbToken] = useState(false);
  const [showSnapToken, setShowSnapToken] = useState(false);
  const [fbForm, setFbForm] = useState({ facebookPixelId: "", facebookCAPIToken: "" });
  const [snapForm, setSnapForm] = useState({ snapchatPixelId: "", snapchatCAPIToken: "" });
  const [donorSearch, setDonorSearch] = useState("");

  const { data: settings, isLoading: settingsLoading } = useQuery<any>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings", { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
  });

  const { data: donations = [], isLoading: donationsLoading, refetch: refetchDonations } = useQuery<any[]>({
    queryKey: ["/api/admin/donations", { limit: 200 }],
    queryFn: async () => {
      const res = await fetch("/api/admin/donations?limit=200", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
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
      toast({ title: "✓ تم حفظ إعدادات التتبع بنجاح" });
      setConfiguring(null);
    },
    onError: () => toast({ title: "خطأ", description: "فشل الحفظ", variant: "destructive" }),
  });

  const fbActive = !!(settings?.facebookPixelId);
  const snapActive = !!(settings?.snapchatPixelId);

  const confirmedDonations = donations.filter((d) => d.status === "confirmed" || d.status === "success");
  const totalRevenue = confirmedDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const todayDonations = confirmedDonations.filter((d) => {
    const date = new Date(d.createdAt || d.updatedAt || Date.now());
    const now = new Date();
    return date.toDateString() === now.toDateString();
  });

  const onlineDonations = confirmedDonations.filter((d) => d.paymentMethod === "online" || d.paymentMethod === "rajhi");
  const onlineRevenue = onlineDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const filteredDonations = donorSearch
    ? donations.filter((d) =>
        d.donorName?.toLowerCase().includes(donorSearch.toLowerCase()) ||
        d.mobile?.includes(donorSearch) ||
        d.email?.toLowerCase().includes(donorSearch.toLowerCase())
      )
    : donations.slice(0, 50);

  const openFbConfig = () => {
    setFbForm({
      facebookPixelId: settings?.facebookPixelId || "",
      facebookCAPIToken: settings?.facebookCAPIToken || "",
    });
    setConfiguring("facebook");
  };
  const openSnapConfig = () => {
    setSnapForm({
      snapchatPixelId: settings?.snapchatPixelId || "",
      snapchatCAPIToken: settings?.snapchatCAPIToken || "",
    });
    setConfiguring("snapchat");
  };

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
            <p className="text-xs text-muted-foreground mt-0.5">إدارة البيكسل + CAPI — تتبع رحلة المتبرع</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetchDonations()}>
          <RefreshCw className="h-3.5 w-3.5" />
          تحديث البيانات
        </Button>
      </div>

      {/* Conversion Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي التبرعات المؤكدة", value: `${totalRevenue.toLocaleString("ar-SA")} ر.س`, icon: DollarSign, gradient: "from-emerald-500 to-emerald-700" },
          { label: "من الدفع الإلكتروني", value: `${onlineRevenue.toLocaleString("ar-SA")} ر.س`, icon: TrendingUp, gradient: "from-blue-500 to-blue-700" },
          { label: "عمليات اليوم", value: todayDonations.length, icon: Clock, gradient: "from-violet-500 to-violet-700" },
          { label: "إجمالي التحويلات", value: confirmedDonations.length, icon: Target, gradient: "from-rose-500 to-rose-700" },
        ].map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${s.gradient} text-white shadow-md`}>
            <div className="absolute -left-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider leading-tight">{s.label}</p>
                <p className="text-xl font-black mt-1 leading-tight">{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pixel Status Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="h-4 w-4 text-primary" />
          <h2 className="font-black text-sm">البيكسل والتتبع الإعلاني</h2>
          <Badge variant="outline" className="text-[10px]">Server-Side CAPI + Browser Pixel</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlatformStatusCard
            name="Meta / Facebook"
            icon={SiMeta}
            color="bg-[#1877F2]"
            pixelId={settings?.facebookPixelId}
            hasToken={!!settings?.facebookCAPIToken}
            active={fbActive}
            onConfigure={openFbConfig}
          />
          <PlatformStatusCard
            name="Snapchat"
            icon={SiSnapchat}
            color="bg-[#FFFC00] !text-black"
            pixelId={settings?.snapchatPixelId}
            hasToken={!!settings?.snapchatCAPIToken}
            active={snapActive}
            onConfigure={openSnapConfig}
          />
        </div>

        {(!fbActive && !snapActive) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div>
              <p className="font-bold">لم يتم تفعيل أي منصة إعلانية بعد</p>
              <p className="text-amber-600">أدخل الـ Pixel ID والـ CAPI Token لتفعيل التتبع التلقائي لكل تبرع مؤكد.</p>
            </div>
          </div>
        )}

        {/* Config Panel */}
        {configuring === "facebook" && (
          <div className="mt-4 rounded-2xl border-2 border-[#1877F2]/30 bg-blue-50/50 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <SiMeta size={18} className="text-[#1877F2]" />
              <h3 className="font-black text-sm text-[#1877F2]">إعداد Meta / Facebook Pixel</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Facebook Pixel ID</Label>
                <Input
                  value={fbForm.facebookPixelId}
                  onChange={(e) => setFbForm({ ...fbForm, facebookPixelId: e.target.value })}
                  placeholder="مثال: 123456789012345"
                  dir="ltr"
                  className="font-mono bg-white"
                  data-testid="input-fb-pixel-id"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">CAPI Access Token</Label>
                <div className="relative">
                  <Input
                    type={showFbToken ? "text" : "password"}
                    value={fbForm.facebookCAPIToken}
                    onChange={(e) => setFbForm({ ...fbForm, facebookCAPIToken: e.target.value })}
                    placeholder="EAAxxxxxx..."
                    dir="ltr"
                    className="font-mono bg-white pl-10"
                    data-testid="input-fb-capi-token"
                  />
                  <button type="button" onClick={() => setShowFbToken(!showFbToken)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showFbToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-bold mb-1">كيف تحصل على هذه البيانات؟</p>
              <p>Pixel ID: Facebook Business Manager → Events Manager → الـ Pixel الخاص بك</p>
              <p>Token: نفس الصفحة → Settings → Conversions API → Generate Access Token</p>
            </div>
            <div className="flex gap-2">
              <Button
                className="gap-2 bg-[#1877F2] hover:bg-[#1566d3]"
                onClick={() => saveMutation.mutate(fbForm)}
                disabled={saveMutation.isPending || !fbForm.facebookPixelId}
                data-testid="button-save-fb"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ إعدادات Facebook
              </Button>
              <Button variant="outline" onClick={() => setConfiguring(null)}>إلغاء</Button>
            </div>
          </div>
        )}

        {configuring === "snapchat" && (
          <div className="mt-4 rounded-2xl border-2 border-yellow-400/50 bg-yellow-50/50 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <SiSnapchat size={18} className="text-yellow-600" />
              <h3 className="font-black text-sm text-yellow-700">إعداد Snapchat Pixel</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Snapchat Pixel ID</Label>
                <Input
                  value={snapForm.snapchatPixelId}
                  onChange={(e) => setSnapForm({ ...snapForm, snapchatPixelId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  dir="ltr"
                  className="font-mono bg-white"
                  data-testid="input-snap-pixel-id"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">CAPI Bearer Token</Label>
                <div className="relative">
                  <Input
                    type={showSnapToken ? "text" : "password"}
                    value={snapForm.snapchatCAPIToken}
                    onChange={(e) => setSnapForm({ ...snapForm, snapchatCAPIToken: e.target.value })}
                    placeholder="Bearer token من Snap Ads Manager"
                    dir="ltr"
                    className="font-mono bg-white pl-10"
                    data-testid="input-snap-capi-token"
                  />
                  <button type="button" onClick={() => setShowSnapToken(!showSnapToken)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showSnapToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              <p className="font-bold mb-1">كيف تحصل على هذه البيانات؟</p>
              <p>Pixel ID: Snap Ads Manager → Assets → Pixels → الـ Pixel الخاص بك</p>
              <p>Token: نفس الصفحة → Conversions API → Generate Token</p>
            </div>
            <div className="flex gap-2">
              <Button
                className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => saveMutation.mutate(snapForm)}
                disabled={saveMutation.isPending || !snapForm.snapchatPixelId}
                data-testid="button-save-snap"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ إعدادات Snapchat
              </Button>
              <Button variant="outline" onClick={() => setConfiguring(null)}>إلغاء</Button>
            </div>
          </div>
        )}
      </div>

      {/* How CAPI works */}
      <Card className="border-border/50 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            كيف يعمل التتبع التلقائي؟
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            {[
              "المتبرع يُكمل الدفع في الراجحي",
              "السيرفر يستقبل تأكيد البنك",
              "يُرسل حدث Purchase بـ SHA-256 للمنصتين",
              "المتصفح يُطلق نفس الحدث من البيكسل",
              "المنصة تحسب تحويلاً واحداً فقط (Deduplication)",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</div>
                <span className="font-medium">{step}</span>
                {i < 4 && <ArrowUpRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Customer Tracking */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-black text-sm">تتبع رحلة العملاء والمتبرعين</h2>
            <Badge variant="outline" className="text-[10px]">{donations.length} عملية</Badge>
          </div>
          <div className="relative w-64">
            <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الجوال..."
              value={donorSearch}
              onChange={(e) => setDonorSearch(e.target.value)}
              className="pr-9 h-9 text-sm"
              data-testid="input-search-donors"
            />
          </div>
        </div>

        {donationsLoading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">جاري تحميل بيانات العملاء...</p>
            </div>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">لا توجد بيانات</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDonations.map((d: any) => {
              const isConfirmed = d.status === "confirmed" || d.status === "success";
              const date = d.createdAt ? new Date(d.createdAt) : null;
              return (
                <div
                  key={d.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border bg-card transition-all hover:shadow-sm hover:-translate-y-px ${
                    isConfirmed ? "border-emerald-100 hover:border-emerald-200" : "border-border/40"
                  }`}
                  data-testid={`row-donation-${d.id}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0 ${
                    isConfirmed ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : "bg-gradient-to-br from-slate-400 to-slate-600"
                  }`}>
                    {(d.donorName || "؟")[0]}
                  </div>

                  {/* Info */}
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
                      {d.mobile && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />{d.mobile}
                        </span>
                      )}
                      {d.email && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />{d.email}
                        </span>
                      )}
                      {d.type && (
                        <span className="text-xs text-muted-foreground">{d.type}</span>
                      )}
                      {date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(date, "d MMM yyyy — HH:mm", { locale: ar })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount + CAPI indicator */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className={`text-base font-black ${isConfirmed ? "text-emerald-700" : "text-muted-foreground"}`}>
                      {Number(d.amount || 0).toLocaleString("ar-SA")} ر.س
                    </p>
                    {isConfirmed && (d.paymentMethod === "online" || d.paymentMethod === "rajhi") && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-violet-600">
                        <ShieldCheck className="h-3 w-3" />
                        CAPI مُرسَل
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
