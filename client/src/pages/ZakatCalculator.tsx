import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Heart, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { motion, AnimatePresence } from "framer-motion";

const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;
const GOLD_PRICE_PER_GRAM = 310;
const SILVER_PRICE_PER_GRAM = 3.5;
const ZAKAT_RATE = 0.025;

interface ZakatFields {
  cash: string;
  gold: string;
  silver: string;
  tradeGoods: string;
  receivables: string;
  investments: string;
  debts: string;
}

export default function ZakatCalculator() {
  useSEO({
    title: "حاسبة الزكاة",
    description: "احسب زكاتك بدقة وتبرع مباشرة عبر جمعية طويق للخدمات الإنسانية",
  });

  const [fields, setFields] = useState<ZakatFields>({
    cash: "",
    gold: "",
    silver: "",
    tradeGoods: "",
    receivables: "",
    investments: "",
    debts: "",
  });
  const [showDetails, setShowDetails] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const setField = (key: keyof ZakatFields, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
    setCalculated(false);
  };

  const val = (key: keyof ZakatFields) => parseFloat(fields[key] || "0") || 0;

  const goldValue = val("gold") * GOLD_PRICE_PER_GRAM;
  const silverValue = val("silver") * SILVER_PRICE_PER_GRAM;
  const totalAssets = val("cash") + goldValue + silverValue + val("tradeGoods") + val("receivables") + val("investments");
  const netWealth = Math.max(0, totalAssets - val("debts"));
  const nisabValue = Math.min(GOLD_NISAB_GRAMS * GOLD_PRICE_PER_GRAM, SILVER_NISAB_GRAMS * SILVER_PRICE_PER_GRAM);
  const meetsNisab = netWealth >= nisabValue;
  const zakatAmount = meetsNisab ? netWealth * ZAKAT_RATE : 0;

  const handleCalculate = () => setCalculated(true);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "hsl(35 28% 97%)" }}>
      <Navbar />
      <main className="flex-1" dir="rtl">
        {/* Hero */}
        <div className="py-12 md:py-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(38 85% 40%) 0%, hsl(38 85% 52%) 100%)" }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 border" style={{ backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
              <Calculator className="w-4 h-4" />
              حاسبة الزكاة الشرعية
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3">احسب زكاتك بدقة</h1>
            <p className="text-white/80 text-lg max-w-md mx-auto">أدّ فريضتك بيسر — أدخل أصولك وسنحسب زكاتك وفق النصاب الشرعي</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calculator Form */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cash & Bank */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-sm">💰</span>
                    النقد والأرصدة البنكية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>المبلغ النقدي وأرصدة الحسابات البنكية (ريال)</Label>
                    <Input type="number" placeholder="0" value={fields.cash} onChange={e => setField("cash", e.target.value)} className="text-left" dir="ltr" />
                  </div>
                </CardContent>
              </Card>

              {/* Gold & Silver */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-700 text-sm">🥇</span>
                    الذهب والفضة
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الذهب (جرام)</Label>
                    <Input type="number" placeholder="0" value={fields.gold} onChange={e => setField("gold", e.target.value)} dir="ltr" />
                    <p className="text-xs text-muted-foreground">سعر الجرام: {GOLD_PRICE_PER_GRAM} ريال</p>
                  </div>
                  <div className="space-y-2">
                    <Label>الفضة (جرام)</Label>
                    <Input type="number" placeholder="0" value={fields.silver} onChange={e => setField("silver", e.target.value)} dir="ltr" />
                    <p className="text-xs text-muted-foreground">سعر الجرام: {SILVER_PRICE_PER_GRAM} ريال</p>
                  </div>
                </CardContent>
              </Card>

              {/* Trade & Investments */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-700 text-sm">📈</span>
                    التجارة والاستثمارات
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>بضاعة التجارة (ريال)</Label>
                    <Input type="number" placeholder="0" value={fields.tradeGoods} onChange={e => setField("tradeGoods", e.target.value)} dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>الاستثمارات والأسهم (ريال)</Label>
                    <Input type="number" placeholder="0" value={fields.investments} onChange={e => setField("investments", e.target.value)} dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>الديون المستردة (ريال)</Label>
                    <Input type="number" placeholder="0" value={fields.receivables} onChange={e => setField("receivables", e.target.value)} dir="ltr" />
                  </div>
                </CardContent>
              </Card>

              {/* Debts */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-700 text-sm">📋</span>
                    الديون المستحقة عليك
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>الديون الواجبة السداد هذا العام (ريال)</Label>
                    <Input type="number" placeholder="0" value={fields.debts} onChange={e => setField("debts", e.target.value)} dir="ltr" />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleCalculate} className="w-full h-12 text-lg font-bold bg-primary gap-2">
                <Calculator className="w-5 h-5" />
                احسب الزكاة
              </Button>
            </div>

            {/* Result Panel */}
            <div className="space-y-4">
              <AnimatePresence>
                {calculated && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={`border-2 shadow-lg ${meetsNisab ? "border-primary" : "border-amber-400"}`}>
                      <CardContent className="p-6 space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">مجموع الأصول الزكوية</p>
                          <p className="text-2xl font-black text-foreground">{netWealth.toLocaleString("ar-SA", { maximumFractionDigits: 2 })} ر.س</p>
                        </div>
                        <Separator />
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">النصاب الشرعي</p>
                          <p className="text-sm font-bold">{nisabValue.toLocaleString("ar-SA", { maximumFractionDigits: 0 })} ر.س</p>
                          <Badge className={`mt-2 ${meetsNisab ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {meetsNisab ? "✓ بلغ النصاب" : "لم يبلغ النصاب"}
                          </Badge>
                        </div>
                        {meetsNisab && (
                          <>
                            <Separator />
                            <div className="text-center bg-primary/5 rounded-xl p-4">
                              <p className="text-sm text-muted-foreground mb-1">زكاتك المستحقة (2.5%)</p>
                              <p className="text-3xl font-black text-primary">{zakatAmount.toLocaleString("ar-SA", { maximumFractionDigits: 2 })}</p>
                              <p className="text-sm font-bold text-primary">ريال سعودي</p>
                            </div>
                            <Link href={`/donate?amount=${Math.ceil(zakatAmount)}&type=zakat`}>
                              <Button className="w-full gap-2 bg-primary font-bold">
                                <Heart className="w-4 h-4" />
                                أدّ زكاتك الآن
                              </Button>
                            </Link>
                          </>
                        )}
                        {!meetsNisab && (
                          <div className="bg-amber-50 rounded-xl p-4 text-center">
                            <p className="text-sm text-amber-700">أصولك لم تبلغ النصاب بعد، لا زكاة عليك حالياً</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info Card */}
              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="p-4">
                  <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between text-right">
                    <span className="text-sm font-bold text-blue-800 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      معلومات عن النصاب
                    </span>
                    {showDetails ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
                  </button>
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 space-y-2 text-xs text-blue-700">
                          <p>• نصاب الذهب: {GOLD_NISAB_GRAMS} جرام ≈ {(GOLD_NISAB_GRAMS * GOLD_PRICE_PER_GRAM).toLocaleString()} ريال</p>
                          <p>• نصاب الفضة: {SILVER_NISAB_GRAMS} جرام ≈ {(SILVER_NISAB_GRAMS * SILVER_PRICE_PER_GRAM).toLocaleString()} ريال</p>
                          <p>• تُعتمد أقل القيمتين لصالح الفقراء</p>
                          <p>• نسبة الزكاة: ربع العشر (2.5%)</p>
                          <p>• شرط الحول: مرور سنة هجرية كاملة</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Summary if calculated */}
              {calculated && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-bold text-foreground">تفاصيل الحساب</p>
                    {val("cash") > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">النقد والأرصدة</span><span className="font-medium">{val("cash").toLocaleString()} ر.س</span></div>}
                    {val("gold") > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">الذهب ({val("gold")} جرام)</span><span className="font-medium">{goldValue.toLocaleString()} ر.س</span></div>}
                    {val("silver") > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">الفضة ({val("silver")} جرام)</span><span className="font-medium">{silverValue.toLocaleString()} ر.س</span></div>}
                    {val("tradeGoods") > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">بضاعة التجارة</span><span className="font-medium">{val("tradeGoods").toLocaleString()} ر.س</span></div>}
                    {val("investments") > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">الاستثمارات</span><span className="font-medium">{val("investments").toLocaleString()} ر.س</span></div>}
                    {val("receivables") > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">الديون المستردة</span><span className="font-medium">{val("receivables").toLocaleString()} ر.س</span></div>}
                    {val("debts") > 0 && <div className="flex justify-between text-xs text-red-600"><span>الديون المخصومة</span><span className="font-medium">-{val("debts").toLocaleString()} ر.س</span></div>}
                    <Separator />
                    <div className="flex justify-between text-sm font-bold"><span>الوعاء الزكوي</span><span className="text-primary">{netWealth.toLocaleString("ar-SA", { maximumFractionDigits: 0 })} ر.س</span></div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
