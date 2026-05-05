import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Settings, Phone, Mail, Globe, MapPin, Building2, Percent, CheckCircle2, CreditCard, Eye, EyeOff, ShieldCheck, AlertTriangle, BarChart3, Landmark, ToggleLeft, ToggleRight, Activity, RefreshCw, ChevronDown, ChevronUp, Megaphone, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";

// ─── Payment Callbacks Log Component ─────────────────────────────────────────

function PaymentCallbacksCard() {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery<{ ok: boolean; count: number; callbacks: any[] }>({
    queryKey: ["/api/donations/payment-callbacks"],
    enabled: expanded,
  });

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <div>
              <CardTitle className="text-base">سجلات بوابة الدفع (Callbacks)</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                كل استجابة تُرسلها بوابة الراجحي إلى خادمنا بعد كل محاولة دفع — للتشخيص والمتابعة
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expanded && (
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1 text-xs h-7">
                {isFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                تحديث
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="gap-1 text-xs h-7">
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "إخفاء" : "عرض السجلات"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">جارٍ التحميل...</span>
            </div>
          ) : !data?.callbacks?.length ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              لا توجد سجلات حتى الآن. ستظهر هنا بعد أول محاولة دفع عبر بوابة الراجحي.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              <p className="text-xs text-muted-foreground">إجمالي السجلات: {data.count}</p>
              {data.callbacks.map((cb: any, i: number) => (
                <div key={i} className="border rounded-lg p-3 bg-gray-50 text-xs font-mono space-y-1.5" data-testid={`callback-log-${i}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">{new Date(cb.receivedAt).toLocaleString("ar-SA")}</span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px] h-4">{cb.method}</Badge>
                      {cb.trandataLength > 0 ? (
                        <Badge className="text-[10px] h-4 bg-blue-100 text-blue-800 border-blue-200">trandata: {cb.trandataLength} chars</Badge>
                      ) : (
                        <Badge className="text-[10px] h-4 bg-amber-100 text-amber-800 border-amber-200">بدون trandata</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500">Content-Type: {cb.contentType || "—"}</div>
                  <div className="text-[11px] text-gray-500">الحقول: [{cb.bodyKeys?.join(", ") || "—"}]</div>
                  {Object.keys(cb.bodyWithoutTrandata || {}).length > 0 && (
                    <div className="bg-white border rounded p-2 text-[11px] text-gray-700 break-all">
                      <span className="font-bold text-gray-500">البيانات الأخرى: </span>
                      {JSON.stringify(cb.bodyWithoutTrandata, null, 2)}
                    </div>
                  )}
                  {cb.trandataPreview && (
                    <div className="bg-white border rounded p-2 text-[11px] text-purple-800 break-all">
                      <span className="font-bold text-gray-500">trandata (أول 300 حرف): </span>
                      {cb.trandataPreview}
                      {cb.trandataLength > 300 ? "…" : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main AdminSettings Component ─────────────────────────────────────────────

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>({
    siteName: "جمعية طويق للخدمات الإنسانية",
    siteNameEn: "Tuwaiq Humanitarian Services Association",
    phone: "",
    email: "",
    address: "",
    website: "",
    totalBeneficiaries: "",
    totalOrganizations: "",
    employee_fees_percentage: "10",
    whatsapp: "",
    twitter: "",
    instagram: "",
    facebook: "",
    youtube: "",
    logoUrl: "",
    bankName: "",
    bankIban: "",
    bankAccountName: "",
    rajhiTranportalId: "",
    rajhiTranportalPassword: "",
    rajhiResourceKey: "",
    rajhiResourceKey2: "",
    rajhiTerminalId: "",
    rajhiMerchantId: "",
    showDonationStats: false,
    enableRajhiPayment: false,
    enableBankTransfer: true,
    facebookPixelId: "",
    facebookCAPIToken: "",
    snapchatPixelId: "",
    snapchatCAPIToken: "",
  });
  const [saved, setSaved] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const { data: settings, isLoading } = useQuery<any>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) return {};
      return res.json();
    },
  });

  useEffect(() => {
    if (settings) {
      setForm((prev: any) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "✓ تم حفظ الإعدادات بنجاح" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات", variant: "destructive" });
    },
  });

  const Field = ({ label, fieldKey, placeholder, type = "text", icon: Icon, dir }: any) => (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </Label>
      <Input
        type={type}
        value={(form as any)[fieldKey] || ""}
        onChange={(e) => setForm({ ...form, [fieldKey]: e.target.value })}
        placeholder={placeholder}
        dir={dir}
        className="font-medium"
      />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-xl font-black">إعدادات الموقع</h1>
              <p className="text-xs text-muted-foreground">تعديل المعلومات العامة والإعدادات</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              تم الحفظ
            </span>
          )}
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isLoading} className="gap-2">
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ الإعدادات
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                معلومات الجمعية
              </CardTitle>
              <CardDescription>البيانات الأساسية التي تظهر في الموقع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="اسم الجمعية (عربي)" fieldKey="siteName" placeholder="جمعية طويق" icon={Building2} />
                <Field label="اسم الجمعية (English)" fieldKey="siteNameEn" placeholder="Tuwaiq Association" icon={Building2} dir="ltr" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="رقم الهاتف" fieldKey="phone" placeholder="+966 12 345 6789" icon={Phone} dir="ltr" />
                <Field label="البريد الإلكتروني" fieldKey="email" placeholder="info@example.com" icon={Mail} dir="ltr" />
              </div>
              <Field label="العنوان" fieldKey="address" placeholder="المدينة المنورة، المملكة العربية السعودية" icon={MapPin} />
              <Field label="الموقع الإلكتروني" fieldKey="website" placeholder="https://www.example.com" icon={Globe} dir="ltr" />
              <Field label="رقم الواتساب" fieldKey="whatsapp" placeholder="+966 5X XXX XXXX" icon={Phone} dir="ltr" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                الإحصائيات والإعدادات المالية
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="عدد المستفيدين" fieldKey="totalBeneficiaries" placeholder="0" type="number" />
              <Field label="عدد المؤسسات الشريكة" fieldKey="totalOrganizations" placeholder="0" type="number" />
              <Field label="نسبة رسوم التشغيل (%)" fieldKey="employee_fees_percentage" placeholder="10" type="number" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                إعدادات عرض الإحصائيات
              </CardTitle>
              <CardDescription>التحكم في ما يظهر للزوار في صفحات الخدمات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div className="space-y-1">
                  <p className="text-sm font-bold">إظهار إحصائيات التبرعات للزوار</p>
                  <p className="text-xs text-muted-foreground">
                    عند التفعيل، يظهر شريط التقدم ومبلغ المجموع والهدف في صفحة كل خدمة.
                    عند الإيقاف، تُخفى هذه الأرقام نهائياً ولا يرى الزوار أي معلومات مالية.
                  </p>
                </div>
                <Switch
                  data-testid="switch-show-donation-stats"
                  checked={!!form.showDonationStats}
                  onCheckedChange={(val) => setForm({ ...form, showDonationStats: val })}
                />
              </div>
              {!form.showDonationStats && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  الإحصائيات مخفية حالياً — لن يرى الزوار أي مبالغ أو نسب إنجاز في صفحات الخدمات.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">وسائل التواصل الاجتماعي</CardTitle>
              <CardDescription>روابط حسابات التواصل الاجتماعي</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="تويتر / X" fieldKey="twitter" placeholder="https://twitter.com/..." icon={Globe} dir="ltr" />
              <Field label="إنستغرام" fieldKey="instagram" placeholder="https://instagram.com/..." icon={Globe} dir="ltr" />
              <Field label="فيسبوك" fieldKey="facebook" placeholder="https://facebook.com/..." icon={Globe} dir="ltr" />
              <Field label="يوتيوب" fieldKey="youtube" placeholder="https://youtube.com/..." icon={Globe} dir="ltr" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">بيانات الحساب البنكي</CardTitle>
              <CardDescription>بيانات التحويل البنكي للمتبرعين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="اسم البنك" fieldKey="bankName" placeholder="البنك الأهلي السعودي" />
                <Field label="اسم صاحب الحساب" fieldKey="bankAccountName" placeholder="جمعية طويق للخدمات الإنسانية" />
              </div>
              <Field label="رقم IBAN" fieldKey="bankIban" placeholder="SA00 0000 0000 0000 0000 0000" dir="ltr" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">الشعار والهوية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="رابط الشعار (URL)" fieldKey="logoUrl" placeholder="https://example.com/logo.png" icon={Globe} dir="ltr" />
              {form.logoUrl && (
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <img src={form.logoUrl} alt="الشعار" className="h-16 w-16 object-contain rounded-lg bg-white p-1 border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div>
                    <p className="text-sm font-bold">معاينة الشعار</p>
                    <p className="text-xs text-muted-foreground">تأكد من صحة الرابط</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donation Methods Control */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                التحكم في طرق التبرع
              </CardTitle>
              <CardDescription>تفعيل أو إيقاف طرق الدفع المتاحة للمتبرعين في الموقع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${form.enableRajhiPayment ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">الدفع عبر الراجحي</p>
                    <p className="text-xs text-muted-foreground">بوابة مصرف الراجحي — بطاقة / مدى</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={form.enableRajhiPayment ? "default" : "secondary"} className="text-xs">
                    {form.enableRajhiPayment ? "مفعّل" : "موقوف"}
                  </Badge>
                  <Switch
                    data-testid="switch-enable-rajhi-payment"
                    checked={!!form.enableRajhiPayment}
                    onCheckedChange={(val) => setForm({ ...form, enableRajhiPayment: val })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${form.enableBankTransfer ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    <Landmark className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">التحويل البنكي</p>
                    <p className="text-xs text-muted-foreground">تحويل مباشر للحساب البنكي مع إرفاق الإيصال</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={form.enableBankTransfer ? "default" : "secondary"} className="text-xs">
                    {form.enableBankTransfer ? "مفعّل" : "موقوف"}
                  </Badge>
                  <Switch
                    data-testid="switch-enable-bank-transfer"
                    checked={!!form.enableBankTransfer}
                    onCheckedChange={(val) => setForm({ ...form, enableBankTransfer: val })}
                  />
                </div>
              </div>

              {!form.enableRajhiPayment && !form.enableBankTransfer && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  تحذير: جميع طرق التبرع موقوفة — لن يتمكن الزوار من التبرع عبر الموقع.
                </div>
              )}
              {[form.enableRajhiPayment, form.enableBankTransfer].filter(Boolean).length === 1 && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  طريقة دفع واحدة فقط متاحة — سيُختار تلقائياً دون خيار للمتبرع.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Gateway — Al Rajhi */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    بوابة الدفع الإلكتروني — مصرف الراجحي
                  </CardTitle>
                  <CardDescription className="mt-1">
                    بيانات التكامل من بريد بوابة الراجحي SecurePayments
                  </CardDescription>
                </div>
                <Badge variant={form.rajhiTranportalId && form.rajhiTranportalPassword && form.rajhiResourceKey ? "default" : "secondary"} className="gap-1">
                  {form.rajhiTranportalId && form.rajhiTranportalPassword && form.rajhiResourceKey
                    ? <><ShieldCheck className="h-3 w-3" /> مُفعّلة</>
                    : <><AlertTriangle className="h-3 w-3" /> غير مُفعّلة</>
                  }
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">Tranportal ID — معرّف البوابة</Label>
                  <Input
                    data-testid="input-rajhi-tranportal-id"
                    value={form.rajhiTranportalId}
                    onChange={(e) => setForm({ ...form, rajhiTranportalId: e.target.value })}
                    placeholder="مثال: 4wJ0Z1MeGyUk71e"
                    dir="ltr"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">Tranportal Password — كلمة مرور البوابة</Label>
                  <div className="relative">
                    <Input
                      data-testid="input-rajhi-tranportal-password"
                      type={showSecretKey ? "text" : "password"}
                      value={form.rajhiTranportalPassword}
                      onChange={(e) => setForm({ ...form, rajhiTranportalPassword: e.target.value })}
                      placeholder="كلمة المرور من البريد"
                      dir="ltr"
                      className="font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">Terminal Resource Key 1 — مفتاح التشفير (32 حرف)</Label>
                <div className="relative">
                  <Input
                    data-testid="input-rajhi-resource-key"
                    type={showSecretKey ? "text" : "password"}
                    value={form.rajhiResourceKey}
                    onChange={(e) => setForm({ ...form, rajhiResourceKey: e.target.value })}
                    placeholder="32-char hex key"
                    dir="ltr"
                    className="font-mono pr-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">Terminal Resource Key 2 — المفتاح البديل (اختياري)</Label>
                <div className="relative">
                  <Input
                    data-testid="input-rajhi-resource-key2"
                    type={showSecretKey ? "text" : "password"}
                    value={(form as any).rajhiResourceKey2 || ""}
                    onChange={(e) => setForm({ ...form, rajhiResourceKey2: e.target.value } as any)}
                    placeholder="32-char hex key (Key 2)"
                    dir="ltr"
                    className="font-mono pr-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">Terminal ID — رقم الطرفية (للمرجع)</Label>
                  <Input
                    data-testid="input-rajhi-terminal-id"
                    value={form.rajhiTerminalId}
                    onChange={(e) => setForm({ ...form, rajhiTerminalId: e.target.value })}
                    placeholder="مثال: PG580400"
                    dir="ltr"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">Merchant ID — رقم التاجر (للمرجع)</Label>
                  <Input
                    data-testid="input-rajhi-merchant-id"
                    value={form.rajhiMerchantId}
                    onChange={(e) => setForm({ ...form, rajhiMerchantId: e.target.value })}
                    placeholder="مثال: 600004862"
                    dir="ltr"
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                <p className="font-bold">معلومات الحساب المُفعَّل حالياً</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono">
                  <span className="text-blue-600">Terminal ID:</span><span>PG580400</span>
                  <span className="text-blue-600">Merchant ID:</span><span>600004862</span>
                  <span className="text-blue-600">Merchant Name:</span><span>TUWAIQASSOCIATION</span>
                  <span className="text-blue-600">Website:</span><span>tuwaiqassociation.sa</span>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> تنبيه أمني</p>
                <p>هذه البيانات حساسة. تأكد من حصولك عليها من بريد الراجحي الرسمي فقط.</p>
              </div>
            </CardContent>
          </Card>

          {/* Tracking & CAPI */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-blue-600" />
                التتبع الإعلاني — Facebook & Snapchat CAPI
              </CardTitle>
              <CardDescription>
                بعد كل تبرع مؤكد، يُرسل السيرفر حدث Purchase تلقائياً للمنصات الإعلانية.
                البيانات مشفّرة بـ SHA-256 قبل الإرسال. معرّف الحدث (Event ID) هو نفسه للبيكسل والسيرفر لضمان عدم التكرار.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Facebook */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" />
                  فيسبوك / Meta
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">Facebook Pixel ID</Label>
                    <Input
                      data-testid="input-facebook-pixel-id"
                      value={(form as any).facebookPixelId || ""}
                      onChange={(e) => setForm({ ...form, facebookPixelId: e.target.value })}
                      placeholder="مثال: 123456789012345"
                      dir="ltr"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">Facebook CAPI Access Token</Label>
                    <div className="relative">
                      <Input
                        data-testid="input-facebook-capi-token"
                        type={showSecretKey ? "text" : "password"}
                        value={(form as any).facebookCAPIToken || ""}
                        onChange={(e) => setForm({ ...form, facebookCAPIToken: e.target.value })}
                        placeholder="EAAxxxxxx..."
                        dir="ltr"
                        className="font-mono pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Snapchat */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-yellow-700 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" />
                  سناب شات
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">Snapchat Pixel ID</Label>
                    <Input
                      data-testid="input-snapchat-pixel-id"
                      value={(form as any).snapchatPixelId || ""}
                      onChange={(e) => setForm({ ...form, snapchatPixelId: e.target.value })}
                      placeholder="مثال: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      dir="ltr"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">Snapchat CAPI Token</Label>
                    <div className="relative">
                      <Input
                        data-testid="input-snapchat-capi-token"
                        type={showSecretKey ? "text" : "password"}
                        value={(form as any).snapchatCAPIToken || ""}
                        onChange={(e) => setForm({ ...form, snapchatCAPIToken: e.target.value })}
                        placeholder="Bearer token من Snap Ads Manager"
                        dir="ltr"
                        className="font-mono pr-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1.5">
                <p className="font-bold">كيف يعمل التتبع الآلي؟</p>
                <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                  <li>يُكمل المتبرع عملية الدفع في بوابة الراجحي</li>
                  <li>السيرفر يستقبل رد البنك ويؤكد التبرع تلقائياً في قاعدة البيانات</li>
                  <li>فوراً، يُرسل السيرفر حدث Purchase بـ SHA-256 (إيميل أو جوال) للمنصتين</li>
                  <li>المتصفح يُطلق نفس الحدث من البيكسل بنفس الـ Event ID للـ Deduplication</li>
                </ol>
              </div>

              {!(form as any).facebookPixelId && !(form as any).snapchatPixelId && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  لم يتم تفعيل أي منصة إعلانية بعد — أدخل الـ Pixel ID والـ Token لتفعيل التتبع التلقائي.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Gateway Callbacks Log */}
          <PaymentCallbacksCard />

          <div className="flex justify-end pb-6">
            <Button size="lg" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2 px-8">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ جميع الإعدادات
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
