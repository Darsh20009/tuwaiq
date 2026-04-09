import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Users, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Founders() {
  const { data: content, isLoading } = useQuery<any>({
    queryKey: ["/api/content/founders"],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Navbar />

      <main className="flex-1">
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-4 flex justify-center">
              <Users className="h-12 w-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-6">
              {content?.title || "الأعضاء المؤسسون / أعضاء الجمعية العمومية"}
            </h1>
            <p className="max-w-3xl mx-auto text-lg opacity-90 leading-relaxed">
              تفتخر جمعية طويق للخدمات الإنسانية بنخبة من الأعضاء الأوائل الذين كان لهم الدور الأساسي في تأسيس الجمعية ودعم مسيرتها منذ انطلاقتها.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : content?.content ? (
            <div
              className="prose prose-lg max-w-4xl mx-auto text-right [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_p]:leading-8 [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:pr-6"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          ) : (
            <p className="text-center text-muted-foreground py-12">
              لم يتم إضافة محتوى لهذه الصفحة بعد. يمكن للمشرف إضافة المحتوى من لوحة التحكم.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
