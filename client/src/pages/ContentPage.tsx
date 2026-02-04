import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface ContentPageProps {
  title: string;
  slug: string;
  icon?: React.ReactNode;
}

export function ContentPage({ title, slug, icon }: ContentPageProps) {
  const { data: content, isLoading } = useQuery<{ content: string; title: string; imageUrl?: string }>({
    queryKey: ['/api/content', slug],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            {icon && <div className="mb-4 flex justify-center">{icon}</div>}
            <h1 className="text-3xl md:text-4xl font-bold font-heading">{content?.title || title}</h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-4xl mx-auto overflow-hidden shadow-lg border-primary/10">
            {content?.imageUrl && (
              <div className="w-full h-[300px] md:h-[450px] overflow-hidden relative">
                <img 
                  src={content.imageUrl} 
                  alt={content.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            <CardContent className="p-8 md:p-12">
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-10 w-2/3" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ) : content?.content ? (
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none text-right leading-relaxed font-sans"
                  style={{ direction: 'rtl' }}
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              ) : (
                <div className="text-center text-muted-foreground py-20 bg-muted/30 rounded-lg border-2 border-dashed">
                  <p className="text-2xl font-heading mb-3">المحتوى قيد الإعداد</p>
                  <p>نسعى دائماً لتقديم الأفضل لكم، سيتم إضافة المحتوى قريباً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Pre-built page components for each section
export function AboutPage() {
  return <ContentPage title="نشأة الجمعية" slug="about" />;
}

export function GoalsPage() {
  return <ContentPage title="أهداف الجمعية" slug="goals" />;
}

export function VisionPage() {
  return <ContentPage title="الرؤية والرسالة" slug="vision" />;
}

export function FoundersPage() {
  return <ContentPage title="مؤسسو الجمعية" slug="founders" />;
}

export function BoardPage() {
  return <ContentPage title="أعضاء مجلس الإدارة" slug="board" />;
}

export function AssemblyPage() {
  return <ContentPage title="أعضاء الجمعية العمومية" slug="assembly" />;
}

export function ProgramsPage() {
  return <ContentPage title="برامج الجمعية" slug="programs" />;
}

export function NewslettersPage() {
  return <ContentPage title="نشرات الجمعية" slug="newsletters" />;
}

export function BeneficiariesPage() {
  return <ContentPage title="المستفيدين" slug="beneficiaries" />;
}

export function JobsPage() {
  return <ContentPage title="إعلانات الوظائف" slug="jobs" />;
}

export function ApplyJobPage() {
  return <ContentPage title="التقدم للتوظيف" slug="apply-job" />;
}

export function VolunteerPage() {
  return <ContentPage title="تطوع الآن" slug="volunteer" />;
}

export function BylawsPage() {
  return <ContentPage title="اللائحة الأساسية" slug="bylaws" />;
}

export function FinancialsPage() {
  return <ContentPage title="القوائم المالية" slug="financials" />;
}

export function PoliciesPage() {
  return <ContentPage title="السياسات واللوائح" slug="policies" />;
}

export function CommitteesPage() {
  return <ContentPage title="اللجان" slug="committees" />;
}

export function SatisfactionPage() {
  return <ContentPage title="قياس رضاء أصحاب العلاقة" slug="satisfaction" />;
}

export function EthicsPage() {
  return <ContentPage title="الميثاق الأخلاقي" slug="ethics" />;
}

export function ExecutivePage() {
  return <ContentPage title="المسؤول التنفيذي" slug="executive" />;
}

export function DisclosurePage() {
  return <ContentPage title="الإفصاح" slug="disclosure" />;
}

export function NewsPage() {
  return <ContentPage title="الأخبار" slug="news" />;
}

export function BlogPage() {
  return <ContentPage title="المدونة" slug="blog" />;
}
