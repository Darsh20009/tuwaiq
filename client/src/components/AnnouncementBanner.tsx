import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X, Megaphone } from "lucide-react";

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: banner } = useQuery<any>({
    queryKey: ["/api/announcements/active"],
    queryFn: async () => {
      const r = await fetch("/api/announcements/active");
      return r.ok ? r.json() : null;
    },
    staleTime: 60000,
    retry: false,
  });

  if (!banner || dismissed) return null;

  const bgMap: Record<string, string> = {
    green: "bg-primary text-white",
    blue: "bg-blue-600 text-white",
    amber: "bg-amber-500 text-white",
    red: "bg-red-600 text-white",
    purple: "bg-purple-600 text-white",
    dark: "bg-gray-900 text-white",
  };
  const bgClass = bgMap[banner.bgColor] || bgMap.green;

  const inner = (
    <div
      className={`${bgClass} py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium relative print:hidden`}
      dir="rtl"
    >
      <Megaphone className="w-4 h-4 shrink-0 opacity-80" />
      <span className="text-center leading-snug">{banner.message}</span>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/20 transition-colors"
        aria-label="إغلاق"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  if (banner.link) {
    return (
      <a href={banner.link} className="block hover:opacity-95 transition-opacity">
        {inner}
      </a>
    );
  }

  return inner;
}
