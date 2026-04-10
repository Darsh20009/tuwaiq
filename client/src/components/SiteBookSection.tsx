import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Newspaper, Heart, Briefcase, Globe2,
  ChevronRight, ChevronLeft, ArrowLeft, BookOpen,
  Calendar, Trophy, Users, Info, Calculator,
  MapPin, Star, Award, Tent,
} from "lucide-react";

/* ─── Chapter definitions (no JSX at module level) ─── */
type ChapterId =
  | "news" | "campaigns" | "hajj" | "services"
  | "jobs" | "donors" | "about" | "zakat";

type ChapterDef = {
  label: string;
  color: string;
  accent: string;
  href: string;
};

const CHAPTER_META: Record<ChapterId, ChapterDef> = {
  news:      { label: "آخر الأخبار",   color: "#2563eb", accent: "#eff6ff", href: "/news" },
  campaigns: { label: "حملاتنا",       color: "#16a34a", accent: "#f0fdf4", href: "/campaigns" },
  hajj:      { label: "كفالة حاج",     color: "#0d9488", accent: "#f0fdfa", href: "/service/hajj" },
  services:  { label: "خدماتنا",       color: "#7c3aed", accent: "#f5f3ff", href: "/services" },
  jobs:      { label: "فرص العمل",     color: "#d97706", accent: "#fffbeb", href: "/jobs" },
  donors:    { label: "المتبرعون",     color: "#b45309", accent: "#fef3c7", href: "/leaderboard" },
  about:     { label: "عن الجمعية",    color: "#0f766e", accent: "#f0fdfa", href: "/about" },
  zakat:     { label: "حاسبة الزكاة",  color: "#059669", accent: "#ecfdf5", href: "/zakat" },
};

const CHAPTER_ORDER: ChapterId[] = [
  "news", "campaigns", "hajj", "services", "jobs", "donors", "about", "zakat",
];

/* ─── Static data ─── */
const SERVICES_STATIC = [
  { title: "برنامج الحج الميسّر",         desc: "تيسير فريضة الحج للمستحقين من المواطنين",      link: "/service/hajj" },
  { title: "كسوة الشتاء",                 desc: "توزيع الملابس الشتوية على الأسر المحتاجة",     link: "/service/winter" },
  { title: "السلة الغذائية",              desc: "توفير احتياجات غذائية أساسية للأسر المعدمة",   link: "/service/food" },
  { title: "إفطار الصائمين",              desc: "موائد إفطار جماعية طوال شهر رمضان المبارك",   link: "/service/iftar" },
  { title: "دعم الأسر الأولى بالرعاية",  desc: "برامج شاملة لدعم الأسر الهشة اجتماعياً",      link: "/service/family" },
  { title: "مياه الآبار",                 desc: "حفر آبار المياه في المناطق المحرومة",          link: "/service/water" },
  { title: "كفالة اليتيم",               desc: "كفالة الأيتام وتأمين احتياجاتهم الأساسية",     link: "/service/orphan" },
  { title: "تفريج الكربات",              desc: "مساعدة المتضررين في أوقات الأزمات",            link: "/service/relief" },
  { title: "كفالة الأسر الأرامل",        desc: "دعم الأسر الأرامل والمطلقات المحتاجة",         link: "/service/families" },
];

const ABOUT_STATIC = {
  name:    "جمعية طويق للخدمات الإنسانية",
  city:    "الرياض، المملكة العربية السعودية",
  license: "17660",
  reg:     "1000823030",
  domain:  "tuwaiqassociation.sa",
  vision:  "نسعى لبناء مجتمع خالٍ من الفقر والحاجة، من خلال تقديم الخدمات الإنسانية المتكاملة.",
  mission: "تقديم الدعم والمساعدة لمستحقيها من المواطنين عبر برامج مستدامة وشفافة.",
  values:  ["الأمانة", "الشفافية", "الكفاءة", "التكامل", "الإبداع"],
  bankAccounts: [
    { bank: "مصرف الراجحي",            iban: "SA3080 0005896080195679 23" },
    { bank: "البنك العربي الوطني ANB", iban: "SA6930 4001809581039 0018" },
    { bank: "بنك البلاد",              iban: "SA2315 0009999146128000007" },
  ],
};

const ZAKAT_NISAB = 595;
const ZAKAT_RATE  = 0.025;

/* ─── Icon renderer ─── */
function ChIcon({ id, cls }: { id: ChapterId; cls?: string }) {
  const c = cls ?? "w-4 h-4";
  if (id === "news")      return <Newspaper  className={c} />;
  if (id === "campaigns") return <Heart      className={c} />;
  if (id === "hajj")      return <Tent       className={c} />;
  if (id === "services")  return <Globe2     className={c} />;
  if (id === "jobs")      return <Briefcase  className={c} />;
  if (id === "donors")    return <Trophy     className={c} />;
  if (id === "about")     return <Info       className={c} />;
  return <Calculator className={c} />;
}

const ITEMS_PER_PAGE = 3;

export function SiteBookSection() {
  const [chIdx,    setChIdx]    = useState(0);
  const [dir,      setDir]      = useState<1 | -1>(1);
  const [page,     setPage]     = useState(0);
  const timerRef               = useRef<number | null>(null);

  const chId   = CHAPTER_ORDER[chIdx];
  const chMeta = CHAPTER_META[chId];

  const { data: news      = [] } = useQuery<any[]>({ queryKey: ["/api/news"],                   staleTime: 120_000 });
  const { data: campaigns      } = useQuery<any>  ({ queryKey: ["/api/campaigns"],              staleTime: 120_000 });
  const { data: jobs      = [] } = useQuery<any[]>({ queryKey: ["/api/jobs"],                   staleTime: 180_000 });
  const { data: hajjStats      } = useQuery<any>  ({ queryKey: ["/api/donations/hajj-stats"],   staleTime: 30_000 });
  const { data: topDonors      } = useQuery<any>  ({ queryKey: ["/api/donations/top-donors"],   staleTime: 60_000 });

  const campaignList: any[] = Array.isArray(campaigns)
    ? campaigns
    : (campaigns as any)?.data ?? [];

  const donorList: any[] = topDonors?.donors ?? [];

  const allItems: Record<ChapterId, any[]> = {
    news:      news.slice(0, 9),
    campaigns: campaignList.filter((c: any) => c.isActive !== false).slice(0, 9),
    hajj:      [],
    services:  SERVICES_STATIC,
    jobs:      jobs.slice(0, 9),
    donors:    donorList.slice(0, 9),
    about:     [],
    zakat:     [],
  };

  const items      = allItems[chId];
  const totalPages = chId === "hajj" || chId === "about" || chId === "zakat"
    ? 1
    : Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const pageItems  = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  function goChapter(next: number, d: 1 | -1) {
    setDir(d); setChIdx(next); setPage(0);
  }

  function prevCh() { goChapter((chIdx - 1 + CHAPTER_ORDER.length) % CHAPTER_ORDER.length, -1); }
  function nextCh() { goChapter((chIdx + 1) % CHAPTER_ORDER.length, 1); }

  /* Auto-rotate chapters every 7 s */
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

        {/* Book */}
        <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white"
          style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.07)" }}>

          {/* Chapter tabs — scrollable */}
          <div className="overflow-x-auto border-b border-gray-100"
            style={{ scrollbarWidth: "none" }}>
            <div className="flex min-w-max">
              {CHAPTER_ORDER.map((id, idx) => {
                const m  = CHAPTER_META[id];
                const on = idx === chIdx;
                return (
                  <button key={id}
                    onClick={() => goChapter(idx, idx > chIdx ? 1 : -1)}
                    data-testid={`tab-book-${id}`}
                    className="flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold whitespace-nowrap transition-all"
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

          {/* Page content */}
          <div className="relative min-h-72 p-5">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={`${chIdx}-${page}`}
                custom={dir}
                variants={{
                  enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 36 : -36 }),
                  center: { opacity: 1, x: 0 },
                  exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -36 : 36 }),
                }}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                {chId === "hajj"  && <HajjContent  data={hajjStats}  meta={chMeta} />}
                {chId === "about" && <AboutContent meta={chMeta} />}
                {chId === "zakat" && <ZakatContent meta={chMeta} />}

                {chId !== "hajj" && chId !== "about" && chId !== "zakat" && (
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
                      {pageItems.map((item: any, i: number) => (
                        chId === "donors"
                          ? <DonorCard key={item._id || i} item={item} meta={chMeta} rank={(page * ITEMS_PER_PAGE) + i + 1} />
                          : <BookCard  key={item._id || item.id || i} item={item} chId={chId} meta={chMeta} />
                      ))}
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            {/* Page dots */}
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
                style={{ color: chMeta.color }}
                data-testid={`link-book-more-${chId}`}>
                عرض الكل <ArrowLeft className="w-3 h-3" />
              </Link>
              <button onClick={prevCh}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                data-testid="button-book-prev">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={nextCh}
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

/* ─── Hajj special content ─── */
function HajjContent({ data, meta }: { data: any; meta: ChapterDef }) {
  const pct      = data?.currentProgressPercent ?? 0;
  const progress = data?.currentProgress ?? 0;
  const confirmed = data?.confirmedAmount ?? 0;
  const pending   = data?.pendingAmount ?? 0;
  const completed = data?.completedPilgrims ?? 0;
  const total     = data?.totalPilgrims ?? 0;
  const cost      = data?.hajjCost ?? 12000;

  return (
    <div className="flex flex-col gap-5">
      {/* Hero stat */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { label: "مكتمل ✅", val: `${completed} حاج`, color: meta.color },
          { label: "قيد التجميع ⏳", val: `${total} حاج`, color: "#d97706" },
          { label: "تكلفة الحج", val: `${cost.toLocaleString("ar-SA")} ر.س`, color: "#6b7280" },
        ].map((s) => (
          <div key={s.label} className="flex-1 min-w-28 rounded-2xl p-3 text-center border border-gray-100"
            style={{ background: meta.accent }}>
            <p className="text-[11px] text-gray-400 mb-0.5">{s.label}</p>
            <p className="font-black text-base" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl px-4 py-4 border border-gray-100" style={{ background: meta.accent }}>
        <div className="flex justify-between text-xs font-bold mb-2" style={{ color: meta.color }}>
          <span>🕋 نحو الحاج القادم</span>
          <span>{pct}% من 12,000 ر.س</span>
        </div>
        <div className="relative h-4 rounded-full overflow-hidden" style={{ background: "#d1fae5" }}>
          {pending > 0 && (
            <div className="absolute inset-y-0 right-0 rounded-full"
              style={{
                width: `${Math.min(100, Math.round(((confirmed + pending) % cost) / cost * 100))}%`,
                background: "#6ee7b7",
              }} />
          )}
          <div className="absolute inset-y-0 right-0 rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${meta.color}, #0d9488)`,
            }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{progress.toLocaleString("ar-SA")} ر.س محصّلة</span>
          {pending > 0 && (
            <span className="text-amber-600">+{pending.toLocaleString("ar-SA")} ر.س قيد المراجعة</span>
          )}
        </div>
      </div>

      {/* CTA */}
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

/* ─── About special content ─── */
function AboutContent({ meta }: { meta: ChapterDef }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {/* Info cards */}
        <div className="flex-1 min-w-40 rounded-2xl p-4 border border-gray-100" style={{ background: meta.accent }}>
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" style={{ color: meta.color }} />
            <span className="text-xs font-black" style={{ color: meta.color }}>معلومات الجمعية</span>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400" />{ABOUT_STATIC.city}</p>
            <p>رقم الترخيص: <span className="font-bold">{ABOUT_STATIC.license}</span></p>
            <p>رقم السجل: <span className="font-bold">{ABOUT_STATIC.reg}</span></p>
            <p>النطاق: <span className="font-bold">{ABOUT_STATIC.domain}</span></p>
          </div>
        </div>
        <div className="flex-1 min-w-40 rounded-2xl p-4 border border-gray-100" style={{ background: "white" }}>
          <p className="text-xs font-black mb-2 text-gray-700">الرؤية والرسالة</p>
          <p className="text-xs text-gray-500 leading-relaxed mb-2">{ABOUT_STATIC.vision}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{ABOUT_STATIC.mission}</p>
        </div>
      </div>

      {/* Values */}
      <div>
        <p className="text-xs font-black text-gray-600 mb-2 flex items-center gap-1">
          <Star className="w-3.5 h-3.5" style={{ color: meta.color }} /> قيمنا
        </p>
        <div className="flex flex-wrap gap-2">
          {ABOUT_STATIC.values.map((v) => (
            <span key={v} className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: meta.accent, color: meta.color }}>{v}</span>
          ))}
        </div>
      </div>

      {/* Bank accounts */}
      <div>
        <p className="text-xs font-black text-gray-600 mb-2">الحسابات البنكية</p>
        <div className="space-y-1.5">
          {ABOUT_STATIC.bankAccounts.map((b) => (
            <div key={b.bank} className="flex items-center justify-between text-xs border border-gray-100 rounded-xl px-3 py-2">
              <span className="font-bold text-gray-700">{b.bank}</span>
              <span className="text-gray-400 font-mono text-[10px] dir-ltr">{b.iban}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Zakat special content ─── */
function ZakatContent({ meta }: { meta: ChapterDef }) {
  const [gold,  setGold]  = useState("");
  const [money, setMoney] = useState("");

  const goldVal  = parseFloat(gold)  || 0;
  const moneyVal = parseFloat(money) || 0;
  const goldSar  = goldVal * 225;
  const total    = goldSar + moneyVal;
  const eligible = total >= ZAKAT_NISAB * 225;
  const zakatDue = eligible ? Math.round(total * ZAKAT_RATE) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4 border border-gray-100" style={{ background: meta.accent }}>
        <p className="text-xs font-black mb-3" style={{ color: meta.color }}>
          <Calculator className="w-3.5 h-3.5 inline ml-1" />
          احسب زكاتك الآن
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">الذهب (بالجرام)</label>
            <input type="number" value={gold} onChange={e => setGold(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-right outline-none focus:border-emerald-400"
              data-testid="input-zakat-gold" />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">المال والمدخرات (ر.س)</label>
            <input type="number" value={money} onChange={e => setMoney(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-right outline-none focus:border-emerald-400"
              data-testid="input-zakat-money" />
          </div>
        </div>
        {(goldVal > 0 || moneyVal > 0) && (
          <div className={`rounded-xl p-3 text-center ${eligible ? "bg-emerald-100" : "bg-gray-100"}`}>
            {eligible ? (
              <>
                <p className="text-xs text-emerald-700 mb-1">زكاتك المستحقة</p>
                <p className="text-2xl font-black text-emerald-700">
                  {zakatDue.toLocaleString("ar-SA")} ر.س
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-500">
                إجمالي مالك ({total.toLocaleString("ar-SA")} ر.س) لم يبلغ النصاب بعد
              </p>
            )}
          </div>
        )}
      </div>
      <div className="text-xs text-gray-400 leading-relaxed text-center">
        النصاب = {ZAKAT_NISAB} جرام ذهب ≈ {(ZAKAT_NISAB * 225).toLocaleString("ar-SA")} ر.س · نسبة الزكاة: 2.5%
      </div>
      {eligible && zakatDue > 0 && (
        <Link href={`/donate?amount=${zakatDue}&type=zakat`}>
          <div className="w-full text-center py-2.5 rounded-2xl font-bold text-sm text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: `linear-gradient(90deg, ${meta.color}, #16a34a)` }}
            data-testid="button-book-zakat-donate">
            تبرع بزكاتك عبر بوابة طويق
          </div>
        </Link>
      )}
    </div>
  );
}

/* ─── Donor card ─── */
function DonorCard({ item, meta, rank }: { item: any; meta: ChapterDef; rank: number }) {
  const name   = item.name || "متبرع مجهول";
  const amount = Number(item.totalDonations) || 0;
  const medals = ["🥇", "🥈", "🥉"];
  const medal  = medals[rank - 1] ?? `#${rank}`;

  return (
    <div className="rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
      style={{ background: rank <= 3 ? meta.accent : "white" }}
      data-testid={`card-book-donors-${item._id ?? ""}`}>
      <span className="text-2xl shrink-0">{medal}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-gray-800 truncate">{name}</p>
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
      {item.level && (
        <Award className="w-4 h-4 shrink-0" style={{ color: item.level === "gold" ? "#d97706" : item.level === "silver" ? "#9ca3af" : "#b45309" }} />
      )}
    </div>
  );
}

/* ─── Generic card ─── */
function BookCard({
  item, chId, meta,
}: {
  item: any;
  chId: ChapterId;
  meta: ChapterDef;
}) {
  const title  = item.title || item.name || "—";
  const desc   = item.summary || item.description || item.desc
                 || (typeof item.body === "string" ? item.body.slice(0, 80) : "") || "";
  const date   = item.date || item.createdAt || item.publishedAt || "";
  const raised = item.totalDonations !== undefined ? Number(item.totalDonations) || 0 : null;
  const goal   = item.goalAmount     ? Number(item.goalAmount)   || 0 : null;
  const pct    = raised !== null && goal && goal > 0
    ? Math.min(100, Math.round((raised / goal) * 100)) : null;

  const href =
    item.link
    ?? (chId === "news"      ? `/news/${item._id ?? item.id ?? ""}`
    :   chId === "campaigns" ? `/campaigns`
    :   chId === "jobs"      ? `/jobs`
    :   chId === "services"  ? (item.link ?? meta.href)
    :   meta.href);

  return (
    <Link href={href}>
      <motion.div whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
        className="rounded-2xl border border-gray-100 overflow-hidden cursor-pointer h-full flex flex-col"
        style={{ background: "hsl(35 28% 99%)" }}
        data-testid={`card-book-${chId}-${item._id ?? item.id ?? ""}`}>
        <div className="h-1 w-full" style={{ background: meta.color }} />
        <div className="p-3.5 flex flex-col flex-1 gap-1.5">
          <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: meta.accent, color: meta.color }}>
            {meta.label}
          </span>
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
              <span>
                {new Date(date).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
