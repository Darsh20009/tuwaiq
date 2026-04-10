import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Newspaper, Heart, Briefcase, Globe2,
  ChevronRight, ChevronLeft, ArrowLeft,
  BookOpen, Calendar,
} from "lucide-react";

const CHAPTER_IDS  = ["news", "campaigns", "jobs", "services"] as const;
type ChapterId = typeof CHAPTER_IDS[number];

const CHAPTER_META: Record<ChapterId, { label: string; color: string; accent: string; href: string }> = {
  news:      { label: "آخر الأخبار", color: "hsl(210 65% 48%)", accent: "hsl(210 65% 95%)", href: "/news" },
  campaigns: { label: "حملاتنا",     color: "hsl(152 50% 33%)", accent: "hsl(152 50% 95%)", href: "/campaigns" },
  jobs:      { label: "فرص العمل",   color: "hsl(28 60% 40%)",  accent: "hsl(28 60% 95%)",  href: "/jobs" },
  services:  { label: "خدماتنا",     color: "hsl(270 50% 45%)", accent: "hsl(270 50% 96%)", href: "/services" },
};

function ChapterIcon({ id, className }: { id: ChapterId; className?: string }) {
  if (id === "news")      return <Newspaper  className={className} />;
  if (id === "campaigns") return <Heart      className={className} />;
  if (id === "jobs")      return <Briefcase  className={className} />;
  return <Globe2 className={className} />;
}

const SERVICES_STATIC = [
  { title: "برنامج الحج الميسّر",          desc: "تيسير فريضة الحج للمستحقين",            link: "/service/hajj" },
  { title: "كسوة الشتاء",                  desc: "توزيع الملابس الشتوية على المحتاجين",   link: "/service/winter" },
  { title: "السلة الغذائية",               desc: "احتياجات غذائية للأسر المعدمة",          link: "/service/food" },
  { title: "إفطار الصائمين",               desc: "موائد إفطار جماعية برمضان",              link: "/service/iftar" },
  { title: "دعم الأسر الأولى بالرعاية",   desc: "برامج شاملة للأسر الهشة",               link: "/service/family" },
  { title: "مياه الآبار",                  desc: "حفر آبار في المناطق المحرومة",           link: "/service/water" },
];

const ITEMS_PER_PAGE = 3;

export function SiteBookSection() {
  const [chapterIdx, setChapterIdx] = useState(0);
  const [direction, setDirection]   = useState<1 | -1>(1);
  const [page, setPage]             = useState(0);
  const timerRef                    = useRef<number | null>(null);

  const { data: news = [] }      = useQuery<any[]>({ queryKey: ["/api/news"],      staleTime: 120_000 });
  const { data: campaigns = [] } = useQuery<any[]>({ queryKey: ["/api/campaigns"], staleTime: 120_000 });
  const { data: jobs = [] }      = useQuery<any[]>({ queryKey: ["/api/jobs"],       staleTime: 120_000 });

  const currentId   = CHAPTER_IDS[chapterIdx];
  const currentMeta = CHAPTER_META[currentId];

  const rawCampaigns = Array.isArray(campaigns)
    ? campaigns
    : (campaigns as any)?.data ?? [];

  const allItems: Record<ChapterId, any[]> = {
    news:      news.slice(0, 9),
    campaigns: rawCampaigns.filter((c: any) => c.isActive !== false).slice(0, 9),
    jobs:      jobs.slice(0, 9),
    services:  SERVICES_STATIC,
  };

  const items      = allItems[currentId];
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const pageItems  = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  function goChapter(nextIdx: number, dir: 1 | -1) {
    setDirection(dir);
    setChapterIdx(nextIdx);
    setPage(0);
  }

  function prev() { goChapter((chapterIdx - 1 + CHAPTER_IDS.length) % CHAPTER_IDS.length, -1); }
  function next() { goChapter((chapterIdx + 1) % CHAPTER_IDS.length, 1); }

  useEffect(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setDirection(1);
      setChapterIdx((c) => (c + 1) % CHAPTER_IDS.length);
      setPage(0);
    }, 6000);
    return () => { if (timerRef.current !== null) clearInterval(timerRef.current); };
  }, [chapterIdx]);

  return (
    <section className="py-12 px-4" dir="rtl" style={{ background: "hsl(35 28% 97%)" }}>
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(152 50% 95%)" }}>
            <BookOpen className="w-5 h-5" style={{ color: "hsl(152 50% 33%)" }} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">ما يحدث في طويق</h2>
            <p className="text-xs text-gray-400">معلومات حية من جميع أقسام الموقع</p>
          </div>
        </div>

        {/* Book card */}
        <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white"
          style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {CHAPTER_IDS.map((id, idx) => {
              const meta    = CHAPTER_META[id];
              const isActive = idx === chapterIdx;
              return (
                <button
                  key={id}
                  onClick={() => goChapter(idx, idx > chapterIdx ? 1 : -1)}
                  className="flex-1 min-w-max flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold transition-all whitespace-nowrap"
                  data-testid={`tab-book-${id}`}
                  style={{
                    color: isActive ? meta.color : "#9ca3af",
                    borderBottom: isActive ? `2.5px solid ${meta.color}` : "2.5px solid transparent",
                    background: isActive ? meta.accent : "transparent",
                  }}
                >
                  <ChapterIcon id={id} className="w-4 h-4" />
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="relative min-h-72 p-5">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${chapterIdx}-${page}`}
                custom={direction}
                variants={{
                  enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
                  center: { opacity: 1, x: 0 },
                  exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {pageItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: currentMeta.accent }}>
                      <ChapterIcon id={currentId} className="w-6 h-6" />
                    </div>
                    <p className="text-gray-400 text-sm">جاري تحميل البيانات…</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {pageItems.map((item: any, i: number) => (
                      <BookCard
                        key={item._id || item.id || i}
                        item={item}
                        chapterId={currentId}
                        meta={currentMeta}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="rounded-full transition-all"
                  data-testid={`dot-book-${i}`}
                  style={{
                    width: i === page ? 20 : 6,
                    height: 6,
                    background: i === page ? currentMeta.color : "#e5e7eb",
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link href={currentMeta.href}
                className="text-xs font-bold flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: currentMeta.color }}
                data-testid={`link-book-more-${currentId}`}>
                عرض الكل <ArrowLeft className="w-3 h-3" />
              </Link>
              <button onClick={prev}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                data-testid="button-book-prev">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={next}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                data-testid="button-book-next">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookCard({
  item,
  chapterId,
  meta,
}: {
  item: any;
  chapterId: ChapterId;
  meta: { label: string; color: string; accent: string; href: string };
}) {
  const title  = item.title || item.name || "—";
  const desc   = item.summary || item.description || item.desc
                 || (typeof item.body === "string" ? item.body.slice(0, 80) : "") || "";
  const date   = item.date || item.createdAt || item.publishedAt || "";
  const raised = item.totalDonations !== undefined ? Number(item.totalDonations) || 0 : null;
  const goal   = item.goalAmount     ? Number(item.goalAmount)   || 0 : null;
  const pct    = raised !== null && goal && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : null;

  const href =
    item.link
    ?? (chapterId === "news"      ? `/news/${item._id ?? item.id ?? ""}`
    :   chapterId === "campaigns" ? `/campaigns`
    :   chapterId === "jobs"      ? `/jobs`
    :   meta.href);

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}
        className="rounded-2xl border border-gray-100 overflow-hidden cursor-pointer h-full flex flex-col"
        style={{ background: "hsl(35 28% 99%)" }}
        data-testid={`card-book-${chapterId}-${item._id ?? item.id ?? ""}`}
      >
        <div className="h-1 w-full" style={{ background: meta.color }} />
        <div className="p-4 flex flex-col flex-1 gap-2">
          <span className="self-start text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: meta.accent, color: meta.color }}>
            {meta.label}
          </span>
          <h4 className="text-sm font-black text-gray-800 leading-snug line-clamp-2">{title}</h4>
          {desc && (
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 flex-1">{desc}</p>
          )}
          {pct !== null && (
            <div className="mt-1">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{raised?.toLocaleString("ar-SA")} ر.س</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
              </div>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-1 text-xs text-gray-300 mt-auto">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(date).toLocaleDateString("ar-SA", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
