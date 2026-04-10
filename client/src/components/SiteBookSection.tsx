import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Newspaper, Heart, Briefcase, Globe2,
  ChevronRight, ChevronLeft, ArrowLeft, BookOpen,
  Calendar, Trophy, Users, Info, Tent,
  FileText, Scale, BarChart2, ScrollText,
  ShieldCheck, Star, CheckCircle2, Award,
} from "lucide-react";

/* ─── Types ────────────────────────────────────────── */
type ChapterId =
  | "news" | "campaigns" | "hajj" | "services"
  | "jobs" | "donors" | "about" | "founders" | "governance";

type ChapterDef = { label: string; color: string; accent: string; href: string };

const CHAPTER_META: Record<ChapterId, ChapterDef> = {
  news:       { label: "آخر الأخبار",   color: "#2563eb", accent: "#eff6ff", href: "/news" },
  campaigns:  { label: "حملاتنا",       color: "#16a34a", accent: "#f0fdf4", href: "/campaigns" },
  hajj:       { label: "كفالة حاج",     color: "#0d9488", accent: "#f0fdfa", href: "/service/hajj" },
  services:   { label: "خدماتنا",       color: "#7c3aed", accent: "#f5f3ff", href: "/services" },
  jobs:       { label: "فرص العمل",     color: "#d97706", accent: "#fffbeb", href: "/jobs" },
  donors:     { label: "المتبرعون",     color: "#b45309", accent: "#fef3c7", href: "/leaderboard" },
  about:      { label: "عن الجمعية",    color: "#1d4ed8", accent: "#eff6ff", href: "/about" },
  founders:   { label: "المؤسسون",      color: "#0f766e", accent: "#f0fdfa", href: "/founders" },
  governance: { label: "الحوكمة",       color: "#6d28d9", accent: "#f5f3ff", href: "/governance/charter" },
};

const CHAPTER_ORDER: ChapterId[] = [
  "news", "campaigns", "hajj", "services", "jobs", "donors", "about", "founders", "governance",
];

/* ─── Static data ─── */
const SERVICES_STATIC = [
  { title: "برنامج الحج الميسّر",         desc: "تيسير فريضة الحج للمستحقين",            link: "/service/hajj" },
  { title: "كسوة الشتاء",                 desc: "ملابس شتوية للأسر المحتاجة",            link: "/service/winter" },
  { title: "السلة الغذائية",              desc: "احتياجات غذائية للأسر المعدمة",          link: "/service/food" },
  { title: "إفطار الصائمين",              desc: "موائد إفطار جماعية برمضان",              link: "/service/iftar" },
  { title: "دعم الأسر الأولى بالرعاية",  desc: "برامج شاملة للأسر الهشة",               link: "/service/family" },
  { title: "مياه الآبار",                 desc: "حفر آبار في المناطق المحرومة",           link: "/service/water" },
  { title: "كفالة اليتيم",               desc: "دعم الأيتام وتأمين احتياجاتهم",          link: "/service/orphan" },
  { title: "تفريج الكربات",              desc: "مساعدة المتضررين في الأزمات",            link: "/service/relief" },
  { title: "كفالة الأسر الأرامل",        desc: "دعم الأسر الأرامل والمطلقات",            link: "/service/families" },
];

const GOVERNANCE_PAGES = [
  { label: "النظام الأساسي",    href: "/governance/charter",      icon: ScrollText,   desc: "اللوائح والأنظمة التأسيسية للجمعية" },
  { label: "اللجان",            href: "/governance/committees",   icon: Users,        desc: "لجان الجمعية وتشكيلاتها" },
  { label: "الميثاق الأخلاقي", href: "/governance/ethics",       icon: ShieldCheck,  desc: "قيم وأخلاقيات العمل التطوعي" },
  { label: "التقارير المالية",  href: "/governance/financials",   icon: BarChart2,    desc: "الشفافية المالية والتقارير السنوية" },
  { label: "السياسات",          href: "/governance/policies",     icon: FileText,     desc: "سياسات وإجراءات العمل المؤسسي" },
  { label: "الرضا المجتمعي",   href: "/governance/satisfaction",  icon: Star,         desc: "استطلاعات رأي المستفيدين" },
  { label: "الهيئة التنفيذية", href: "/governance/executive",    icon: Award,        desc: "مجلس الإدارة والهيئة التنفيذية" },
  { label: "الإفصاح",           href: "/governance/disclosure",   icon: Scale,        desc: "الإفصاح والشفافية" },
  { label: "الجمعية العمومية",  href: "/general-assembly",        icon: CheckCircle2, desc: "قرارات ومحاضر الجمعية العمومية" },
];

/* ─── Strip HTML to plain text ─── */
function stripHtml(html: string, maxLen = 320): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxLen);
}

/* ─── Extract names from founders HTML (h3 / h2 tags) ─── */
function extractFounderNames(html: string): string[] {
  const matches = html.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) ?? [];
  return matches
    .map((m) => m.replace(/<[^>]+>/g, "").trim())
    .filter((n) => n && !n.includes("الأعضاء الأوائل") && !n.includes("حفظهم"));
}

/* ─── Icon renderer ─── */
function ChIcon({ id, cls }: { id: ChapterId; cls?: string }) {
  const c = cls ?? "w-4 h-4";
  if (id === "news")       return <Newspaper  className={c} />;
  if (id === "campaigns")  return <Heart      className={c} />;
  if (id === "hajj")       return <Tent       className={c} />;
  if (id === "services")   return <Globe2     className={c} />;
  if (id === "jobs")       return <Briefcase  className={c} />;
  if (id === "donors")     return <Trophy     className={c} />;
  if (id === "about")      return <Info       className={c} />;
  if (id === "founders")   return <Users      className={c} />;
  return <ShieldCheck className={c} />;
}

const ITEMS_PER_PAGE = 3;

/* ══════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════ */
export function SiteBookSection() {
  const [chIdx, setChIdx] = useState(0);
  const [dir,   setDir]   = useState<1 | -1>(1);
  const [page,  setPage]  = useState(0);
  const timerRef          = useRef<number | null>(null);

  const chId   = CHAPTER_ORDER[chIdx];
  const chMeta = CHAPTER_META[chId];

  /* ── Data fetching ── */
  const { data: news      = [] } = useQuery<any[]>({ queryKey: ["/api/news"],                  staleTime: 120_000 });
  const { data: campaigns      } = useQuery<any>  ({ queryKey: ["/api/campaigns"],             staleTime: 120_000 });
  const { data: jobs      = [] } = useQuery<any[]>({ queryKey: ["/api/jobs"],                  staleTime: 180_000 });
  const { data: hajjStats      } = useQuery<any>  ({ queryKey: ["/api/donations/hajj-stats"],  staleTime: 30_000 });
  const { data: topDonors      } = useQuery<any>  ({ queryKey: ["/api/donations/top-donors"],  staleTime: 60_000 });
  const { data: aboutContent   } = useQuery<any>  ({ queryKey: ["/api/content/about"],         staleTime: 300_000, enabled: chId === "about" });
  const { data: foundersContent} = useQuery<any>  ({ queryKey: ["/api/content/founders"],      staleTime: 300_000, enabled: chId === "founders" });

  const campaignList: any[] = Array.isArray(campaigns) ? campaigns : (campaigns as any)?.data ?? [];
  const donorList: any[]    = topDonors?.donors ?? [];
  const founderNames: string[] = extractFounderNames(foundersContent?.content ?? "");

  const allItems: Record<ChapterId, any[]> = {
    news:       news.slice(0, 9),
    campaigns:  campaignList.filter((c: any) => c.isActive !== false).slice(0, 9),
    hajj:       [],
    services:   SERVICES_STATIC,
    jobs:       jobs.slice(0, 9),
    donors:     donorList.slice(0, 9),
    about:      [],
    founders:   founderNames.map((n) => ({ name: n })),
    governance: GOVERNANCE_PAGES,
  };

  const items      = allItems[chId];
  const isSpecial  = chId === "hajj" || chId === "about";
  const totalPages = isSpecial ? 1 : Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const pageItems  = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  function goChapter(next: number, d: 1 | -1) { setDir(d); setChIdx(next); setPage(0); }
  function prevCh() { goChapter((chIdx - 1 + CHAPTER_ORDER.length) % CHAPTER_ORDER.length, -1); }
  function nextCh() { goChapter((chIdx + 1) % CHAPTER_ORDER.length, 1); }

  /* Auto-rotate every 7 s */
  useEffect(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setDir(1);
      setChIdx((c) => (c + 1) % CHAPTER_ORDER.length);
      setPage(0);
    }, 7000);
    return () => { if (timerRef.current !== null) clearInterval(timerRef.current); };
  }, [chIdx]);

  return (
    <section className="py-12 px-4" dir="rtl" style={{ background: "hsl(35 28% 97%)" }}>
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(152 50% 92%)" }}>
            <BookOpen className="w-5 h-5" style={{ color: "hsl(152 50% 30%)" }} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">ما يحدث في طويق</h2>
            <p className="text-xs text-gray-400">ملخص شامل لجميع أقسام الموقع</p>
          </div>
        </div>

        {/* Book card */}
        <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white"
          style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.07)" }}>

          {/* Scrollable chapter tabs */}
          <div className="overflow-x-auto border-b border-gray-100" style={{ scrollbarWidth: "none" }}>
            <div className="flex min-w-max">
              {CHAPTER_ORDER.map((id, idx) => {
                const m  = CHAPTER_META[id];
                const on = idx === chIdx;
                return (
                  <button key={id}
                    onClick={() => goChapter(idx, idx > chIdx ? 1 : -1)}
                    data-testid={`tab-book-${id}`}
                    className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all"
                    style={{
                      color:        on ? m.color : "#9ca3af",
                      background:   on ? m.accent : "transparent",
                      borderBottom: on ? `2.5px solid ${m.color}` : "2.5px solid transparent",
                    }}
                  >
                    <ChIcon id={id} cls="w-3.5 h-3.5" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content area */}
          <div className="relative min-h-72 p-5">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={`${chIdx}-${page}`} custom={dir}
                variants={{
                  enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 36 : -36 }),
                  center: { opacity: 1, x: 0 },
                  exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -36 : 36 }),
                }}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}>

                {/* ── Special chapters ── */}
                {chId === "hajj"  && <HajjContent  data={hajjStats}      meta={chMeta} />}
                {chId === "about" && <AboutContent data={aboutContent}   meta={chMeta} />}

                {/* ── Generic chapters ── */}
                {chId !== "hajj" && chId !== "about" && (
                  pageItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: chMeta.accent }}>
                        <ChIcon id={chId} cls="w-5 h-5" />
                      </div>
                      <p className="text-gray-400 text-sm">جاري التحميل…</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {pageItems.map((item: any, i: number) => {
                        if (chId === "donors")     return <DonorCard     key={item._id || i} item={item} meta={chMeta} rank={(page * ITEMS_PER_PAGE) + i + 1} />;
                        if (chId === "founders")   return <FounderCard   key={item.name + i} item={item} meta={chMeta} rank={(page * ITEMS_PER_PAGE) + i + 1} />;
                        if (chId === "governance") return <GovernanceCard key={item.href}    item={item} meta={chMeta} />;
                        return <BookCard key={item._id || item.id || i} item={item} chId={chId} meta={chMeta} />;
                      })}
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)} data-testid={`dot-book-${i}`}
                  className="rounded-full transition-all"
                  style={{ width: i === page ? 20 : 6, height: 6,
                           background: i === page ? chMeta.color : "#e5e7eb" }} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Link href={chMeta.href}
                className="text-xs font-bold flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: chMeta.color }} data-testid={`link-book-more-${chId}`}>
                عرض الكل <ArrowLeft className="w-3 h-3" />
              </Link>
              <button onClick={prevCh} data-testid="button-book-prev"
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={nextCh} data-testid="button-book-next"
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══ Hajj special content ══ */
function HajjContent({ data, meta }: { data: any; meta: ChapterDef }) {
  const pct       = data?.currentProgressPercent ?? 0;
  const progress  = data?.currentProgress ?? 0;
  const confirmed = data?.confirmedAmount ?? 0;
  const pending   = data?.pendingAmount ?? 0;
  const completed = data?.completedPilgrims ?? 0;
  const total     = data?.totalPilgrims ?? 0;
  const cost      = data?.hajjCost ?? 12000;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { label: "حاج مكتمل ✅", val: `${completed}`,                       clr: meta.color },
          { label: "قيد التجميع ⏳", val: `${total}`,                         clr: "#d97706" },
          { label: "تكلفة الحج",    val: `${cost.toLocaleString("ar-SA")} ر.س`, clr: "#6b7280" },
        ].map((s) => (
          <div key={s.label} className="flex-1 min-w-24 rounded-2xl p-3 text-center border border-gray-100"
            style={{ background: meta.accent }}>
            <p className="text-[11px] text-gray-400 mb-0.5">{s.label}</p>
            <p className="font-black text-lg" style={{ color: s.clr }}>{s.val}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl px-4 py-4 border border-gray-100" style={{ background: meta.accent }}>
        <div className="flex justify-between text-xs font-bold mb-2" style={{ color: meta.color }}>
          <span>🕋 نحو الحاج القادم</span>
          <span>{pct}% من {cost.toLocaleString("ar-SA")} ر.س</span>
        </div>
        <div className="relative h-4 rounded-full overflow-hidden" style={{ background: "#d1fae5" }}>
          {pending > 0 && (
            <div className="absolute inset-y-0 right-0 rounded-full"
              style={{ width: `${Math.min(100, Math.round(((confirmed + pending) % cost) / cost * 100))}%`, background: "#6ee7b7" }} />
          )}
          <div className="absolute inset-y-0 right-0 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${meta.color}, #0d9488)` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{progress.toLocaleString("ar-SA")} ر.س محصّلة</span>
          {pending > 0 && <span className="text-amber-600">+{pending.toLocaleString("ar-SA")} ر.س قيد المراجعة</span>}
        </div>
      </div>
      <Link href="/service/hajj">
        <div className="w-full text-center py-2.5 rounded-2xl font-bold text-sm text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: `linear-gradient(90deg, ${meta.color}, #16a34a)` }}
          data-testid="button-book-hajj-cta">
          ساهم في كفالة حاج الآن 🕌
        </div>
      </Link>
    </div>
  );
}

/* ══ About special content — real API ══ */
function AboutContent({ data, meta }: { data: any; meta: ChapterDef }) {
  const text = data?.content ? stripHtml(data.content, 400) : "";

  return (
    <div className="flex flex-col gap-4">
      {/* Intro text from CMS */}
      <div className="rounded-2xl p-4 border border-gray-100" style={{ background: meta.accent }}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4" style={{ color: meta.color }} />
          <span className="text-xs font-black" style={{ color: meta.color }}>نشأة الجمعية</span>
        </div>
        {text
          ? <p className="text-xs text-gray-600 leading-relaxed line-clamp-5">{text}</p>
          : <p className="text-xs text-gray-400">جاري التحميل…</p>
        }
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "الرؤية والأهداف", href: "/vision",    icon: Star },
          { label: "المؤسسون",        href: "/founders",  icon: Users },
          { label: "الجمعية العمومية",href: "/general-assembly", icon: CheckCircle2 },
          { label: "الحوكمة",         href: "/governance/charter", icon: ShieldCheck },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
              <span className="text-xs font-bold text-gray-700">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ══ Founder card ══ */
function FounderCard({ item, meta, rank }: { item: { name: string }; meta: ChapterDef; rank: number }) {
  const medals = ["🥇", "🥈", "🥉"];
  const badge  = medals[rank - 1] ?? `${rank}`;
  return (
    <div className="rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
      style={{ background: rank <= 3 ? meta.accent : "white" }}
      data-testid={`card-book-founders-${rank}`}>
      <span className="text-xl shrink-0">{badge}</span>
      <div>
        <p className="text-sm font-black text-gray-800 leading-snug">{item.name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">عضو مؤسس</p>
      </div>
    </div>
  );
}

/* ══ Governance page card ══ */
function GovernanceCard({ item, meta }: { item: typeof GOVERNANCE_PAGES[number]; meta: ChapterDef }) {
  const Icon = item.icon;
  return (
    <Link href={item.href}>
      <motion.div whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
        className="rounded-2xl border border-gray-100 p-4 cursor-pointer h-full flex flex-col gap-2"
        style={{ background: "white" }}
        data-testid={`card-book-governance-${item.href}`}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: meta.accent }}>
          <Icon className="w-4 h-4" style={{ color: meta.color }} />
        </div>
        <p className="text-sm font-black text-gray-800">{item.label}</p>
        <p className="text-xs text-gray-400 leading-relaxed flex-1">{item.desc}</p>
        <span className="text-[10px] font-bold self-start" style={{ color: meta.color }}>
          اقرأ أكثر ←
        </span>
      </motion.div>
    </Link>
  );
}

/* ══ Donor card ══ */
function DonorCard({ item, meta, rank }: { item: any; meta: ChapterDef; rank: number }) {
  const medals = ["🥇", "🥈", "🥉"];
  const medal  = medals[rank - 1] ?? `#${rank}`;
  const amount = Number(item.totalDonations) || 0;
  return (
    <div className="rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
      style={{ background: rank <= 3 ? meta.accent : "white" }}
      data-testid={`card-book-donors-${item._id ?? ""}`}>
      <span className="text-2xl shrink-0">{medal}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-gray-800 truncate">{item.name || "متبرع مجهول"}</p>
        {amount > 0 && (
          <p className="text-xs font-bold mt-0.5" style={{ color: meta.color }}>
            {amount.toLocaleString("ar-SA")} ر.س
          </p>
        )}
        <div className="flex gap-1 mt-1 flex-wrap">
          {(item.badges || []).map((b: string) => (
            <span key={b} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══ Generic content card ══ */
function BookCard({ item, chId, meta }: { item: any; chId: ChapterId; meta: ChapterDef }) {
  const title  = item.title || item.name || "—";
  const desc   = item.summary || item.description || item.desc
                 || (typeof item.body === "string" ? item.body.slice(0, 80) : "") || "";
  const date   = item.date || item.createdAt || item.publishedAt || "";
  const raised = item.totalDonations !== undefined ? Number(item.totalDonations) || 0 : null;
  const goal   = item.goalAmount ? Number(item.goalAmount) || 0 : null;
  const pct    = raised !== null && goal && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : null;
  const href   = item.link
    ?? (chId === "news"     ? `/news/${item._id ?? item.id ?? ""}`
    :   chId === "services" ? (item.link ?? meta.href)
    :   meta.href);

  return (
    <Link href={href}>
      <motion.div whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(0,0,0,0.07)" }}
        className="rounded-2xl border border-gray-100 overflow-hidden cursor-pointer h-full flex flex-col"
        style={{ background: "hsl(35 28% 99%)" }}
        data-testid={`card-book-${chId}-${item._id ?? item.id ?? ""}`}>
        <div className="h-1 w-full" style={{ background: meta.color }} />
        <div className="p-3.5 flex flex-col flex-1 gap-1.5">
          <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: meta.accent, color: meta.color }}>{meta.label}</span>
          <h4 className="text-sm font-black text-gray-800 leading-snug line-clamp-2">{title}</h4>
          {desc && <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 flex-1">{desc}</p>}
          {pct !== null && (
            <div className="mt-1">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>{raised?.toLocaleString("ar-SA")} ر.س</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
              </div>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-1 text-[10px] text-gray-300 mt-auto">
              <Calendar className="w-3 h-3" />
              <span>{new Date(date).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
