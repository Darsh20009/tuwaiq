import { useState, useEffect } from "react";

const LOGO = "/images/logo.jpeg";
const BASE = "https://563533bc-9327-4bb0-bd90-f2324365f1e7-00-x1i1tpbmkjm0.kirk.replit.dev";

const NEWS_ITEMS = [
  {
    id: 1,
    cat: "إعلانات",
    catColor: "#16a34a",
    title: "جمعية طويق تطلق حملة سقيا الماء للصيف 1446",
    summary: "انطلاق الحملة السنوية لتوزيع المياه على المحتاجين في الرياض وضواحيها.",
    date: "١٢ ربيع الآخر ١٤٤٦",
    img: null,
  },
  {
    id: 2,
    cat: "فعاليات",
    catColor: "#0284c7",
    title: "توزيع أكثر من ٥٠٠ سلة غذائية في حي العريجاء",
    summary: "وزّعت الجمعية بالتعاون مع المتطوعين ٥٠٠ سلة غذائية متكاملة على الأسر المحتاجة.",
    date: "٨ ربيع الآخر ١٤٤٦",
    img: null,
  },
  {
    id: 3,
    cat: "تقارير",
    catColor: "#d97706",
    title: "تقرير شفافية عمليات التبرع — الربع الأول ١٤٤٦",
    summary: "نشرت الجمعية تقريرها الدوري الشامل لجميع العمليات الإنسانية والمالية.",
    date: "٥ ربيع الآخر ١٤٤٦",
    img: null,
  },
];

// ── Phone-screen content (Home preview) ─────────────────────────────────────
function PhoneHome() {
  return (
    <div
      dir="rtl"
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg,#14532d 0%,#166534 60%,#f0fdf4 60%)",
        fontFamily: "'Tajawal', 'Cairo', Arial, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Status bar */}
      <div style={{ height: 28, background: "#14532d", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px" }}>
        <span style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>9:41</span>
        <div style={{ display: "flex", gap: 4 }}>
          <span style={{ width: 12, height: 6, border: "1.5px solid #fff", borderRadius: 2, position: "relative" }}>
            <span style={{ position: "absolute", inset: "1.5px", background: "#fff", right: 2, left: "auto", width: "70%", borderRadius: 1 }} />
          </span>
          <span style={{ fontSize: 8, color: "#fff" }}>▲ ▼</span>
          <span style={{ fontSize: 8, color: "#fff" }}>WiFi</span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: "#14532d", padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src={`${BASE}/images/logo.jpeg`} alt="logo" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #86efac" }} />
        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>جمعية طويق</span>
        <span style={{ fontSize: 14, color: "#86efac" }}>☰</span>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#14532d,#16a34a)", padding: "18px 12px 22px", textAlign: "center" }}>
        <div style={{ fontSize: 10, color: "#86efac", marginBottom: 4, fontWeight: 600 }}>رقم الترخيص: ١٧٦٦٠</div>
        <h1 style={{ color: "#fff", fontSize: 14, fontWeight: 800, margin: "0 0 6px", lineHeight: 1.4 }}>معاً نصنع الأثر</h1>
        <p style={{ color: "#bbf7d0", fontSize: 8.5, margin: "0 0 10px" }}>جمعية طويق للخدمات الإنسانية — شريككم في العطاء</p>
        <div style={{ display: "inline-block", background: "#fff", color: "#16a34a", borderRadius: 20, padding: "5px 14px", fontSize: 9, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          تبرع الآن
        </div>
      </div>

      {/* Stats row */}
      <div style={{ background: "#fff", display: "flex", borderBottom: "1px solid #e5e7eb" }}>
        {[["٥٠٠٠+", "مستفيد"], ["١٢٠+", "متطوع"], ["٣٠+", "مشروع"]].map(([num, label]) => (
          <div key={label} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderLeft: "1px solid #e5e7eb" }}>
            <div style={{ color: "#16a34a", fontSize: 12, fontWeight: 800 }}>{num}</div>
            <div style={{ color: "#6b7280", fontSize: 7.5 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* News cards */}
      <div style={{ background: "#f0fdf4", padding: "10px 10px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#14532d" }}>آخر الأخبار</span>
          <span style={{ fontSize: 8, color: "#16a34a" }}>عرض الكل ←</span>
        </div>
        {NEWS_ITEMS.slice(0, 2).map((n) => (
          <div key={n.id} style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", marginBottom: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <span style={{ background: n.catColor + "20", color: n.catColor, borderRadius: 10, padding: "1px 6px", fontSize: 7, fontWeight: 600, display: "inline-block", marginBottom: 3 }}>{n.cat}</span>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4, marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 7.5, color: "#6b7280" }}>{n.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tablet-screen content (News listing) ────────────────────────────────────
function TabletNews() {
  return (
    <div
      dir="rtl"
      style={{
        width: "100%",
        height: "100%",
        background: "#f8fafc",
        fontFamily: "'Tajawal', 'Cairo', Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#14532d,#16a34a)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={`${BASE}/images/logo.jpeg`} alt="logo" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #86efac" }} />
          <div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>جمعية طويق للخدمات الإنسانية</div>
            <div style={{ color: "#86efac", fontSize: 8 }}>رقم السجل: ١٠٠٠٨٢٣٠٣٠</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {["الرئيسية", "الخدمات", "الأخبار", "تبرع"].map(item => (
            <span key={item} style={{ color: item === "الأخبار" ? "#fbbf24" : "#bbf7d0", fontSize: 9, fontWeight: 600, cursor: "pointer", borderBottom: item === "الأخبار" ? "1.5px solid #fbbf24" : "none", paddingBottom: 2 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Hero banner */}
      <div style={{ background: "linear-gradient(90deg,#0f172a,#14532d)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#86efac", fontSize: 9, fontWeight: 600, marginBottom: 4, letterSpacing: 0.5 }}>⬥ آخر الأخبار والفعاليات</div>
          <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 6px" }}>أخبار جمعية طويق</h1>
          <p style={{ color: "#9ca3af", fontSize: 9.5, margin: 0 }}>ابقَ على اطلاع بآخر أنشطتنا ومشاريعنا الإنسانية</p>
        </div>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "2px solid rgba(134,239,172,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={`${BASE}/images/logo.jpeg`} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
        </div>
      </div>

      {/* News grid */}
      <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {NEWS_ITEMS.map((n) => (
          <div key={n.id} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0" }}>
            <div style={{ height: 50, background: `linear-gradient(135deg, ${n.catColor}30, ${n.catColor}10)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px" }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: n.catColor }}>{n.cat}</span>
            </div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.5, marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 7.5, color: "#6b7280", lineHeight: 1.4, marginBottom: 6 }}>{n.summary}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 7, color: "#9ca3af" }}>{n.date}</span>
                <span style={{ fontSize: 7.5, color: n.catColor, fontWeight: 600 }}>اقرأ المزيد ←</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e5e7eb", display: "flex", padding: "6px 16px", justifyContent: "space-around" }}>
        {[["🏠", "الرئيسية"], ["📰", "الأخبار"], ["💚", "تبرع"], ["👤", "حسابي"]].map(([icon, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14 }}>{icon}</div>
            <div style={{ fontSize: 7, color: "#6b7280" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Second Phone (Donate page) ───────────────────────────────────────────────
function PhoneDonate() {
  return (
    <div
      dir="rtl"
      style={{
        width: "100%",
        height: "100%",
        background: "#fff",
        fontFamily: "'Tajawal', 'Cairo', Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ background: "#14532d", padding: "28px 12px 12px", textAlign: "center" }}>
        <img src={`${BASE}/images/logo.jpeg`} alt="logo" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #86efac", marginBottom: 4 }} />
        <div style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>تبرع الآن</div>
        <div style={{ color: "#86efac", fontSize: 7.5 }}>بوابة دفع آمنة</div>
      </div>

      {/* Amount selector */}
      <div style={{ padding: "12px 12px 0" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", marginBottom: 6 }}>اختر مبلغ التبرع</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
          {["٥٠ ريال", "١٠٠ ريال", "٢٠٠ ريال", "٥٠٠ ريال", "١٠٠٠ ريال", "مبلغ آخر"].map((a, i) => (
            <div key={a} style={{ background: i === 1 ? "#14532d" : "#f0fdf4", border: `1.5px solid ${i === 1 ? "#14532d" : "#bbf7d0"}`, borderRadius: 8, padding: "5px 0", textAlign: "center", fontSize: 8, fontWeight: 700, color: i === 1 ? "#fff" : "#14532d", cursor: "pointer" }}>{a}</div>
          ))}
        </div>

        {/* Campaign select */}
        <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", marginBottom: 4 }}>اختر الحملة</div>
        <div style={{ border: "1.5px solid #d1d5db", borderRadius: 8, padding: "7px 10px", fontSize: 8.5, color: "#374151", background: "#fff", marginBottom: 8 }}>سقيا الماء ▾</div>

        {/* Name */}
        <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", marginBottom: 4 }}>الاسم (اختياري)</div>
        <div style={{ border: "1.5px solid #d1d5db", borderRadius: 8, padding: "7px 10px", fontSize: 8, color: "#9ca3af", marginBottom: 10 }}>أدخل اسمك...</div>

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg,#16a34a,#14532d)", borderRadius: 10, padding: "10px", textAlign: "center", color: "#fff", fontSize: 11, fontWeight: 800, boxShadow: "0 4px 12px rgba(22,163,74,0.4)", cursor: "pointer" }}>
          ادفع ١٠٠ ريال 💚
        </div>
        <div style={{ textAlign: "center", marginTop: 6, fontSize: 7.5, color: "#9ca3af" }}>
          🔒 مدفوعات آمنة عبر الراجحي
        </div>

        {/* Methods */}
        <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "center" }}>
          {["مدى", "Visa", "مسترcard", "Apple Pay"].map(m => (
            <div key={m} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 6px", fontSize: 7, color: "#374151", fontWeight: 600 }}>{m}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── iPhone 14 Pro frame ──────────────────────────────────────────────────────
function IPhoneFrame({ children, color = "#1a1a1a" }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Outer body */}
      <div
        style={{
          width: 200,
          height: 420,
          background: color,
          borderRadius: 36,
          padding: 6,
          boxShadow: "0 0 0 2px #3a3a3a, 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        {/* Side buttons */}
        <div style={{ position: "absolute", top: 80, left: -3, width: 3, height: 28, background: color, borderRadius: "2px 0 0 2px", boxShadow: "-1px 0 0 rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", top: 120, left: -3, width: 3, height: 40, background: color, borderRadius: "2px 0 0 2px", boxShadow: "-1px 0 0 rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", top: 170, left: -3, width: 3, height: 40, background: color, borderRadius: "2px 0 0 2px", boxShadow: "-1px 0 0 rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", top: 120, right: -3, width: 3, height: 60, background: color, borderRadius: "0 2px 2px 0", boxShadow: "1px 0 0 rgba(255,255,255,0.1)" }} />

        {/* Screen */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#000",
            borderRadius: 30,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Dynamic Island */}
          <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 60, height: 18, background: "#000", borderRadius: 20, zIndex: 10, border: "2px solid #111" }} />

          {/* Screen content */}
          <div style={{ position: "absolute", inset: 0 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── iPad frame ───────────────────────────────────────────────────────────────
function IPadFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          width: 460,
          height: 620,
          background: "#1c1c1e",
          borderRadius: 28,
          padding: 8,
          boxShadow: "0 0 0 2px #3a3a3a, 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
          position: "relative",
        }}
      >
        {/* Home button area (top camera) */}
        <div style={{ position: "absolute", top: "50%", left: 5, transform: "translateY(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#333" }} />
        {/* Buttons */}
        <div style={{ position: "absolute", top: 60, right: -2, width: 2, height: 50, background: "#333", borderRadius: "0 2px 2px 0" }} />
        <div style={{ position: "absolute", top: 120, right: -2, width: 2, height: 35, background: "#333", borderRadius: "0 2px 2px 0" }} />

        {/* Screen */}
        <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 22, overflow: "hidden", position: "relative" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main mockup ──────────────────────────────────────────────────────────────
export default function TuwaiqDevices() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0a1628 0%,#0d2d1a 50%,#0a1628 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
        fontFamily: "'Tajawal','Cairo',Arial,sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      {[
        { size: 400, x: -100, y: -100, opacity: 0.04 },
        { size: 300, x: "calc(100% - 100px)", y: 200, opacity: 0.03 },
        { size: 200, x: 300, y: 500, opacity: 0.05 },
      ].map((c, i) => (
        <div key={i} style={{ position: "absolute", width: c.size, height: c.size, borderRadius: "50%", background: "#16a34a", opacity: c.opacity, left: c.x, top: c.y, pointerEvents: "none" }} />
      ))}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36, zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 10 }}>
          <img
            src={`${BASE}/images/logo.jpeg`}
            alt="طويق"
            style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "3px solid #16a34a", boxShadow: "0 0 20px rgba(22,163,74,0.4)" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div style={{ textAlign: "right" }}>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 0.5 }}>جمعية طويق للخدمات الإنسانية</h1>
            <p style={{ color: "#86efac", fontSize: 11, margin: "2px 0 0", fontWeight: 500 }}>رقم الترخيص: ١٧٦٦٠ | رقم السجل: ١٠٠٠٨٢٣٠٣٠</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { label: "تطبيق متجاوب", icon: "📱" },
            { label: "أخبار محدّثة", icon: "📰" },
            { label: "تبرع آمن", icon: "🔒" },
            { label: "دعم إنساني", icon: "💚" },
          ].map(b => (
            <div key={b.label} style={{ background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12 }}>{b.icon}</span>
              <span style={{ color: "#86efac", fontSize: 10, fontWeight: 600 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Devices row */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 28, zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
        {/* iPhone - Home */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 9, color: "#86efac", fontWeight: 600 }}>الرئيسية</div>
          <IPhoneFrame color="#1a1a1a">
            <PhoneHome />
          </IPhoneFrame>
        </div>

        {/* iPad - News */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 9, color: "#7dd3fc", fontWeight: 600 }}>الأخبار — جهاز لوحي</div>
          <IPadFrame>
            <TabletNews />
          </IPadFrame>
        </div>

        {/* iPhone - Donate */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 9, color: "#d8b4fe", fontWeight: 600 }}>التبرع</div>
          <IPhoneFrame color="#f5f5f5">
            <PhoneDonate />
          </IPhoneFrame>
        </div>
      </div>

      {/* Bottom badge */}
      <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", zIndex: 1 }}>
        {[
          ["🏆", "جمعية خيرية مرخصة"],
          ["🇸🇦", "الرياض، المملكة العربية السعودية"],
          ["✅", "شفافية تامة"],
          ["📲", "متاح على الجوال والويب"],
        ].map(([icon, label]) => (
          <div key={label as string} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>{icon as string}</span>
            <span style={{ color: "#d1d5db", fontSize: 9, fontWeight: 500 }}>{label as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
