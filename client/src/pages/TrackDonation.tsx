import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/use-seo";
import { Search, Phone, CheckCircle2, Clock, Loader2, Heart } from "lucide-react";

interface TrackedDonation {
  id: string;
  amount: number;
  campaignTitle: string;
  createdAt: string;
  status: string;
}

export default function TrackDonation() {
  useSEO({
    title: "تتبع التبرعات | جمعية طويق للخدمات الإنسانية",
    description: "تتبع تبرعاتك بإدخال رقم جوالك",
  });

  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<TrackedDonation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 9) {
      setError("يرجى إدخال رقم جوال صحيح");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const r = await fetch(`/api/donations/track?phone=${encodeURIComponent(clean)}`);
      if (!r.ok) throw new Error("خطأ في البحث");
      const data = await r.json();
      setResults(data);
    } catch {
      setError("حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = results?.reduce((s, d) => s + (d.amount || 0), 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading">تتبع تبرعاتك</h1>
            <p className="mt-3 text-white/80 max-w-md mx-auto">
              أدخل رقم جوالك لعرض سجل تبرعاتك المؤكدة
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-xl" dir="rtl">
          <Card className="shadow-lg border-primary/10">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Phone className="w-4 h-4" />
                  <span>رقم الجوال</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className="text-left"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    data-testid="input-phone-track"
                  />
                  <Button onClick={handleSearch} disabled={loading} className="gap-2 shrink-0" data-testid="btn-search-donations">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    بحث
                  </Button>
                </div>
                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {searched && !loading && results !== null && (
            <div className="mt-6 space-y-4">
              {results.length === 0 ? (
                <Card>
                  <CardContent className="py-14 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="font-semibold text-muted-foreground">لا توجد تبرعات مسجلة</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      تأكد من صحة رقم الجوال أو أن التبرع قد تم عبر نفس الرقم
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">سجل التبرعات</h2>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">الإجمالي المؤكد</p>
                      <p className="font-bold text-primary text-lg">{totalAmount.toLocaleString("ar-SA")} ر.س</p>
                    </div>
                  </div>
                  {results.map((d) => (
                    <Card key={d.id} className="border-border/60">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{d.campaignTitle || "تبرع عام"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(d.createdAt).toLocaleDateString("ar-SA", {
                                year: "numeric", month: "long", day: "numeric"
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <p className="font-bold text-primary">{(d.amount || 0).toLocaleString("ar-SA")} ر.س</p>
                          <Badge variant="outline" className="text-xs mt-1 text-green-600 border-green-200 bg-green-50">
                            مؤكد
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
