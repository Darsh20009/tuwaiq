import { useState } from "react";
import { Link } from "wouter";
import { Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const QUICK_SERVICES = [
  { id: "general",  label: "تبرع عام",    slug: "" },
  { id: "umrah",    label: "كفالة عمرة",  slug: "umrah" },
  { id: "families", label: "كفالة أسر",   slug: "families" },
  { id: "orphan",   label: "كفالة يتيم",  slug: "orphan" },
  { id: "relief",   label: "تفريج كربة",  slug: "relief" },
];

const QUICK_AMOUNTS: Record<string, number[]> = {
  general:  [15, 50, 100, 200, 500, 1000],
  umrah:    [100, 300, 500, 1000, 1500, 3000],
  families: [15, 50, 100, 200, 500],
  orphan:   [100, 200, 350, 500, 1000],
  relief:   [15, 50, 100, 200, 500],
};

const UMRAH_LABELS: Record<number, string> = {
  100: "مساهمة رمزية", 300: "مساهمة", 500: "مساهمة كبيرة",
  1000: "ربع كفالة", 1500: "نصف كفالة", 3000: "كفالة معتمر كاملة",
};

interface Props {
  onAmountSelect?: (amount: number, serviceSlug: string) => void;
  defaultService?: string;
}

export function QuickDonateStrip({ onAmountSelect, defaultService = "general" }: Props) {
  const [activeService, setActiveService] = useState(defaultService);
  const amounts = QUICK_AMOUNTS[activeService] || QUICK_AMOUNTS.general;
  const serviceSlug = QUICK_SERVICES.find(s => s.id === activeService)?.slug || "";

  const donateLink = (a: number) =>
    serviceSlug
      ? `/donate?amount=${a}&campaignId=${serviceSlug}`
      : `/donate?amount=${a}`;

  const { data: umrahStats } = useQuery<any>({
    queryKey: ["/api/donations/umrah-stats"],
    queryFn: async () => {
      const r = await fetch("/api/donations/umrah-stats");
      return r.ok ? r.json() : null;
    },
    enabled: activeService === "umrah",
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  return (
    <div className="bg-white border-b" style={{ borderColor: "hsl(35 20% 84%)" }} dir="rtl">
      <div className="container mx-auto px-4 py-3 flex flex-col gap-2.5">

        {/* Row 1 – label + service tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm font-bold shrink-0 ml-1" style={{ color: "hsl(152 42% 28%)" }}>
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">تبرع سريع:</span>
          </div>
          {QUICK_SERVICES.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveService(s.id)}
              className="px-3 py-1 text-xs font-bold rounded-full border transition-all duration-150"
              style={
                activeService === s.id
                  ? { backgroundColor: "hsl(152 42% 28%)", color: "white", borderColor: "hsl(152 42% 28%)" }
                  : { backgroundColor: "white", color: "hsl(152 42% 36%)", borderColor: "hsl(152 42% 72%)" }
              }
              data-testid={`button-service-tab-${s.id}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Umrah Progress Bar */}
        {activeService === "umrah" && umrahStats && (
          <div className="rounded-xl px-4 py-3 border" style={{ background: "hsl(270 40% 97%)", borderColor: "hsl(270 40% 82%)" }}>
            <div className="flex items-center justify-between mb-2 text-xs font-bold" style={{ color: "hsl(270 42% 38%)" }}>
              <span>🕋 تقدم كفالة المعتمرين</span>
              <span style={{ color: "hsl(35 80% 45%)" }}>
                {umrahStats.completedPilgrims > 0
                  ? `${umrahStats.completedPilgrims} معتمر مكتمل ✅`
                  : umrahStats.totalPilgrims > 0
                  ? `${umrahStats.totalPilgrims} معتمر في الطريق ⏳`
                  : "نحو أول معتمر"}
              </span>
            </div>
            <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "hsl(270 40% 88%)" }}>
              {umrahStats.pendingAmount > 0 && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round(((umrahStats.confirmedAmount || 0) + umrahStats.pendingAmount) % umrahStats.umrahCost / umrahStats.umrahCost * 100))}%`,
                    background: "hsl(270 40% 68%)",
                  }}
                />
              )}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{
                  width: `${umrahStats.currentProgressPercent}%`,
                  background: "linear-gradient(90deg, hsl(270 52% 48%) 0%, hsl(260 52% 34%) 100%)",
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[11px]" style={{ color: "hsl(270 30% 45%)" }}>
              <span>
                {umrahStats.currentProgress > 0
                  ? `${umrahStats.currentProgress.toLocaleString("ar-SA")} ر.س نحو المعتمر القادم`
                  : "لم تتجمع تبرعات بعد"}
                {umrahStats.pendingAmount > 0 && (
                  <span className="mr-1 text-amber-600">(+ {umrahStats.pendingAmount.toLocaleString("ar-SA")} ر.س قيد المراجعة)</span>
                )}
              </span>
              <span className="font-bold">{umrahStats.currentProgressPercent}% من 3,000 ر.س</span>
            </div>
          </div>
        )}

        {/* Row 2 – amount buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {amounts.map((a) => {
            const isFullUmrah = activeService === "umrah" && a === 3000;
            const btnStyle = isFullUmrah
              ? { borderColor: "hsl(35 80% 45%)", color: "white", backgroundColor: "hsl(35 80% 45%)" }
              : { borderColor: "hsl(152 42% 72%)", color: "hsl(152 42% 28%)", backgroundColor: "white" };

            const inner = (
              <button
                className="px-3.5 py-1.5 text-sm font-bold rounded-lg border-2 transition-all duration-150 hover:shadow-sm flex flex-col items-center leading-tight"
                style={btnStyle}
                onMouseOver={e => {
                  if (!isFullUmrah) {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.backgroundColor = "hsl(152 42% 28%)";
                    b.style.color = "white";
                  }
                }}
                onMouseOut={e => {
                  if (!isFullUmrah) {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.backgroundColor = "white";
                    b.style.color = "hsl(152 42% 28%)";
                  }
                }}
                onClick={onAmountSelect ? () => onAmountSelect(a, serviceSlug) : undefined}
                data-testid={`button-quick-${activeService}-${a}`}
              >
                <span>{a.toLocaleString("ar-SA")} ر.س</span>
                {activeService === "umrah" && UMRAH_LABELS[a] && (
                  <span className="text-[10px] opacity-80">{UMRAH_LABELS[a]}</span>
                )}
              </button>
            );

            return onAmountSelect ? (
              <div key={a}>{inner}</div>
            ) : (
              <Link key={a} href={donateLink(a)}>{inner}</Link>
            );
          })}

          {onAmountSelect ? (
            <button
              className="px-4 py-1.5 text-sm font-bold rounded-lg text-white transition-all hover:shadow-md hover:opacity-90"
              style={{ backgroundColor: "hsl(28 44% 59%)" }}
              onClick={() => onAmountSelect(0, serviceSlug)}
              data-testid="button-custom-amount"
            >
              مبلغ آخر
            </button>
          ) : (
            <Link href={serviceSlug ? `/donate?campaignId=${serviceSlug}` : "/donate"}>
              <button
                className="px-4 py-1.5 text-sm font-bold rounded-lg text-white transition-all hover:shadow-md hover:opacity-90"
                style={{ backgroundColor: "hsl(28 44% 59%)" }}
                data-testid="button-custom-amount"
              >
                مبلغ آخر
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
