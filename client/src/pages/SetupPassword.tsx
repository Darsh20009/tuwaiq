import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SetupPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || "";
    setToken(t);
    if (!t) { setVerifying(false); return; }
    fetch(`/api/auth/verify-setup-token?token=${t}`)
      .then(r => r.json())
      .then(data => {
        if (data.name) { setTokenValid(true); setEmployeeInfo(data); }
        else { setTokenValid(false); }
      })
      .catch(() => setTokenValid(false))
      .finally(() => setVerifying(false));
  }, []);

  const roleLabels: Record<string, string> = {
    delivery: "موظف توصيل", programmer: "مبرمج", accountant: "محاسب",
    sales: "موظف مبيعات", employee: "موظف", manager: "مدير", admin: "مدير النظام",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast({ title: "كلمة المرور قصيرة جداً", description: "يجب أن تكون 8 أحرف على الأقل", variant: "destructive" }); return; }
    if (password !== confirm) { toast({ title: "كلمتا المرور غير متطابقتين", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/setup-password", { token, password });
      setDone(true);
      toast({ title: "✓ تم إعداد كلمة المرور", description: "يمكنك الآن تسجيل الدخول" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "حدث خطأ", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">جارٍ التحقق من الرابط...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-lg">ط</div>
          <h1 className="text-2xl font-black text-primary">جمعية طويق</h1>
          <p className="text-sm text-muted-foreground">للخدمات الإنسانية</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">
              {done ? "تم بنجاح!" : !tokenValid ? "رابط غير صالح" : "إعداد كلمة المرور"}
            </CardTitle>
            <CardDescription>
              {done ? "يمكنك الآن تسجيل الدخول بحسابك الجديد"
                : !tokenValid ? "هذا الرابط غير صالح أو انتهت صلاحيته. تواصل مع الإدارة."
                : `مرحباً ${employeeInfo?.name}! قم بإعداد كلمة مرور لحسابك`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {done ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <Button className="w-full" onClick={() => setLocation("/login")}>
                  تسجيل الدخول الآن
                </Button>
              </div>
            ) : !tokenValid ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>
                  العودة للرئيسية
                </Button>
              </div>
            ) : (
              <>
                {employeeInfo && (
                  <div className="bg-primary/5 rounded-xl p-4 mb-5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الاسم</span>
                      <span className="font-bold">{employeeInfo.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">المعرف الوظيفي</span>
                      <span className="font-bold text-primary font-mono">{employeeInfo.employeeId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الدور</span>
                      <span className="font-bold">{roleLabels[employeeInfo.role] || employeeInfo.role}</span>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPw ? "text" : "password"}
                        placeholder="8 أحرف على الأقل"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pr-10 pl-10"
                        data-testid="input-password"
                        required
                      />
                      <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>تأكيد كلمة المرور</Label>
                    <Input
                      type="password"
                      placeholder="أعد كتابة كلمة المرور"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      data-testid="input-confirm-password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting} data-testid="button-setup-password">
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جارٍ الحفظ...</> : "حفظ كلمة المرور"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
