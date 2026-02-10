import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User, Shield, Heart, Coins, History, CheckCircle2, Clock, XCircle, FileText, Award, Edit2, Save, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Donation } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, isLoading, togglePrivacy } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
  });

  const { data: donations } = useQuery<Donation[]>({
    queryKey: ["/api/donations"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
      toast({
        title: "تم التحديث",
        description: "تم حفظ التعديلات بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث الملف الشخصي",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
    if (user) {
      setEditData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              {isEditing ? (
                <div className="space-y-3 flex-1 min-w-[200px]">
                  <div className="space-y-1">
                    <Label htmlFor="edit-name">الاسم</Label>
                    <Input 
                      id="edit-name" 
                      value={editData.name} 
                      onChange={(e) => setEditData(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                    <Input 
                      id="edit-email" 
                      type="email"
                      value={editData.email} 
                      onChange={(e) => setEditData(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold font-heading">{user.name}</h1>
                  <p className="text-muted-foreground font-mono" dir="ltr">{user.mobile}</p>
                  {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {isEditing ? (
                <>
                  <Button 
                    size="sm" 
                    className="gap-2" 
                    onClick={() => updateProfileMutation.mutate(editData)}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="w-4 h-4" /> حفظ
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2" 
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="w-4 h-4" /> إلغاء
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4" /> تعديل
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي التبرعات</CardTitle>
                <Heart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{Number(user.totalDonations).toLocaleString()} SAR</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">نقاط العطاء</CardTitle>
                <Coins className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{user.points || 0}</div>
                <p className="text-xs text-muted-foreground">10 نقاط لكل 1 ريال</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">عدد المساهمات</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{donations?.length || 0}</div>
                <p className="text-xs text-muted-foreground">عملية تبرع</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معلومات البنك</CardTitle>
                <History className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xs font-medium truncate">{user.bankName || "لم يتم الحفظ"}</div>
                <p className="text-[10px] text-muted-foreground truncate" dir="ltr">{user.iban || "IBAN غير متوفر"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                سجل التبرعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!donations || donations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا يوجد تبرعات سابقة</p>
                ) : (
                  donations.map((donation: any) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          donation.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                          donation.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {donation.status === 'confirmed' ? <CheckCircle2 className="w-5 h-5" /> : 
                           donation.status === 'rejected' ? <XCircle className="w-5 h-5" /> : 
                           <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold">{donation.amount} SAR</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(donation.createdAt).toLocaleDateString('ar-SA')} - {
                              donation.type === 'zakat' ? 'زكاة' : 
                              donation.type === 'waqf' ? 'وقف' : 'عام'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          donation.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                          donation.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {donation.status === 'confirmed' ? 'مؤكد' : 
                           donation.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                        </span>
                        {donation.status === 'confirmed' && (
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8" title="الفاتورة">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" title="الشهادة">
                              <Award className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                إعدادات الخصوصية
              </CardTitle>
              <CardDescription>تحكم في كيفية ظهور معلوماتك للآخرين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="space-y-1">
                  <Label htmlFor="public-profile" className="text-base font-medium">
                    الظهور في قائمة الشرف
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    عند التفعيل، سيظهر اسمك ومجموع تبرعاتك في صفحة قائمة الشرف العامة.
                  </p>
                </div>
                <Switch
                  id="public-profile"
                  checked={user.isPublicDonor || false}
                  onCheckedChange={(checked) => togglePrivacy(checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
             <Link href="/donate">
               <Button className="bg-gradient-brand shadow-lg">تبرع جديد</Button>
             </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
