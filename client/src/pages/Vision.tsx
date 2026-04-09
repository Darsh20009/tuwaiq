import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Target, Heart, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Vision() {
  const { data: content, isLoading } = useQuery<any>({
    queryKey: ["/api/content/vision"],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Eye className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold font-heading">
              {content?.title || "الرؤية والرسالة"}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 space-y-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-6 md:p-8">
                <div 
                  className="prose prose-lg max-w-none text-right" 
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: content?.content || "" }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
