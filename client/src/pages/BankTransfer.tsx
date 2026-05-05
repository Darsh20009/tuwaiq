import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Building2, CreditCard, CheckCircle2, Copy, Image, Send } from "lucide-react";
import alRajhiLogo from "@assets/image_1774519535375.png";
import bankAlbiladLogo from "@assets/image_1774519559474.png";
import anbLogo from "@assets/image_1774519613573.png";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";

const DONATION_TYPES = [
  { value: "water", label: "سقيا الماء" },
  { value: "food", label: "إطعام الجائع" },
  { value: "iftar", label: "إفطار صائم" },
  { value: "ramadan-basket", label: "سلة رمضانية" },
  { value: "special-cases", label: "الحالات الخاصة" },
  { value: "general", label: "تبرع عام" },
];

export default function BankTransfer() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  useSEO({
    title: "التحويل البنكي",
    description: "تبرع عبر التحويل البنكي المباشر إلى جمعية طويق للخدمات الإنسانية — حسابات معتمدة لدى الراجحي والبنك العربي الوطني وبنك البلاد",
  });
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const initialAmount = searchParams.get("amount") || "";
  const initialType = searchParams.get("type") || "";
  const donorNameParam = searchParams.get("donorName");
  const initialDonorName = donorNameParam ? decodeURIComponent(donorNameParam) : user?.name || "";
  const initialBankName = searchParams.get("bankName") ? decodeURIComponent(searchParams.get("bankName")!) : (user as any)?.bankName || "";
  const initialIban = searchParams.get("iban") ? decodeURIComponent(searchParams.get("iban")!) : (user as any)?.iban || "";

  const [formData, setFormData] = useState({
    donorName: initialDonorName,
    donorPhone: user?.mobile || "",
    donorEmail: (user as any)?.email || "",
    amount: initialAmount,
    type: initialType,
    bankName: initialBankName,
    iban: initialIban,
    transferDate: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        donorName: prev.donorName || user.name || "",
        donorPhone: prev.donorPhone || (user as any).mobile || "",
        donorEmail: prev.donorEmail || (user as any).email || "",
      }));
    }
  }, [user]);

  const { data: bankAccounts } = useQuery<any[]>({
    queryKey: ['/api/bank-accounts'],
  });
  
  const submitMutation = useMutation({
    mutationFn: async (data: { formData: typeof formData, file: File }) => {
      const submitFormData = new FormData();
      submitFormData.append('donorName', data.formData.donorName);
      submitFormData.append('donorPhone', data.formData.donorPhone);
      submitFormData.append('donorEmail', data.formData.donorEmail || '');
      submitFormData.append('amount', data.formData.amount);
      submitFormData.append('type', data.formData.type);
      submitFormData.append('bankName', data.formData.bankName);
      submitFormData.append('transferDate', data.formData.transferDate);
      submitFormData.append('notes', data.formData.notes);
      submitFormData.append('file', data.file);
      
      const res = await fetch('/api/bank-transfers', {
        method: 'POST',
        body: submitFormData
      });
      if (!res.ok) throw new Error('Failed to submit');
      return res.json();
    },
    onSuccess: () => {
      setReceiptFile(null);
      setReceiptPreview("");
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الإيصال",
        variant: "destructive"
      });
    }
  });
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const copyIban = async (iban: string) => {
    await navigator.clipboard.writeText(iban);
    toast({ title: "تم النسخ", description: "تم نسخ رقم الآيبان" });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.type) {
      toast({
        title: "بيانات ناقصة",
        description: "الرجاء تعبئة المبلغ ونوع التبرع",
        variant: "destructive"
      });
      return;
    }

    if (!receiptFile) {
      toast({
        title: "صورة الإيصال مطلوبة",
        description: "الرجاء رفع صورة إيصال التحويل البنكي",
        variant: "destructive"
      });
      return;
    }
    
    submitMutation.mutate({ formData, file: receiptFile }, {
      onSuccess: () => {
        setLocation(`/donation-success?amount=${formData.amount}&campaignName=${encodeURIComponent(formData.type === "water" ? "سقيا الماء" : formData.type === "ramadan-basket" ? "سلة رمضانية" : formData.type === "iftar" ? "إفطار صائم" : "تبرع عام")}&method=transfer`);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">التحويل البنكي</h1>
            <p className="text-white/80">تبرع عبر التحويل البنكي المباشر</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bank Accounts */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading">الحسابات البنكية</h2>
              <p className="text-muted-foreground">
                قم بالتحويل إلى أحد الحسابات التالية ثم ارفع إيصال التحويل
              </p>
              
              <div className="space-y-4">
                {/* Rajhi Bank */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-emerald-50 to-white hover:shadow-xl transition-shadow cursor-pointer" onClick={() => copyIban("SA3080000589608019567923")}>
                    <div className="h-2 bg-gradient-to-l from-emerald-500 to-emerald-600" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                            <img src={alRajhiLogo} alt="مصرف الراجحي" className="w-full h-full object-contain p-1" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">مصرف الراجحي</h3>
                            <p className="text-sm text-muted-foreground">Al Rajhi Bank</p>
                          </div>
                        </div>
                        <div className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          نسخ سريع
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-bold">اسم الحساب</p>
                          <p className="font-medium text-emerald-900 bg-emerald-100/30 p-2 rounded-md">جمعية طويق للخدمات الإنسانية</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-bold">رقم الآيبان (IBAN)</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-emerald-900 text-emerald-50 px-3 py-3 rounded-lg text-sm font-mono font-bold shadow-inner">
                              SA3080000589608019567923
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-emerald-600 hover:bg-emerald-100"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Arab National Bank */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" onClick={() => copyIban("SA6930400108095810360018")}>
                    <div className="h-2 bg-gradient-to-l from-blue-500 to-blue-600" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                            <img src={anbLogo} alt="البنك العربي الوطني" className="w-full h-full object-contain p-1" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">البنك العربي الوطني</h3>
                            <p className="text-sm text-muted-foreground">Arab National Bank (ANB)</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-bold">اسم الحساب</p>
                          <p className="font-medium bg-blue-50 p-2 rounded-md">جمعية طويق للخدمات الإنسانية</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-bold">رقم الآيبان (IBAN)</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-blue-900 text-blue-50 px-3 py-3 rounded-lg text-sm font-mono font-bold shadow-inner">SA6930400108095810390018</code>
                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Bank AlBilad */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" onClick={() => copyIban("SA23150009999146128000007")}>
                    <div className="h-2 bg-gradient-to-l from-orange-500 to-orange-600" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                            <img src={bankAlbiladLogo} alt="بنك البلاد" className="w-full h-full object-contain p-1" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">بنك البلاد</h3>
                            <p className="text-sm text-muted-foreground">Bank AlBilad</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-bold">اسم الحساب</p>
                          <p className="font-medium bg-orange-50 p-2 rounded-md">جمعية طويق للخدمات الإنسانية</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-bold">رقم الآيبان (IBAN)</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-orange-900 text-orange-50 px-3 py-3 rounded-lg text-sm font-mono font-bold shadow-inner">SA2315000999146128000007</code>
                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Upload Form */}
            <div>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    رفع إيصال التحويل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="donorName">اسم المتبرع</Label>
                        <Input
                          id="donorName"
                          value={formData.donorName}
                          onChange={(e) => setFormData(prev => ({ ...prev, donorName: e.target.value }))}
                          placeholder="الاسم الكريم"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donorPhone">رقم الجوال</Label>
                        <Input
                          id="donorPhone"
                          type="tel"
                          value={formData.donorPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, donorPhone: e.target.value }))}
                          placeholder="05xxxxxxxx"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donorEmail">
                        البريد الإلكتروني
                        <span className="text-xs text-muted-foreground mr-2">(لاستلام تنبيهات حالة تبرعك)</span>
                      </Label>
                      <Input
                        id="donorEmail"
                        type="email"
                        value={formData.donorEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, donorEmail: e.target.value }))}
                        placeholder="example@email.com"
                        dir="ltr"
                        data-testid="input-donor-email"
                        autoComplete="email"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">مبلغ التحويل *</Label>
                        <Input
                          id="amount"
                          type="number"
                          required
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">نوع التبرع *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع التبرع" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 shadow-xl">
                            <SelectItem value="water" className="py-3 hover:bg-emerald-50 cursor-pointer border-b">سقيا الماء</SelectItem>
                            <SelectItem value="ramadan-basket" className="py-3 hover:bg-emerald-50 cursor-pointer border-b">سلة رمضانية</SelectItem>
                            <SelectItem value="iftar" className="py-3 hover:bg-emerald-50 cursor-pointer border-b">إفطار صائم</SelectItem>
                            <SelectItem value="special-cases" className="py-3 hover:bg-emerald-50 cursor-pointer border-b">الحالات الخاصة</SelectItem>
                            <SelectItem value="general" className="py-3 hover:bg-emerald-50 cursor-pointer">تبرع عام</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">البنك المحول منه</Label>
                        <Input
                          id="bankName"
                          value={formData.bankName}
                          onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="اسم البنك"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transferDate">تاريخ التحويل</Label>
                        <Input
                          id="transferDate"
                          type="date"
                          value={formData.transferDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Receipt Upload */}
                    <div className="space-y-2">
                      <Label>صورة الإيصال *</Label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                          ${receiptPreview ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                      >
                        {receiptPreview ? (
                          <div className="space-y-4">
                            <img
                              src={receiptPreview}
                              alt="Receipt"
                              className="max-h-48 mx-auto rounded-lg shadow-md"
                            />
                            <div className="flex items-center justify-center gap-2 text-primary">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="font-medium">تم رفع الصورة</span>
                            </div>
                            <p className="text-sm text-muted-foreground">اضغط لتغيير الصورة</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                              <Image className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">اضغط لرفع صورة الإيصال</p>
                              <p className="text-sm text-muted-foreground">PNG, JPG حتى 10MB</p>
                            </div>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">ملاحظات إضافية</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="أي ملاحظات أو توجيهات..."
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-bold bg-gradient-brand"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? (
                        "جاري الإرسال..."
                      ) : (
                        <>
                          <Send className="w-5 h-5 ml-2" />
                          إرسال الإيصال
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
