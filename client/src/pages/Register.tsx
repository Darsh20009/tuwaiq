import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, isPending } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ 
        ...formData,
        isPublicDonor: true,
        role: "user"
      } as any);
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في منصة تواق، تم تسجيل دخولك تلقائياً",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "فشل إنشاء الحساب",
        description: error.message || "يرجى التأكد من البيانات والمحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30" dir="rtl">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-300">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-heading text-primary">
              إنشاء حساب جديد
            </CardTitle>
            <CardDescription>
              انضم إلينا وكن جزءاً من مسيرة الخير في منصة تواق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  الاسم الكامل
                </Label>
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
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  البريد الإلكتروني
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="example@domain.com" 
                  dir="ltr"
                  className="text-right"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  data-testid="input-register-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  رقم الجوال
                </Label>
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
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  كلمة المرور
                </Label>
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-brand mt-6 h-11 text-lg" disabled={isPending} data-testid="button-register-submit">
                {isPending ? <Loader2 className="animate-spin ml-2" /> : null}
                إنشاء الحساب
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4 border-t p-6 bg-muted/10">
            <div className="text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-primary font-bold hover:underline" data-testid="link-login">
                تسجيل الدخول
              </Link>
            </div>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1" data-testid="link-home">
              العودة للرئيسية <ArrowRight className="w-3 h-3 rotate-180" />
            </Link>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
