import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Home, Share2, Award, Heart, Building2, Twitter, Copy, Check, RefreshCw } from "lucide-react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DonationSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const amount = params.get("amount");
  const campaignName = params.get("campaignName") || "تبرع عام";
  const method = params.get("method");
  const isTransfer = method === "transfer";
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const siteUrl = "https://tuwaiqassociation.sa";
  const shareText = `🤲 ساهمت في ${campaignName} بمبلغ ${amount} ريال عبر جمعية طويق للخدمات الإنسانية\n\nيمكنك التبرع أيضاً: ${siteUrl}/donate`;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleTwitter = () => {
    const tweetText = `🤲 ساهمت في ${campaignName} بمبلغ ${amount} ريال عبر جمعية طويق للخدمات الإنسانية\n\n${siteUrl}/donate`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, "_blank");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({ title: "تم النسخ!", description: "تم نسخ رسالة المشاركة" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "تعذّر النسخ", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-none shadow-2xl overflow-hidden ring-1 ring-primary/5">
            <CardHeader className={`p-12 text-center text-white relative ${isTransfer ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-primary"}`}>
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                <Heart className="w-64 h-64 -translate-y-12 -translate-x-12 rotate-12" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center p-4 rounded-full bg-white/20 mb-6 backdrop-blur-md"
              >
                {isTransfer ? <Clock className="w-16 h-16" /> : <CheckCircle2 className="w-16 h-16" />}
              </motion.div>
              <CardTitle className="text-4xl font-bold mb-2">
                {isTransfer ? "جزاكم الله خيراً!" : "تقبل الله طاعتكم!"}
              </CardTitle>
              <p className="text-lg text-white/90">
                {isTransfer
                  ? "تم استلام إيصال التحويل وسيتم مراجعته خلال 24 ساعة"
                  : "تم استلام تبرعكم بنجاح ومساهمتكم تصنع الأثر"}
              </p>
            </CardHeader>

            <CardContent className="p-10 space-y-8">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-right border-b pb-8 border-primary/10">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">قيمة التبرع</p>
                  <p className="text-3xl font-bold text-primary">{amount ? `${Number(amount).toLocaleString("ar-SA")} ريال` : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">نوع التبرع</p>
                  <p className="text-xl font-bold text-foreground truncate">{campaignName}</p>
                </div>
              </div>

              {/* Status notice for bank transfer */}
              {isTransfer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl"
                >
                  <Building2 className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800 mb-1">حالة الإيصال: قيد المراجعة</p>
                    <p className="text-sm text-amber-700">
                      سيتم التحقق من إيصال التحويل ومراجعته من قِبل فريقنا. يمكنك التواصل معنا على{" "}
                      <a href="tel:+966505793012" className="font-bold underline">+966505793012</a>{" "}
                      لمتابعة حالة التبرع.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Share Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  شاركوا الخير
                </h3>
                <p className="text-muted-foreground text-sm">
                  كل من يشارك رسالة تبرعك قد يلهم آخرين للمساهمة — فيكون لك أجرهم
                </p>

                {/* Share Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={handleWhatsApp}
                    className="gap-2 font-bold bg-green-600 hover:bg-green-700 h-11"
                    data-testid="button-share-whatsapp"
                  >
                    <Share2 className="w-4 h-4" />
                    واتساب
                  </Button>
                  <Button
                    onClick={handleTwitter}
                    className="gap-2 font-bold bg-black hover:bg-gray-900 h-11"
                    data-testid="button-share-twitter"
                  >
                    <Twitter className="w-4 h-4" />
                    تويتر
                  </Button>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="gap-2 font-bold h-11"
                    data-testid="button-copy-share"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "تم النسخ" : "نسخ"}
                  </Button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-primary/10">
                <Link href="/" className="flex-1">
                  <Button className="w-full h-12 gap-2 text-lg font-bold" data-testid="button-back-home">
                    <Home className="w-5 h-5" />
                    العودة للرئيسية
                  </Button>
                </Link>
                <Link href="/donate" className="flex-1">
                  <Button variant="outline" className="w-full h-12 gap-2 text-lg font-bold" data-testid="button-donate-again">
                    <RefreshCw className="w-5 h-5" />
                    تبرع مجدداً
                  </Button>
                </Link>
              </div>

              {/* Footer note */}
              <p className="text-center text-xs text-muted-foreground">
                جمعية طويق للخدمات الإنسانية — رقم السجل: 1000820300 | ترخيص: 17660
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
