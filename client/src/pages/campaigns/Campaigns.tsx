import { useCampaigns } from "@/hooks/use-campaigns";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/use-seo";

export default function Campaigns() {
  const { campaigns, isLoading } = useCampaigns();
  useSEO({
    title: "المشاريع الإنسانية",
    description: "ساهم في مشاريعنا الإنسانية المتنوعة وكن شريكاً في صنع الفرق — حملات خيرية متجددة في المملكة العربية السعودية",
    image: "/images/og-banner2.png",
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12" dir="rtl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-heading text-gradient mb-4">حملات التبرع</h1>
          <p className="text-xl text-muted-foreground">ساهم في دعم مشاريعنا الخيرية المستمرة</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns?.filter(c => c.status === "active").map((campaign) => {
              const currentAmount = campaign.currentAmount || 0;
              const goalAmount = campaign.goalAmount || 1;
              const progress = Math.min(100, (currentAmount / goalAmount) * 100);
              return (
                <Card key={campaign._id || campaign.id} className="overflow-hidden hover-elevate transition-all border-none shadow-md">
                  {campaign.image && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={campaign.image} 
                        alt={campaign.titleAr || campaign.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{campaign.titleAr || campaign.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-2 min-h-[3rem]">
                      {campaign.descriptionAr || campaign.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>تم جمع: {campaign.currentAmount.toLocaleString()} ريال</span>
                        <span>الهدف: {campaign.goalAmount.toLocaleString()} ريال</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-left font-bold text-primary">{Math.round(progress)}%</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/campaigns/${campaign._id || campaign.id}`} className="w-full">
                      <Button className="w-full font-bold" data-testid={`button-view-campaign-${campaign._id || campaign.id}`}>
                        عرض التفاصيل والمساهمة
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && campaigns?.filter(c => c.status === "active").length === 0 && (
          <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-border/40">
            <p className="text-muted-foreground text-lg">لا توجد حملات نشطة حالياً.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
