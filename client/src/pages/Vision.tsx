import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Target, Heart, CheckCircle2 } from "lucide-react";

const values = [
  "الشفافية",
  "العدل والمساواة",
  "الانتماء",
  "السرية والخصوصية",
  "تجويد الخدمات",
  "الإحسان",
];

export default function Vision() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Eye className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold font-heading">الرؤية والرسالة</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 space-y-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-right text-primary flex items-center justify-end gap-2">
                <span>الرؤية</span>
                <Eye className="w-6 h-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <p className="text-xl text-right leading-relaxed" dir="rtl">
                جمعية خيرية رائدة تسعى إلى التميز في تقديم أعمال البر وفق استراتيجية طموحة ومستدامة.
              </p>
            </CardContent>
          </Card>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-right text-primary flex items-center justify-end gap-2">
                <span>الرسالة</span>
                <Target className="w-6 h-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <p className="text-xl text-right leading-relaxed" dir="rtl">
                الإسهام في تحقيق حياة كريمة لذوي الحاجة بأم القرى من خلال برامج عملية تمكنهم من سد احتياجهم وتحويلهم لمتاجرين منتجين في ظل تعامل إنساني من قبل فريق عمل محترف وبدعم مستدام من أوقاف الجمعية والداعمين.
              </p>
            </CardContent>
          </Card>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-right text-primary flex items-center justify-end gap-2">
                <span>القيم والمبادئ</span>
                <Heart className="w-6 h-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4" dir="rtl">
                {values.map((value, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-primary/5 rounded-md">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-lg font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
