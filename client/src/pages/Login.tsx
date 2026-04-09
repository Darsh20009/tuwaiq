import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Fingerprint, ArrowLeft, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const STARS = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  size: Math.random() * 2.5 + 0.5,
  top: Math.random() * 70,
  left: Math.random() * 100,
  dur: 1.8 + Math.random() * 2.5,
  delay: Math.random() * 3,
}));

function VisualPanel() {
  return (
    <div
      className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, hsl(152 50% 7%) 0%, hsl(152 46% 14%) 45%, hsl(152 42% 24%) 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ width: s.size, height: s.size, top: `${s.top}%`, left: `${s.left}%` }}
            animate={{ opacity: [0.1, 0.9, 0.1] }}
            transition={{ repeat: Infinity, duration: s.dur, delay: s.delay }}
          />
        ))}
      </div>

      {/* Moon */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 80, height: 80, top: "8%", right: "12%",
          background: "radial-gradient(circle at 35% 35%, #fffdf0 0%, #e8f5e9 40%, #a5d6a7 100%)",
          boxShadow: "0 0 50px rgba(200,255,220,0.55), 0 0 100px rgba(200,255,220,0.2)",
        }}
        initial={{ opacity: 0, scale: 0.3, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 80, height: 80, top: "8%", right: "12%",
          background: "radial-gradient(circle at 68% 35%, hsl(152 45% 10% / 0.5) 38%, transparent 65%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.6 }}
      />

      {/* Far mountains */}
      <motion.div className="absolute inset-x-0 bottom-0" initial={{ y: 220 }} animate={{ y: 0 }} transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <svg viewBox="0 0 1440 420" preserveAspectRatio="none" className="w-full" style={{ height: 420, display: "block" }}>
          <path d="M0,420 L0,300 Q80,180 200,260 Q320,340 440,190 Q560,40 680,180 Q800,320 920,150 Q1040,-20 1160,130 Q1280,280 1440,210 L1440,420 Z" fill="rgba(255,255,255,0.038)" />
        </svg>
      </motion.div>

      {/* Back mountains */}
      <motion.div className="absolute inset-x-0 bottom-0" initial={{ y: 280 }} animate={{ y: 0 }} transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <svg viewBox="0 0 1440 360" preserveAspectRatio="none" className="w-full" style={{ height: 360, display: "block" }}>
          <path d="M0,360 L0,270 Q110,170 240,240 Q370,310 500,175 Q630,40 760,170 Q890,300 1020,140 Q1150,-20 1290,120 L1440,180 L1440,360 Z" fill="hsl(152 44% 18% / 0.95)" />
        </svg>
      </motion.div>

      {/* Mid mountains */}
      <motion.div className="absolute inset-x-0 bottom-0" initial={{ y: 310 }} animate={{ y: 0 }} transition={{ duration: 1.05, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="w-full" style={{ height: 300, display: "block" }}>
          <path d="M0,300 L0,235 Q70,150 155,205 Q240,260 330,150 Q420,40 520,135 Q620,230 720,100 Q820,-30 920,100 Q1020,230 1115,125 Q1210,20 1320,130 L1440,155 L1440,300 Z" fill="hsl(152 46% 13% / 1)" />
        </svg>
      </motion.div>

      {/* Front mountains */}
      <motion.div className="absolute inset-x-0 bottom-0" initial={{ y: 360 }} animate={{ y: 0 }} transition={{ duration: 0.95, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <svg viewBox="0 0 1440 240" preserveAspectRatio="none" className="w-full" style={{ height: 240, display: "block" }}>
          <path d="M0,240 L0,205 Q40,160 80,188 Q120,216 165,160 Q210,104 265,150 Q320,196 385,120 Q450,44 525,108 Q600,172 675,78 Q750,-16 835,80 Q920,176 1005,90 Q1090,4 1175,108 Q1235,175 1305,128 Q1365,90 1440,138 L1440,240 Z" fill="hsl(152 48% 9% / 1)" />
          <ellipse cx="720" cy="238" rx="820" ry="14" fill="rgba(255,255,255,0.025)" />
        </svg>
      </motion.div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center text-center px-10 mb-48">
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative"
          >
            <div
              className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl mx-auto"
              style={{
                border: "2.5px solid rgba(255,255,255,0.28)",
                boxShadow: "0 12px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), 0 0 60px hsl(152 60% 40% / 0.3)",
              }}
            >
              <img src="/images/logo.jpeg" alt="طويق" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -inset-3 rounded-3xl blur-2xl opacity-25" style={{ background: "hsl(152 60% 50%)" }} />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}>
          <h1
            className="text-white font-black text-3xl mb-1"
            style={{ fontFamily: "Cairo, Tajawal, sans-serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            جمعية طويق
          </h1>
          <p className="text-white/70 text-sm tracking-widest mb-8" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
            للخدمات الإنسانية
          </p>

          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px bg-white/20 w-16" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/35" />
            <div className="h-px bg-white/20 w-16" />
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {[
              { num: "+8,350", label: "مستفيد" },
              { num: "+450", label: "مشروع منجز" },
              { num: "+1,200", label: "متبرع كريم" },
              { num: "+50", label: "شريك نجاح" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
              >
                <p className="text-white font-black text-lg" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>{s.num}</p>
                <p className="text-white/60 text-[11px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function GoogleRedirectButton() {
  return (
    <a href="/api/auth/google" className="block mt-2 w-full" data-testid="button-google-signin">
      <div
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer hover:shadow-md"
        style={{ background: "white", border: "1.5px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <div className="flex-1 text-center">
          <span className="text-sm font-bold" style={{ color: "#3c4043" }}>تسجيل الدخول بـ Google</span>
        </div>
      </div>
    </a>
  );
}

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricPending, setIsBiometricPending] = useState(false);
  const { login, register, isPending } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: "", mobile: "", password: "" });
  const [resetData, setResetData] = useState({ mobile: "", newPassword: "" });
  const [isResetting, setIsResetting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (["mobile", "register-mobile", "reset-mobile"].includes(id)) {
      let digits = value.replace(/\D/g, "");
      if (digits.startsWith("966")) digits = digits.slice(3);
      if (digits.startsWith("0")) digits = digits.slice(1);
      digits = digits.slice(0, 9);
      let formatted = digits;
      if (digits.length > 2) {
        formatted = `${digits.slice(0, 2)} ${digits.slice(2, 5)}`;
        if (digits.length > 5) formatted += ` ${digits.slice(5, 9)}`;
      }
      if (id === "reset-mobile") setResetData((p) => ({ ...p, mobile: formatted }));
      else setFormData((p) => ({ ...p, mobile: formatted }));
    } else {
      setFormData((p) => ({ ...p, [id]: value }));
    }
  };

  const redirectAfterAuth = (role?: string) => {
    if (["admin", "manager"].includes(role || "")) setLocation("/admin");
    else if (role === "delivery") setLocation("/delivery");
    else if (["employee", "accountant", "programmer", "sales"].includes(role || "")) setLocation("/employee");
    else setLocation("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login({ mobile: formData.mobile, password: formData.password });
      if (user) redirectAfterAuth(user.role);
    } catch {}
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ name: formData.name, mobile: formData.mobile, password: formData.password, isPublicDonor: true, role: "user" } as any);
      toast({ title: "تم إنشاء الحساب بنجاح", description: `مرحباً بك، ${formData.name}` });
      setLocation("/");
    } catch {}
  };

  const handleBiometricLogin = async () => {
    if (!window.PublicKeyCredential) {
      toast({ title: "غير مدعوم", description: "عذراً، متصفحك لا يدعم الدخول بالبصمة", variant: "destructive" });
      return;
    }
    setIsBiometricPending(true);
    try {
      const res = await apiRequest("GET", "/api/auth/webauthn/challenge");
      const { challenge } = await res.json();
      const challengeBuffer = Uint8Array.from(atob(challenge), (c) => c.charCodeAt(0));
      const credential = await navigator.credentials.get({
        publicKey: { challenge: challengeBuffer, allowCredentials: [], userVerification: "required", timeout: 60000 },
      }) as any;
      if (!credential) throw new Error("فشل الحصول على البصمة");
      const authRes = await apiRequest("POST", "/api/auth/webauthn/authenticate", { credentialId: credential.id, challenge });
      const user = await authRes.json();
      toast({ title: "تم الدخول بنجاح", description: `مرحباً بك مجدداً، ${user.name}` });
      redirectAfterAuth(user.role);
    } catch (error: any) {
      toast({ title: "فشل الدخول", description: error.message || "فشل الدخول بالبصمة", variant: "destructive" });
    } finally {
      setIsBiometricPending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetData.newPassword.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setIsResetting(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", resetData);
      toast({ title: "تم بنجاح", description: "تم تغيير كلمة المرور بنجاح" });
      setResetData({ mobile: "", newPassword: "" });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في تغيير كلمة المرور", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  const inputCls = "h-11 border-gray-200 rounded-xl focus:border-primary focus:ring-primary/20 bg-white text-sm font-medium";
  const labelCls = "text-sm font-semibold text-gray-700 mb-1.5 block";

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left visual panel */}
      <VisualPanel />

      {/* Right form panel */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#f8f7f5] lg:bg-white relative">
        {/* Mobile header */}
        <div
          className="lg:hidden flex items-center justify-between px-5 py-4"
          style={{ background: "hsl(152 42% 28%)" }}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow border border-white/20">
              <img src="/images/logo.jpeg" alt="طويق" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-black text-lg" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>طويق</span>
          </Link>
          <Link href="/" className="flex items-center gap-1 text-white/80 text-sm hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            الرئيسية
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-[420px]">

            {/* Desktop back + logo */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow border border-gray-100">
                  <img src="/images/logo.jpeg" alt="طويق" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-black text-base leading-none" style={{ color: "hsl(152 42% 22%)", fontFamily: "Cairo, Tajawal, sans-serif" }}>جمعية طويق</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">للخدمات الإنسانية</p>
                </div>
              </div>
              <Link href="/" className="flex items-center gap-1 text-gray-400 text-sm hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                الرئيسية
              </Link>
            </div>

            {/* Mode toggle */}
            <div className="bg-gray-100 rounded-2xl p-1 flex mb-8 shadow-inner">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    mode === m
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}
                  data-testid={`tab-${m}`}
                >
                  {m === "login" ? "تسجيل الدخول" : "حساب جديد"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>أهلاً بعودتك</h1>
                    <p className="text-sm text-gray-400 mt-1">سجّل دخولك لمتابعة مسيرتك الخيرية</p>
                  </div>

                  {/* Google Sign-In */}
                  <GoogleRedirectButton />

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs text-gray-400" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>أو بالجوال وكلمة المرور</span>
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className={labelCls}>رقم الجوال</label>
                      <div className="relative">
                        <Input
                          id="mobile" placeholder="5x xxx xxxx" dir="ltr"
                          className={`${inputCls} pl-16 text-left`}
                          value={formData.mobile} onChange={handleInputChange} required
                          data-testid="input-mobile"
                        />
                        <div className="absolute left-0 top-0 h-full flex items-center px-3 border-r border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-l-xl" dir="ltr">
                          +966
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>كلمة المرور</label>
                      <div className="relative">
                        <Input
                          id="password" type={showPassword ? "text" : "password"}
                          className={inputCls}
                          value={formData.password} onChange={handleInputChange} required
                          autoComplete="current-password"
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button type="button" className="text-xs text-gray-400 hover:text-primary transition-colors" data-testid="button-forgot-password">
                            نسيت كلمة المرور؟
                          </button>
                        </DialogTrigger>
                        <DialogContent dir="rtl">
                          <DialogHeader>
                            <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
                            <DialogDescription>أدخل رقم الجوال وكلمة المرور الجديدة.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
                            <div>
                              <Label htmlFor="reset-mobile">رقم الجوال</Label>
                              <div className="relative mt-1.5">
                                <Input id="reset-mobile" placeholder="5x xxx xxxx" dir="ltr" className="pl-16 text-left" value={resetData.mobile} onChange={handleInputChange} required />
                                <div className="absolute left-0 top-0 h-full flex items-center px-3 border-r bg-muted/30 text-muted-foreground rounded-l-md" dir="ltr">+966</div>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="reset-password">كلمة المرور الجديدة</Label>
                              <Input id="reset-password" type="password" className="mt-1.5" value={resetData.newPassword} onChange={(e) => setResetData((p) => ({ ...p, newPassword: e.target.value }))} required />
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={isResetting} data-testid="button-submit-reset">
                                {isResetting ? <Loader2 className="animate-spin" /> : "تغيير كلمة المرور"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-11 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, hsl(152 42% 32%) 0%, hsl(152 42% 24%) 100%)", boxShadow: "0 4px 20px hsl(152 42% 28% / 0.4)" }}
                      data-testid="button-login"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "دخول"}
                    </button>

                    <button
                      type="button"
                      onClick={handleBiometricLogin}
                      disabled={isBiometricPending}
                      className="w-full h-11 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-bold text-sm transition-all duration-200 hover:border-primary/40 hover:text-primary hover:bg-primary/3 flex items-center justify-center gap-2"
                      data-testid="button-biometric-login"
                    >
                      {isBiometricPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-5 w-5" />}
                      الدخول بالبصمة
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>انضم إلينا</h1>
                    <p className="text-sm text-gray-400 mt-1">كن جزءاً من مسيرة الخير والعطاء</p>
                  </div>

                  {/* Google Sign-In */}
                  <GoogleRedirectButton />

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs text-gray-400" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>أو بالبيانات الشخصية</span>
                    </div>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className={labelCls}>الاسم الكامل</label>
                      <Input id="name" placeholder="اسمك الكريم" className={inputCls} value={formData.name} onChange={handleInputChange} required data-testid="input-register-name" />
                    </div>

                    <div>
                      <label className={labelCls}>رقم الجوال</label>
                      <div className="relative">
                        <Input id="register-mobile" placeholder="5x xxx xxxx" dir="ltr" className={`${inputCls} pl-16 text-left`} value={formData.mobile} onChange={handleInputChange} required data-testid="input-register-mobile" />
                        <div className="absolute left-0 top-0 h-full flex items-center px-3 border-r border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-l-xl" dir="ltr">+966</div>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>كلمة المرور</label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} className={inputCls} value={formData.password} onChange={handleInputChange} required autoComplete="new-password" data-testid="input-register-password" />
                        <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-11 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                      style={{ background: "linear-gradient(135deg, hsl(152 42% 32%) 0%, hsl(152 42% 24%) 100%)", boxShadow: "0 4px 20px hsl(152 42% 28% / 0.4)" }}
                      data-testid="button-register"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء الحساب"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-gray-400 mt-6">
              بتسجيلك، أنت توافق على{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">سياسة الخصوصية</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
