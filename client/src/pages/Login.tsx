import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isPending } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
  });

  const [resetData, setResetData] = useState({
    mobile: "",
    newPassword: "",
  });
  const [isResetting, setIsResetting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ mobile: formData.mobile, password: formData.password });
      setLocation("/");
    } catch (error) {
      // Handled by hook
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ 
        name: formData.name, 
        mobile: formData.mobile, 
        password: formData.password,
        isPublicDonor: true,
        role: "user"
      } as any);
      setIsLogin(true);
    } catch (error) {
      // Handled by hook
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", resetData);
      toast({
        title: "تم بنجاح",
        description: "تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول",
      });
      setResetData({ mobile: "", newPassword: "" });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-300">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-heading text-primary">
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </CardTitle>
            <CardDescription>
              {isLogin ? "أهلاً بك مجدداً في بوابة العطاء" : "انضم إلينا وكن جزءاً من مسيرة الخير"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" onValueChange={(v) => setIsLogin(v === "login")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">دخول</TabsTrigger>
                <TabsTrigger value="register">تسجيل</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile">رقم الجوال</Label>
                    <Input 
                      id="mobile" 
                      placeholder="05xxxxxxxx" 
                      dir="ltr" 
                      className="text-right"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      required
                      data-testid="input-mobile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        data-testid="input-password"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="px-0 font-normal text-muted-foreground hover:text-primary h-auto" data-testid="button-forgot-password">
                          نسيت كلمة المرور؟
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
                          <DialogDescription>
                            أدخل رقم الجوال وكلمة المرور الجديدة لإعادة التعيين.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reset-mobile">رقم الجوال</Label>
                            <Input 
                              id="reset-mobile" 
                              placeholder="05xxxxxxxx" 
                              dir="ltr" 
                              className="text-right"
                              value={resetData.mobile}
                              onChange={(e) => setResetData(p => ({ ...p, mobile: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reset-password">كلمة المرور الجديدة</Label>
                            <Input 
                              id="reset-password" 
                              type="password"
                              value={resetData.newPassword}
                              onChange={(e) => setResetData(p => ({ ...p, newPassword: e.target.value }))}
                              required
                            />
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
                  <Button type="submit" className="w-full bg-gradient-brand mt-4" disabled={isPending} data-testid="button-login">
                    {isPending ? <Loader2 className="animate-spin" /> : "دخول"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input 
                      id="name" 
                      placeholder="اسمك الكريم" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      data-testid="input-register-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">رقم الجوال</Label>
                    <Input 
                      id="mobile" 
                      placeholder="05xxxxxxxx" 
                      dir="ltr" 
                      className="text-right"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      required
                      data-testid="input-register-mobile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        data-testid="input-register-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-brand mt-4" disabled={isPending} data-testid="button-register">
                    {isPending ? <Loader2 className="animate-spin" /> : "تسجيل حساب"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4 bg-muted/10">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1" data-testid="link-home">
              العودة للرئيسية <ArrowRight className="w-3 h-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
