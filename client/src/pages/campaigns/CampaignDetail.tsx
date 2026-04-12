import { useParams, Link, useLocation } from "wouter";
import { useCampaign } from "@/hooks/use-campaigns";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Heart, Calendar, Target, Clock, Share2, QrCode, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";

export default function CampaignDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: campaign, isLoading } = useCampaign(id);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useSEO({
    title: campaign?.title || "المشروع الإنساني",
    description: campaign?.description || "ساهم في هذا المشروع الإنساني وكن شريكاً في صنع الفرق مع جمعية طويق للخدمات الإنسانية",
    image: (campaign as any)?.imageUrl || campaign?.image || "/images/og-banner2.png",
  });

  const campaignUrl = typeof window !== "undefined"
    ? `${window.location.origin}/campaigns/${id}`
    : `https://tuwaiqassociation.sa/campaigns/${id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setCopied(true);
      toast({ title: "تم نسخ الرابط!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "تعذّر النسخ", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12" dir="rtl">
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">الحملة غير موجودة</h1>
        <Link href="/campaigns">
          <Button>العودة للحملات</Button>
        </Link>
      </div>
    );
  }

  const currentAmount = campaign?.currentAmount || 0;
  const goalAmount = campaign?.goalAmount || 1;
  const progress = Math.min(100, (currentAmount / goalAmount) * 100);

  // Days remaining
  let daysLeft: number | null = null;
  let isExpired = false;
  if (campaign.endDate) {
    const end = new Date(campaign.endDate);
    const now = new Date();
    daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    isExpired = daysLeft <= 0;
  }

  const progressColor = progress >= 100 ? "bg-green-500" : progress >= 60 ? "bg-primary" : progress >= 30 ? "bg-amber-500" : "bg-red-400";

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12" dir="rtl">
        <nav className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
          <Link href="/campaigns" className="hover:text-primary">الحملات</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium truncate">
            {campaign.titleAr || campaign.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {campaign.image && (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl ring-1 ring-border/5">
                <img 
                  src={campaign.image} 
                  alt={campaign.titleAr || campaign.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 right-6">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {campaign.titleAr || campaign.title}
                  </h1>
                </div>
                {/* Badges on image */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {isExpired && (
                    <Badge className="bg-red-500 text-white font-bold">انتهت المدة</Badge>
                  )}
                  {!isExpired && daysLeft !== null && daysLeft <= 7 && (
                    <Badge className="bg-amber-500 text-white font-bold animate-pulse">
                      <Clock className="w-3 h-3 ml-1" />
                      يتبقى {daysLeft} يوم
                    </Badge>
                  )}
                  {progress >= 100 && (
                    <Badge className="bg-green-500 text-white font-bold">اكتمل الهدف! 🎉</Badge>
                  )}
                </div>
              </div>
            )}

            {!campaign.image && (
              <h1 className="text-4xl font-bold font-heading text-gradient">
                {campaign.titleAr || campaign.title}
              </h1>
            )}

            <Card className="border-none shadow-md overflow-hidden bg-background/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  عن هذه الحملة
                </h2>
                <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {campaign.descriptionAr || campaign.description}
                </div>
              </CardContent>
            </Card>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الهدف المالي</p>
                    <p className="text-xl font-bold">{campaign.goalAmount.toLocaleString()} ريال</p>
                  </div>
                </CardContent>
              </Card>
              {campaign.startDate && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ الانطلاق</p>
                      <p className="text-xl font-bold">
                        {new Date(campaign.startDate).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {campaign.endDate && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isExpired ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                      <p className="text-xl font-bold">
                        {new Date(campaign.endDate).toLocaleDateString("ar-SA")}
                      </p>
                      {daysLeft !== null && !isExpired && (
                        <p className="text-xs text-amber-600 font-bold">يتبقى {daysLeft} يوم</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Share section */}
            <Card className="border-none shadow-sm bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  شارك الحملة
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${campaign.titleAr || campaign.title}\n${campaignUrl}`)}`, "_blank")}
                    data-testid="button-share-whatsapp"
                  >
                    <Share2 className="w-4 h-4 text-green-600" />
                    واتساب
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${campaign.titleAr || campaign.title}\n${campaignUrl}`)}`, "_blank")}
                    data-testid="button-share-twitter"
                  >
                    <Share2 className="w-4 h-4 text-black" />
                    تويتر
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleCopyLink}
                    data-testid="button-copy-link"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "تم النسخ" : "نسخ الرابط"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowQR(!showQR)}
                    data-testid="button-show-qr"
                  >
                    <QrCode className="w-4 h-4" />
                    {showQR ? "إخفاء QR" : "رمز QR"}
                  </Button>
                </div>

                {showQR && (
                  <div className="mt-4 flex flex-col items-center gap-3 p-4 bg-white rounded-xl border">
                    <QRCodeSVG
                      value={campaignUrl}
                      size={160}
                      level="M"
                      includeMargin
                    />
                    <p className="text-xs text-muted-foreground">امسح الرمز للوصول للحملة مباشرةً</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24 border-none shadow-xl overflow-hidden ring-1 ring-primary/5">
              <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                <CardTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
                  <Heart className="w-6 h-6 fill-current" />
                  المساهمة الآن
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">المبلغ المجموع</p>
                      <p className="text-3xl font-bold text-primary">
                        {campaign.currentAmount.toLocaleString()} ريال
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground mb-1">النسبة</p>
                      <p className="text-xl font-bold text-primary">{Math.round(progress)}%</p>
                    </div>
                  </div>

                  {/* Enhanced progress bar */}
                  <div className="space-y-1.5">
                    <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span className="font-bold">{campaign.goalAmount.toLocaleString()} ريال</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    تمت المساهمة بـ {campaign.currentAmount.toLocaleString()} من أصل {campaign.goalAmount.toLocaleString()} ريال
                  </p>

                  {/* Time remaining banner */}
                  {daysLeft !== null && !isExpired && daysLeft <= 30 && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${daysLeft <= 7 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      <Clock className="w-4 h-4 shrink-0" />
                      يتبقى {daysLeft} يوم على انتهاء الحملة
                    </div>
                  )}

                  {isExpired && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-bold bg-muted text-muted-foreground">
                      <Clock className="w-4 h-4 shrink-0" />
                      انتهت مدة هذه الحملة
                    </div>
                  )}
                </div>

                {/* Quick amount buttons */}
                {!isExpired && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground text-center">اختر مبلغاً سريعاً</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 250, 500, 1000].map(amt => (
                        <button
                          key={amt}
                          className="py-2 rounded-lg text-sm font-bold border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all"
                          onClick={() => setLocation(`/donate?campaignId=${campaign._id || campaign.id}&campaignName=${encodeURIComponent(campaign.titleAr || campaign.title || "")}&amount=${amt}`)}
                          data-testid={`button-quick-amount-${amt}`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground">ريال سعودي</p>
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active-elevate-2 transition-all"
                    onClick={() => setLocation(`/donate?campaignId=${campaign._id || campaign.id}&campaignName=${encodeURIComponent(campaign.titleAr || campaign.title || "")}`)}
                    disabled={isExpired}
                    data-testid="button-donate-now"
                  >
                    {isExpired ? "انتهت الحملة" : "تصدق الآن"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-4 leading-relaxed">
                    من خلال تبرعك، أنت تساهم بشكل مباشر في دعم أهداف هذه الحملة وإحداث فرق حقيقي.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-6 flex justify-center">
                <p className="text-sm font-medium text-muted-foreground">الدفع آمن 100%</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
