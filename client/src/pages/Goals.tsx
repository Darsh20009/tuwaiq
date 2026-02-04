import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle2 } from "lucide-react";

const strategicGoals = [
  "تقديم المساعدات المادية والعينية للفئات المحتاجة.",
  "تحسين المستوى المعيشي للفئة المستفيدة.",
  "تأهيل الأسر المستفيدة وتمكينهم للاعتماد على أنفسهم.",
  "تدريب أبناء المستفيدين وتأهيلهم لسوق العمل.",
  "تقديم المساعدات الطارئة في أوقات الكوارث والأزمات.",
  "تنفيذ ودعم المبادرات والبرامج الموسمية.",
  "رفع مستوى أداء العمليات الداخلية.",
  "تعزيز العلاقات الايجابية بين منسوبي الجمعية.",
  "التعريف بالجمعية وانشطتها المختلفة لتعزيز الصورة الذهنية الايجابية.",
  "استثمار قدرات منسوبي الجمعية.",
  "تحقيق الاستدامة المالية.",
];

const operationalGoals = [
  "توزيع الزكاة وضمان وصولها للمستحقين.",
  "تحسين وصول المساعدات العينية للمحتاجين طوال العام.",
  "تنفيذ الفديات والهدي والأضاحي والكفارات وتسليمها للفئات المحتاجة.",
  "تقديم مساعدات مالية أو عينية عاجلة للأسر المتعثرة لتخفيف الأعباء المالية وتحسين استقرارهم المعيشي.",
  "تقديم دعم مادي دوري للأسر المحتاجة لتغطية احتياجاتهم الأساسية.",
  "تنفيذ برامج تدريبية للأسر المستفيدة تشمل تطوير المهارات الحياتية والمهنية.",
  "تدريب أبناء المستفيدين وتأهيلهم لدخول سوق العمل.",
  "تعزيز جاهزية تقديم الخدمات خلال الأزمات والكوارث.",
  "تنظيم وتنفيذ حملات وبرامج موسمية خلال المواسم.",
  "تحسين كفاءة العمليات الداخلية وتحقيق التكامل بين الإدارات.",
  "تحسين عمليات المستفيدين.",
  "تعزيز رضا أصحاب العلاقة في الجمعية.",
  "تقوية أواصر المحبة بين منسوبي الجمعية.",
  "إعداد المنتجات الإعلامية.",
  "تعزيز الصورة الذهنية.",
  "الإنتاج الإعلامي وإثراء المحتوى الرقمي.",
  "تحسين التواصل الاجتماعي عبر المنصات الاجتماعية المختلفة.",
  "تنمية قدرات منسوبي الجمعية.",
  "تسويق أصول وأنشطة وبرامج الجمعية.",
];

export default function Goals() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Target className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold font-heading">أهداف الجمعية</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 space-y-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-right text-primary flex items-center justify-end gap-2">
                <span>الأهداف الاستراتيجية لجمعية البر بمكة المكرمة</span>
                <Target className="w-6 h-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <ul className="space-y-4 text-right" dir="rtl">
                {strategicGoals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-lg leading-relaxed">{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-right text-primary flex items-center justify-end gap-2">
                <span>الأهداف التشغيلية لجمعية البر بمكة المكرمة</span>
                <Target className="w-6 h-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <ul className="space-y-4 text-right" dir="rtl">
                {operationalGoals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-lg leading-relaxed">{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
