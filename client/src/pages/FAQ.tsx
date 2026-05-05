import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/use-seo";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-right bg-background hover:bg-muted/40 transition-colors"
      >
        <span className="font-semibold text-sm md:text-base leading-snug">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-primary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 py-4 bg-muted/20 border-t border-border/40 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  useSEO({
    title: "الأسئلة الشائعة | جمعية طويق للخدمات الإنسانية",
    description: "إجابات على أكثر الأسئلة شيوعاً حول جمعية طويق للخدمات الإنسانية والتبرعات",
  });

  const { data: faqs = [], isLoading } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
    queryFn: async () => {
      const r = await fetch("/api/faqs");
      return r.ok ? r.json() : [];
    },
    staleTime: 60000,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading">الأسئلة الشائعة</h1>
            <p className="mt-3 text-white/80 max-w-md mx-auto">
              إجابات شاملة على أكثر الأسئلة التي يطرحها زوارنا
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-20">
              <HelpCircle className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground text-lg">لا توجد أسئلة بعد</p>
              <p className="text-muted-foreground text-sm mt-1">سيتم إضافة الأسئلة الشائعة قريباً</p>
            </div>
          ) : (
            <div className="space-y-3" dir="rtl">
              {faqs.map((faq) => (
                <FAQItem key={faq.id} faq={faq} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
