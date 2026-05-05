import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User, Shield, Heart, Coins, History, CheckCircle2, Clock, XCircle,
  FileText, Award, Edit2, Save, X, Fingerprint, Loader2, MonitorSmartphone,
  Trash2, PlusCircle, RefreshCw, Pause, Play, Ban, Star, TrendingUp, Gift,
  CalendarPlus, CalendarCheck,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Donation } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// ──────────────────────────────────────────────────────────
// Points tier helper
// ──────────────────────────────────────────────────────────
function getTier(points: number) {
  if (points >= 50000) return { label: "بلاتيني", color: "bg-purple-100 text-purple-700", icon: "💎" };
  if (points >= 20000) return { label: "ذهبي", color: "bg-yellow-100 text-yellow-700", icon: "🥇" };
  if (points >= 5000) return { label: "فضي", color: "bg-gray-100 text-gray-700", icon: "🥈" };
  return { label: "برونزي", color: "bg-amber-100 text-amber-700", icon: "🥉" };
}

// ──────────────────────────────────────────────────────────
// Donation type label
// ──────────────────────────────────────────────────────────
function donationTypeLabel(type: string) {
  const map: Record<string, string> = {
    general: "صدقة عامة",
    zakat: "زكاة",
    waqf: "وقف",
    water: "سقيا الماء",
    "ramadan-basket": "سلة رمضانية",
    iftar: "إفطار صائم",
  };
  return map[type] || type || "عام";
}

// ──────────────────────────────────────────────────────────
// Calendar helpers for recurring donations
// ──────────────────────────────────────────────────────────
function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function generateICS(r: any): string {
  const startDate = r.nextChargeDate ? new Date(r.nextChargeDate) : new Date();
  startDate.setHours(10, 0, 0, 0);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const freq = r.frequency === "daily" ? "DAILY" : "MONTHLY";
  const count = r.duration || (r.frequency === "daily" ? 30 : 12);
  const title = r.frequency === "daily"
    ? `تبرع يومي - جمعية طويق`
    : `تبرع شهري - جمعية طويق`;
  const desc = `تبرع دوري بمبلغ ${Number(r.amount || 0).toLocaleString("ar-SA")} ريال سعودي - ${donationTypeLabel(r.type)}\\nمن موقع tuwaiqassociation.sa`;
  const uid = `tuwaiq-recurring-${r._id || Date.now()}@tuwaiqassociation.sa`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tuwaiq Association//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${toICSDate(startDate)}`,
    `DTEND:${toICSDate(endDate)}`,
    `RRULE:FREQ=${freq};COUNT=${count}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    "URL:https://tuwaiqassociation.sa/donate",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:تذكير: ${title} غداً - ${Number(r.amount || 0).toLocaleString("ar-SA")} ر.س`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadICS(r: any) {
  const content = generateICS(r);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tuwaiq-recurring-${r.frequency || "monthly"}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function getGoogleCalendarLink(r: any): string {
  const startDate = r.nextChargeDate ? new Date(r.nextChargeDate) : new Date();
  startDate.setHours(10, 0, 0, 0);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const freq = r.frequency === "daily" ? "DAILY" : "MONTHLY";
  const count = r.duration || (r.frequency === "daily" ? 30 : 12);
  const title = encodeURIComponent(r.frequency === "daily" ? "تبرع يومي - جمعية طويق" : "تبرع شهري - جمعية طويق");
  const details = encodeURIComponent(`تبرع دوري بمبلغ ${Number(r.amount || 0).toLocaleString("ar-SA")} ريال - ${donationTypeLabel(r.type)}`);
  const recur = encodeURIComponent(`RRULE:FREQ=${freq};COUNT=${count}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(startDate)}/${fmt(endDate)}&recur=${recur}&details=${details}&sf=true&output=xml`;
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function Profile() {
  const { user, isLoading, togglePrivacy } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isBiometricPending, setIsBiometricPending] = useState(false);
  const [deletingCredentialId, setDeletingCredentialId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", email: "" });

  // ── Biometric helpers ──────────────────────────────────
  const handleRegisterBiometric = async () => {
    if (!window.PublicKeyCredential) {
      toast({ title: "غير مدعوم", description: "متصفحك لا يدعم الدخول بالبصمة", variant: "destructive" });
      return;
    }
    setIsBiometricPending(true);
    try {
      const res = await apiRequest("GET", "/api/auth/webauthn/challenge");
      const { challenge } = await res.json();
      const challengeBuffer = Uint8Array.from(atob(challenge), c => c.charCodeAt(0));
      const userIdBuffer = Uint8Array.from(user?.id || "", c => c.charCodeAt(0));
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: { name: "جمعية طويق", id: window.location.hostname },
          user: { id: userIdBuffer, name: user?.mobile || "user", displayName: user?.name || "User" },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
          timeout: 60000,
          attestation: "none",
        }
      }) as any;
      if (!credential) throw new Error("فشل إنشاء البصمة");
      const response = credential.response;
      let publicKey = "";
      if (response.getPublicKey) {
        const pkBuffer = new Uint8Array(response.getPublicKey());
        let binary = "";
        for (let i = 0; i < pkBuffer.length; i++) binary += String.fromCharCode(pkBuffer[i]);
        publicKey = btoa(binary);
      }
      await apiRequest("POST", "/api/auth/webauthn/register", { credential: { id: credential.id, publicKey } });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "تم التسجيل", description: "تم تفعيل الدخول بالبصمة بنجاح" });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل تسجيل البصمة", variant: "destructive" });
    } finally {
      setIsBiometricPending(false);
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    setDeletingCredentialId(credentialId);
    try {
      const res = await apiRequest("DELETE", `/api/auth/webauthn/credentials/${credentialId}`);
      if (!res.ok) throw new Error("فشل حذف الجهاز");
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "تم الحذف", description: "تم إزالة الجهاز بنجاح" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل حذف الجهاز", variant: "destructive" });
    } finally {
      setDeletingCredentialId(null);
    }
  };

  // ── Queries ───────────────────────────────────────────
  const { data: donationsRaw } = useQuery<Donation[]>({
    queryKey: ["/api/donations"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/donations", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : (Array.isArray(json?.donations) ? json.donations : []);
    },
  });
  const donations = Array.isArray(donationsRaw) ? donationsRaw : [];

  const { data: recurringRaw = [], refetch: refetchRecurring } = useQuery<any[]>({
    queryKey: ["/api/recurring"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/recurring", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    },
  });
  const recurring: any[] = Array.isArray(recurringRaw) ? recurringRaw : [];

  // ── Mutations ─────────────────────────────────────────
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
      toast({ title: "تم التحديث", description: "تم حفظ التعديلات بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث الملف الشخصي", variant: "destructive" });
    },
  });

  const updateRecurringMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/recurring/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      refetchRecurring();
      toast({ title: "تم التحديث" });
    },
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/recurring/${id}`);
      return res.json();
    },
    onSuccess: () => {
      refetchRecurring();
      toast({ title: "تم الإلغاء", description: "تم إلغاء الاشتراك الدوري" });
    },
  });

  // ── Effects ───────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
    if (user) setEditData({ name: user.name || "", email: user.email || "" });
  }, [user, isLoading, setLocation]);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col bg-muted/30" dir="rtl">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </main>
      <Footer />
    </div>
  );
  if (!user) return null;

  const tier = getTier(user.points || 0);
  const confirmedDonations = donations.filter((d: any) => d.status === "confirmed");
  const activeRecurring = recurring.filter(r => r.status === "active");

  // ── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl" dir="rtl">

        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-24 relative" style={{ background: "linear-gradient(135deg, hsl(152 42% 28%) 0%, hsl(152 42% 42%) 100%)" }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M20 20.5V18H0v5h5v5H0v5h20v-2.5h-5V20.5h5zM8 10H0v10h8V10z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          </div>
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-black shrink-0" style={{ background: "hsl(152 42% 30%)" }}>
                  {user.name.charAt(0)}
                </div>
                <div className="mb-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} placeholder="الاسم" className="h-8 text-sm w-48" data-testid="input-edit-name" />
                      <Input value={editData.email} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} placeholder="البريد" type="email" className="h-8 text-sm w-48" data-testid="input-edit-email" />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-xl font-black">{user.name}</h1>
                      <p className="text-muted-foreground text-sm font-mono" dir="ltr">{user.mobile}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-xs" variant="secondary">
                          <Shield className="w-3 h-3 ml-1" />
                          {user.role === "admin" ? "مدير" : user.role === "employee" ? "موظف" : "داعم"}
                        </Badge>
                        <Badge className={cn("text-xs", tier.color)}>
                          {tier.icon} {tier.label}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mb-1">
                {isEditing ? (
                  <>
                    <Button size="sm" className="gap-1" onClick={() => updateProfileMutation.mutate(editData)} disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                      <Save className="w-3.5 h-3.5" /> حفظ
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setIsEditing(false)}>
                      <X className="w-3.5 h-3.5" /> إلغاء
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                    <Edit2 className="w-3.5 h-3.5" /> تعديل
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Heart, label: "إجمالي التبرعات", value: `${Number(user.totalDonations || 0).toLocaleString("ar-SA")} ر.س`, color: "text-red-600", bg: "bg-red-50" },
            { icon: Coins, label: "نقاط العطاء", value: (user.points || 0).toLocaleString("ar-SA"), color: "text-yellow-600", bg: "bg-yellow-50" },
            { icon: History, label: "عدد التبرعات", value: donations.length, color: "text-blue-600", bg: "bg-blue-50" },
            { icon: RefreshCw, label: "اشتراكات دورية", value: activeRecurring.length, color: "text-green-600", bg: "bg-green-50" },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                  <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                </div>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="donations" dir="rtl">
          <TabsList className="w-full h-auto grid grid-cols-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl p-1">
            <TabsTrigger value="donations" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2" data-testid="tab-donations">
              <History className="w-3.5 h-3.5" /> تبرعاتي
            </TabsTrigger>
            <TabsTrigger value="recurring" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2" data-testid="tab-recurring">
              <RefreshCw className="w-3.5 h-3.5" /> الدورية
            </TabsTrigger>
            <TabsTrigger value="points" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2" data-testid="tab-points">
              <Coins className="w-3.5 h-3.5" /> نقاطي
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2" data-testid="tab-settings">
              <Shield className="w-3.5 h-3.5" /> الأمان
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Donations ── */}
          <TabsContent value="donations">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    سجل التبرعات
                  </CardTitle>
                  <Badge variant="secondary">{donations.length} تبرع</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium mb-4">لا يوجد تبرعات سابقة بعد</p>
                    <Link href="/donate">
                      <Button className="gap-2"><Heart className="w-4 h-4" />ابدأ بالتبرع</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {donations.map((donation: any, i: number) => (
                      <div key={donation.id || i} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/20 transition-colors" data-testid={`donation-row-${i}`}>
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2.5 rounded-xl", {
                            "bg-green-100 text-green-700": donation.status === "confirmed",
                            "bg-red-100 text-red-700": donation.status === "rejected",
                            "bg-amber-100 text-amber-700": !donation.status || donation.status === "pending",
                          })}>
                            {donation.status === "confirmed" ? <CheckCircle2 className="w-5 h-5" /> :
                             donation.status === "rejected" ? <XCircle className="w-5 h-5" /> :
                             <Clock className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{Number(donation.amount || 0).toLocaleString("ar-SA")} ريال</p>
                            <p className="text-xs text-muted-foreground">
                              {donationTypeLabel(donation.type)} — {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString("ar-SA") : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs font-bold", {
                            "bg-green-100 text-green-700": donation.status === "confirmed",
                            "bg-red-100 text-red-700": donation.status === "rejected",
                            "bg-amber-100 text-amber-700": !donation.status || donation.status === "pending",
                          })}>
                            {donation.status === "confirmed" ? "مؤكد" :
                             donation.status === "rejected" ? "مرفوض" : "قيد المراجعة"}
                          </Badge>
                          {donation.status === "confirmed" && (
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" title="الفاتورة">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" title="الشهادة">
                                <Award className="h-4 w-4 text-amber-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Recurring ── */}
          <TabsContent value="recurring">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    التبرعات الدورية
                  </CardTitle>
                  <Badge variant="secondary">{activeRecurring.length} اشتراك نشط</Badge>
                </div>
                <CardDescription>اشتراكاتك الشهرية والأسبوعية المتكررة</CardDescription>
              </CardHeader>
              <CardContent>
                {recurring.length === 0 ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium mb-2">لا يوجد اشتراكات دورية بعد</p>
                    <p className="text-xs text-muted-foreground mb-4">يمكنك تفعيل التبرع الشهري أو الأسبوعي من صفحة التبرع</p>
                    <Link href="/donate">
                      <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" />اشترك الآن</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recurring.map((r: any, i: number) => (
                      <div key={r._id || i} className="p-4 rounded-xl border" data-testid={`recurring-row-${i}`}>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-xl", {
                              "bg-green-100 text-green-700": r.status === "active",
                              "bg-amber-100 text-amber-700": r.status === "paused",
                              "bg-red-100 text-red-700": r.status === "cancelled",
                            })}>
                              <RefreshCw className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{Number(r.amount || 0).toLocaleString("ar-SA")} ريال / {r.frequency === "monthly" ? "شهر" : "أسبوع"}</p>
                              <p className="text-xs text-muted-foreground">
                                {donationTypeLabel(r.type)}
                                {r.nextChargeDate && ` — الدفعة القادمة: ${new Date(r.nextChargeDate).toLocaleDateString("ar-SA")}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("text-xs", {
                              "bg-green-100 text-green-700": r.status === "active",
                              "bg-amber-100 text-amber-700": r.status === "paused",
                              "bg-red-100 text-red-700": r.status === "cancelled",
                            })}>
                              {r.status === "active" ? "نشط" : r.status === "paused" ? "موقوف" : "ملغي"}
                            </Badge>
                            {r.status !== "cancelled" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline" className="gap-1 h-8 text-xs text-primary border-primary/30 hover:bg-primary/5"
                                    data-testid={`button-calendar-recurring-${i}`}>
                                    <CalendarPlus className="w-3 h-3" /> أضف للتقويم
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56" dir="rtl">
                                  <DropdownMenuLabel className="text-xs text-muted-foreground">اختر تقويمك</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={() => window.open(getGoogleCalendarLink(r), "_blank")}
                                    data-testid={`button-gcal-recurring-${i}`}
                                  >
                                    <CalendarCheck className="w-4 h-4 text-blue-600" />
                                    <span>Google Calendar</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={() => downloadICS(r)}
                                    data-testid={`button-ics-recurring-${i}`}
                                  >
                                    <CalendarPlus className="w-4 h-4 text-gray-600" />
                                    <div className="flex flex-col">
                                      <span>تقويم آيفون / أندرويد</span>
                                      <span className="text-[10px] text-muted-foreground">تنزيل ملف .ics</span>
                                    </div>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <div className="px-2 py-1.5">
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                      سيُضاف حدث متكرر مع تذكير قبل يوم من كل دفعة
                                    </p>
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            {r.status === "active" && (
                              <Button size="sm" variant="outline" className="gap-1 h-8 text-xs"
                                onClick={() => updateRecurringMutation.mutate({ id: r._id, status: "paused" })}
                                disabled={updateRecurringMutation.isPending}
                                data-testid={`button-pause-recurring-${i}`}
                              >
                                <Pause className="w-3 h-3" /> إيقاف مؤقت
                              </Button>
                            )}
                            {r.status === "paused" && (
                              <Button size="sm" variant="outline" className="gap-1 h-8 text-xs text-green-700 border-green-300"
                                onClick={() => updateRecurringMutation.mutate({ id: r._id, status: "active" })}
                                disabled={updateRecurringMutation.isPending}
                                data-testid={`button-resume-recurring-${i}`}
                              >
                                <Play className="w-3 h-3" /> استئناف
                              </Button>
                            )}
                            {r.status !== "cancelled" && (
                              <Button size="sm" variant="ghost" className="gap-1 h-8 text-xs text-red-600 hover:bg-red-50"
                                onClick={() => deleteRecurringMutation.mutate(r._id)}
                                disabled={deleteRecurringMutation.isPending}
                                data-testid={`button-cancel-recurring-${i}`}
                              >
                                <Ban className="w-3 h-3" /> إلغاء
                              </Button>
                            )}
                          </div>
                        </div>
                        {r.chargeCount > 0 && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                            <span>عدد الدفعات: <b className="text-foreground">{r.chargeCount}</b></span>
                            <span>الإجمالي المدفوع: <b className="text-primary">{Number(r.totalCharged || 0).toLocaleString("ar-SA")} ر.س</b></span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Points ── */}
          <TabsContent value="points">
            <div className="space-y-4">
              {/* Points hero */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="p-6 text-center" style={{ background: "linear-gradient(135deg, hsl(38 85% 40%) 0%, hsl(38 85% 55%) 100%)" }}>
                  <div className="text-5xl font-black text-white mb-1">{(user.points || 0).toLocaleString("ar-SA")}</div>
                  <p className="text-white/80 text-sm">نقطة عطاء</p>
                  <Badge className={cn("mt-3 font-bold text-sm", tier.color)}>
                    {tier.icon} المستوى {tier.label}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">النقاط من التبرعات</p>
                      <p className="font-black text-lg text-yellow-600">{(confirmedDonations.reduce((s: number, d: any) => s + (d.amount || 0), 0) * 10).toLocaleString("ar-SA")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">المستوى التالي</p>
                      <p className="font-black text-lg text-primary">
                        {(user.points || 0) < 5000 ? "5,000" :
                         (user.points || 0) < 20000 ? "20,000" :
                         (user.points || 0) < 50000 ? "50,000" : "MAX"} نقطة
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">معدل الاكتساب</p>
                      <p className="font-black text-lg text-green-600">10 نقطة / ريال</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How to earn */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Gift className="w-5 h-5 text-yellow-500" />
                    كيف تكسب نقاطاً؟
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Heart, label: "كل تبرع مؤكد", points: "10 نقطة / ريال", color: "text-red-500 bg-red-50" },
                    { icon: RefreshCw, label: "التبرع الشهري المنتظم", points: "+20% مكافأة", color: "text-green-600 bg-green-50" },
                    { icon: Star, label: "التبرع في المناسبات (رمضان)", points: "+50% مكافأة", color: "text-yellow-600 bg-yellow-50" },
                    { icon: TrendingUp, label: "أول تبرع لك", points: "500 نقطة مكافأة", color: "text-blue-600 bg-blue-50" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", item.color)}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium">{item.label}</p>
                      </div>
                      <Badge variant="secondary" className="font-bold text-xs">{item.points}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tiers */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    مستويات الداعمين
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "برونزي", range: "0 – 4,999", icon: "🥉", color: "bg-amber-100 text-amber-700", min: 0 },
                    { label: "فضي", range: "5,000 – 19,999", icon: "🥈", color: "bg-gray-100 text-gray-700", min: 5000 },
                    { label: "ذهبي", range: "20,000 – 49,999", icon: "🥇", color: "bg-yellow-100 text-yellow-700", min: 20000 },
                    { label: "بلاتيني", range: "+50,000", icon: "💎", color: "bg-purple-100 text-purple-700", min: 50000 },
                  ].map((t, i) => (
                    <div key={i} className={cn("flex items-center justify-between p-3 rounded-xl border-2", (user.points || 0) >= t.min ? "border-primary/20" : "border-transparent bg-muted/20")}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{t.icon}</span>
                        <div>
                          <p className="font-bold text-sm">{t.label}</p>
                          <p className="text-xs text-muted-foreground">{t.range} نقطة</p>
                        </div>
                      </div>
                      {(user.points || 0) >= t.min && <Badge className="bg-primary text-white text-xs">مستواك الحالي</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab: Security ── */}
          <TabsContent value="settings">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  الأمان والخصوصية
                </CardTitle>
                <CardDescription>تحكم في طرق الدخول وظهور معلوماتك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Biometric */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-primary" />
                        الدخول بالبصمة
                      </Label>
                      <p className="text-sm text-muted-foreground">سجّل بصمة أجهزتك للدخول السريع</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                      onClick={handleRegisterBiometric} disabled={isBiometricPending} data-testid="button-register-biometric">
                      {isBiometricPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                      إضافة جهاز
                    </Button>
                  </div>

                  {(user as any).webauthnCredentials?.length > 0 ? (
                    <div className="space-y-2">
                      {(user as any).webauthnCredentials.map((cred: any, idx: number) => (
                        <div key={cred.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30" data-testid={`biometric-device-${idx}`}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <MonitorSmartphone className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">جهاز {idx + 1}</p>
                              <p className="text-xs text-muted-foreground">{cred.createdAt ? new Date(cred.createdAt).toLocaleDateString("ar-SA") : "—"}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCredential(cred.id)} disabled={deletingCredentialId === cred.id} data-testid={`button-delete-device-${idx}`}>
                            {deletingCredentialId === cred.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                      لا يوجد أجهزة مسجلة — اضغط "إضافة جهاز" لتفعيل الميزة
                    </div>
                  )}
                </div>

                {/* Public profile toggle */}
                <div className="flex items-center justify-between py-4 border-t">
                  <div className="space-y-1">
                    <Label htmlFor="public-profile" className="text-base font-medium">الظهور في قائمة الشرف</Label>
                    <p className="text-sm text-muted-foreground">عند التفعيل يظهر اسمك في صفحة قائمة الشرف العامة</p>
                  </div>
                  <Switch id="public-profile" checked={user.isPublicDonor || false} onCheckedChange={checked => togglePrivacy(checked)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick action */}
        <div className="mt-6 flex justify-end">
          <Link href="/donate">
            <Button className="gap-2 shadow-sm">
              <Heart className="w-4 h-4" />
              تبرع جديد
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
