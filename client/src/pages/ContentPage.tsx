import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";

interface ContentPageProps {
  title: string;
  slug: string;
  icon?: React.ReactNode;
}

export function ContentPage({ title, slug, icon }: ContentPageProps) {
  const { data: content, isLoading } = useQuery<{
    content: string;
    title: string;
    imageUrl?: string;
    images?: string[];
  }>({
    queryKey: ['/api/content', slug],
  });

  const [mainImgError, setMainImgError] = useState(false);
  const [fallbackIdx, setFallbackIdx] = useState(0);

  useSEO({
    title: content?.title || title,
    description: content?.content?.replace(/<[^>]+>/g, "").slice(0, 155),
    image: content?.imageUrl,
  });

  useEffect(() => {
    setMainImgError(false);
    setFallbackIdx(0);
  }, [content?.imageUrl]);

  const additionalImages: string[] = Array.isArray((content as any)?.images)
    ? (content as any).images
    : [];

  // Determine which image to show as the hero:
  // 1. Main imageUrl (if not errored)
  // 2. First additional image as fallback
  const heroUrl = !mainImgError
    ? content?.imageUrl
    : additionalImages[fallbackIdx];

  const showHero = !!heroUrl;

  // Remaining additional images (skip the one used as fallback hero)
  const galleryImages = mainImgError
    ? additionalImages.slice(fallbackIdx + 1)
    : additionalImages;

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
            {showHero && (
              <div className="w-full h-[300px] md:h-[450px] overflow-hidden relative">
                <img 
                  src={heroUrl}
                  alt={content?.title || title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={() => {
                    if (!mainImgError) {
                      setMainImgError(true);
                    } else {
                      setFallbackIdx(i => i + 1);
                    }
                  }}
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

              {/* Additional images gallery */}
              {galleryImages.length > 0 && (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryImages.map((url: string, idx: number) => (
                    <div key={idx} className="overflow-hidden rounded-lg h-56">
                      <img
                        src={url}
                        alt={`${content?.title || title} - ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const el = e.target as HTMLElement;
                          if (el.parentElement) el.parentElement.style.display = "none";
                        }}
                      />
                    </div>
                  ))}
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
  const { data: jobs, isLoading } = useQuery<any[]>({
    queryKey: ['/api/jobs'],
  });

  const activeJobs = jobs?.filter((j: any) => j.isActive) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-heading">الوظائف المتاحة</h1>
            <p className="mt-3 text-white/80">اختر الوظيفة التي تناسبك وقدّم طلبك مباشرة</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid gap-6 max-w-4xl mx-auto">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : activeJobs.length > 0 ? (
            <div className="grid gap-6 max-w-4xl mx-auto">
              {activeJobs.map((job: any) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow border-border/60">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                        {job.department && (
                          <p className="text-sm text-primary font-medium mt-1">{job.department}</p>
                        )}
                      </div>
                      <Link href={`/apply-job?jobId=${job.id}`}>
                        <Button data-testid={`btn-apply-job-${job.id}`} className="shrink-0">
                          التقديم الآن
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  {job.description && (
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">{job.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">لا توجد وظائف شاغرة حالياً</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function ApplyJobPage() {
  const { data: jobs, isLoading: jobsLoading } = useQuery<any[]>({
    queryKey: ['/api/jobs'],
  });

  // Read jobId from URL query string
  const params = new URLSearchParams(window.location.search);
  const preselectedJobId = params.get('jobId');

  const [selectedJobId, setSelectedJobId] = useState<string>(preselectedJobId || '');
  const [customAnswers, setCustomAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const activeJobs = jobs?.filter((j: any) => j.isActive) ?? [];
  const selectedJob = activeJobs.find((j: any) => j.id === selectedJobId || String(j._id) === selectedJobId);

  // Reset custom answers when job changes
  useEffect(() => {
    const count = selectedJob?.customQuestions?.length ?? 0;
    setCustomAnswers(Array(count).fill(''));
  }, [selectedJobId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJob) { setError('يرجى اختيار الوظيفة'); return; }
    setSubmitting(true);
    setError('');
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('jobId', selectedJob.id || selectedJob._id);
    formData.set('jobTitle', selectedJob.title);
    formData.set('customAnswers', JSON.stringify(customAnswers));
    try {
      const res = await fetch('/api/job-applications', { method: 'POST', body: formData });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'حدث خطأ أثناء تقديم الطلب، يرجى المحاولة مرة أخرى');
      }
    } catch {
      setError('تعذّر الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">تم إرسال طلبك بنجاح!</h2>
            <p className="text-muted-foreground mb-6">
              شكراً لتقديمك على وظيفة <strong>{selectedJob?.title}</strong>. سيتواصل معك فريقنا قريباً على بريدك الإلكتروني.
            </p>
            <Link href="/jobs">
              <Button variant="outline">العودة للوظائف</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-heading">
              {selectedJob ? `التقديم على: ${selectedJob.title}` : 'تقديم طلب توظيف'}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">بيانات المتقدم</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-4">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>

                  {/* Job selector — shown only if no preselected job */}
                  {!preselectedJobId ? (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">الوظيفة المتقدم لها *</label>
                      <select
                        data-testid="select-job"
                        className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={selectedJobId}
                        onChange={e => setSelectedJobId(e.target.value)}
                        required
                      >
                        <option value="">— اختر الوظيفة —</option>
                        {activeJobs.map((job: any) => (
                          <option key={job.id} value={job.id}>{job.title}</option>
                        ))}
                      </select>
                    </div>
                  ) : selectedJob ? (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">الوظيفة المتقدم لها</p>
                      <p className="font-bold text-primary text-lg">{selectedJob.title}</p>
                      {selectedJob.department && (
                        <p className="text-sm text-muted-foreground">{selectedJob.department}</p>
                      )}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">الاسم الكامل *</label>
                      <input
                        data-testid="input-name"
                        name="name"
                        className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="اكتب اسمك الكامل"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">رقم الجوال *</label>
                      <input
                        data-testid="input-phone"
                        name="phone"
                        type="tel"
                        dir="ltr"
                        className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="05xxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">البريد الإلكتروني *</label>
                    <input
                      data-testid="input-email"
                      name="email"
                      type="email"
                      dir="ltr"
                      className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="example@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">السيرة الذاتية (CV) *</label>
                    <input
                      data-testid="input-cv"
                      type="file"
                      name="cv"
                      accept=".pdf,.doc,.docx"
                      className="w-full p-3 border border-border rounded-lg bg-background text-sm file:ml-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-white cursor-pointer"
                      required
                    />
                    <p className="text-xs text-muted-foreground">صيغ مقبولة: PDF, DOC, DOCX</p>
                  </div>

                  {/* Custom questions for selected job */}
                  {selectedJob?.customQuestions?.length > 0 && (
                    <div className="space-y-4 border-t pt-4">
                      <p className="text-sm font-semibold text-muted-foreground">أسئلة إضافية</p>
                      {selectedJob.customQuestions.map((q: string, i: number) => (
                        <div key={i} className="space-y-2">
                          <label className="text-sm font-semibold">{q} *</label>
                          <input
                            className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={customAnswers[i] || ''}
                            onChange={e => {
                              const updated = [...customAnswers];
                              updated[i] = e.target.value;
                              setCustomAnswers(updated);
                            }}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">لماذا ترغب بالانضمام إلينا؟ *</label>
                    <textarea
                      data-testid="input-message"
                      name="message"
                      className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-28 resize-none"
                      placeholder="اكتب هنا دوافعك ومهاراتك التي تؤهلك للوظيفة..."
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button
                    data-testid="btn-submit-application"
                    type="submit"
                    className="w-full h-11 text-base"
                    disabled={submitting || (!selectedJob)}
                  >
                    {submitting ? 'جارٍ الإرسال...' : 'إرسال طلب التوظيف'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
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
  const { data: news, isLoading } = useQuery<any[]>({
    queryKey: ['/api/news'],
    queryFn: async () => {
      const res = await fetch('/api/news');
      if (!res.ok) return [];
      return res.json();
    }
  });

  const newsItems = (news || []).filter((item: any) => item.isPublished !== false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-heading">آخر الأخبار</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
          ) : newsItems.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {newsItems.map((item: any) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow border-primary/10">
                  {item.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) parent.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      {item.category && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{item.category}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold line-clamp-2">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item.summary ? (
                      <p className="text-muted-foreground line-clamp-3 mb-4">{item.summary}</p>
                    ) : item.content ? (
                      <div
                        className="text-muted-foreground line-clamp-3 mb-4"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    ) : null}
                    <Link href={`/news/${item.id}`}>
                      <Button variant="outline" className="w-full">اقرأ المزيد</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed">
              <p className="text-xl text-muted-foreground">لا توجد أخبار حالياً</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function NewsDetailPage({ id }: { id: string }) {
  const { data: article, isLoading } = useQuery<any>({
    queryKey: ['/api/news', id],
    queryFn: async () => {
      const res = await fetch(`/api/news/${id}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {isLoading ? (
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <Skeleton className="h-64 w-full mb-6" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
          </div>
        ) : !article ? (
          <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-xl text-muted-foreground">الخبر غير موجود</p>
            <Link href="/news"><Button className="mt-4">العودة للأخبار</Button></Link>
          </div>
        ) : (
          <>
            {article.imageUrl && (
              <div className="w-full h-64 md:h-96 overflow-hidden">
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <Link href="/news">
                  <Button variant="outline" size="sm">← الأخبار</Button>
                </Link>
                {article.category && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{article.category}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(article.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading mb-6">{article.title}</h1>
              {article.summary && (
                <p className="text-lg text-muted-foreground border-r-4 border-primary/40 pr-4 mb-8">{article.summary}</p>
              )}
              {article.content && (
                <div
                  className="prose prose-lg max-w-none rtl text-foreground leading-loose"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export function BlogPage() {
  return <ContentPage title="المدونة" slug="blog" />;
}
