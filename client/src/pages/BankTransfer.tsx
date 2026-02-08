import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Building2, CreditCard, CheckCircle2, Copy, Image, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DONATION_TYPES = [
  { value: "water", label: "سقيا الماء" },
  { value: "food", label: "إطعام الجائع" },
  { value: "iftar", label: "إفطار صائم" },
  { value: "special-cases", label: "الحالات الخاصة" },
  { value: "general", label: "تبرع عام" },
];

export default function BankTransfer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const initialAmount = searchParams.get("amount") || "";
  const initialType = searchParams.get("type") || "";
  const donorNameParam = searchParams.get("donorName");
  const initialDonorName = donorNameParam ? decodeURIComponent(donorNameParam) : user?.name || "";
  const initialBankName = searchParams.get("bankName") ? decodeURIComponent(searchParams.get("bankName")!) : user?.bankName || "";
  const initialIban = searchParams.get("iban") ? decodeURIComponent(searchParams.get("iban")!) : user?.iban || "";

  const [formData, setFormData] = useState({
    donorName: initialDonorName,
    donorPhone: user?.mobile || "",
    amount: initialAmount,
    type: initialType,
    bankName: initialBankName,
    iban: initialIban,
    transferDate: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  
  const { data: bankAccounts } = useQuery<any[]>({
    queryKey: ['/api/bank-accounts'],
  });
  
  const submitMutation = useMutation({
    mutationFn: async (data: { formData: typeof formData, file: File }) => {
      const submitFormData = new FormData();
      submitFormData.append('donorName', data.formData.donorName);
      submitFormData.append('donorPhone', data.formData.donorPhone);
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
      toast({
        title: "تم بنجاح",
        description: "تم استلام إيصال التحويل وسيتم مراجعته قريباً",
      });
      setFormData({
        donorName: "",
        donorPhone: "",
        amount: "",
        type: "",
        bankName: "",
        transferDate: "",
        notes: ""
      });
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
    
    if (!formData.amount || !formData.type || !receiptFile) {
      toast({
        title: "بيانات ناقصة",
        description: "الرجاء تعبئة جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    submitMutation.mutate({ formData, file: receiptFile }, {
      onSuccess: () => {
        toast({
          title: "تم بنجاح",
          description: "تم استلام إيصال التحويل وسيتم مراجعته قريباً",
        });
        setLocation("/profile");
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
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-2 bg-gradient-to-l from-emerald-500 to-emerald-600" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">مصرف الراجحي</h3>
                            <p className="text-sm text-muted-foreground">Al Rajhi Bank</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">اسم الحساب</p>
                          <p className="font-medium">جمعية طويق للخدمات الإنسانية</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">رقم الآيبان (IBAN)</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono">
                              SA3080000589608019567923
                            </code>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyIban("SA3080000589608019567923")}
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
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-2 bg-gradient-to-l from-blue-500 to-blue-600" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">البنك العربي الوطني</h3>
                            <p className="text-sm text-muted-foreground">Arab National Bank</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">اسم الحساب</p>
                          <p className="font-medium">طويق للخدمات الإنسانية</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">رقم الآيبان (IBAN)</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono">
                              SA6930400108095810360018
                            </code>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyIban("SA6930400108095810360018")}
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
                          <SelectContent>
                            {DONATION_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
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
