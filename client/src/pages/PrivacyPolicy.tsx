import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function PrivacyPolicyPage() {
  const { data: content, isLoading } = useQuery<any>({
    queryKey: ["/api/content/privacy-policy"],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "سياسة الخصوصية - جمعية طويق للخدمات الإنسانية";
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-32" dir="rtl">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-primary">
            {content?.title || "سياسة الخصوصية"}
          </h1>
          <p className="text-muted-foreground">
            آخر تحديث: {content?.updatedAt ? new Date(content.updatedAt).toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA')}
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-p:leading-relaxed prose-li:mb-2 text-right"
              dangerouslySetInnerHTML={{ __html: content?.content || "" }}
            />
            
            {!content?.content && (
              <div className="text-center py-10 text-muted-foreground">
                عذراً، محتوى سياسة الخصوصية غير متوفر حالياً.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
