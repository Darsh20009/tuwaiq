// @ts-nocheck — pdfkit @types missing `direction` in TextOptions (runtime works fine)
import PDFDocument from "pdfkit";
import path from "path";

// PDFKit's @types package doesn't include `direction` yet — extend locally
type TextOpts = PDFKit.TextOptions & { direction?: "rtl" | "ltr"; features?: string[] };

// Typed wrapper so TypeScript doesn't complain about `direction`
function t(doc: PDFKit.PDFDocument, text: string, x: number, y: number, opts: TextOpts): PDFKit.PDFDocument;
function t(doc: PDFKit.PDFDocument, text: string, opts: TextOpts): PDFKit.PDFDocument;
function t(doc: PDFKit.PDFDocument, text: string, xOrOpts?: number | TextOpts, y?: number | TextOpts, opts?: TextOpts): PDFKit.PDFDocument {
  if (typeof xOrOpts === "number") {
    return (doc as any).text(text, xOrOpts, y, opts);
  }
  return (doc as any).text(text, xOrOpts);
}

const FONTS_DIR = path.join(process.cwd(), "server/fonts");
const FONT_REGULAR = path.join(FONTS_DIR, "Amiri-Regular.ttf");
const FONT_BOLD    = path.join(FONTS_DIR, "Amiri-Bold.ttf");

const ORG_NAME    = "جمعية طويق للخدمات الإنسانية";
const ORG_LICENSE = "1000820300";
const ORG_REG     = "1000823030";
const PRIMARY     = "#059669"; // emerald-600
const PRIMARY_DARK = "#047857";

function rtl(text: string): string {
  // Reverse words for RTL display in pdfkit (handles Arabic ordering)
  return text.split(" ").reverse().join(" ");
}

function formatDate(d: Date = new Date()): string {
  return d.toLocaleDateString("ar-SA-u-nu-arab", {
    year: "numeric", month: "long", day: "numeric",
    calendar: "gregory",
  });
}

function formatAmount(amount: number): string {
  return `${amount.toLocaleString("en")} ريال سعودي`;
}

const TYPE_LABELS: Record<string, string> = {
  general:          "صدقة عامة",
  zakat:            "زكاة مال",
  waqf:             "وقف",
  water:            "سقيا الماء",
  "ramadan-basket": "سلة رمضانية",
  iftar:            "إفطار صائم",
  food:             "إطعام الجائع",
  "special-cases":  "حالات خاصة",
};

// ─── Shared helpers ──────────────────────────────────────────────────────────

function drawPageBorder(doc: PDFKit.PDFDocument) {
  const margin = 20;
  doc
    .save()
    .rect(margin, margin, doc.page.width - margin * 2, doc.page.height - margin * 2)
    .lineWidth(1.5)
    .strokeColor("#d1fae5")
    .stroke()
    .restore();
  doc
    .save()
    .rect(margin + 4, margin + 4, doc.page.width - (margin + 4) * 2, doc.page.height - (margin + 4) * 2)
    .lineWidth(0.5)
    .strokeColor("#a7f3d0")
    .stroke()
    .restore();
}

function drawHeader(doc: PDFKit.PDFDocument, title: string) {
  // Green gradient header band
  doc
    .save()
    .rect(0, 0, doc.page.width, 120)
    .fill(PRIMARY_DARK)
    .restore();
  doc
    .save()
    .rect(0, 100, doc.page.width, 30)
    .fill(PRIMARY)
    .restore();

  // Org name
  doc
    .font(FONT_BOLD)
    .fontSize(18)
    .fillColor("#ffffff")
    .text(ORG_NAME, 0, 28, { align: "center", direction: "rtl" });

  // Title badge
  doc
    .save()
    .roundedRect(doc.page.width / 2 - 90, 58, 180, 30, 6)
    .fill("rgba(255,255,255,0.2)")
    .restore();
  doc
    .font(FONT_BOLD)
    .fontSize(13)
    .fillColor("#d1fae5")
    .text(title, 0, 65, { align: "center", direction: "rtl" });

  // License strip
  doc
    .font(FONT_REGULAR)
    .fontSize(8)
    .fillColor("#a7f3d0")
    .text(`رقم السجل: ${ORG_LICENSE}  |  رقم الترخيص: ${ORG_REG}`, 0, 107, { align: "center" });
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const y = doc.page.height - 50;
  doc
    .save()
    .moveTo(40, y)
    .lineTo(doc.page.width - 40, y)
    .lineWidth(0.5)
    .strokeColor("#d1fae5")
    .stroke()
    .restore();

  doc
    .font(FONT_REGULAR)
    .fontSize(8)
    .fillColor("#6b7280")
    .text(
      `${ORG_NAME}  |  هذه الوثيقة صادرة إلكترونياً وتُعدّ رسمية بموجب أنظمة الجمعيات الأهلية`,
      40, y + 10,
      { align: "center" }
    );
}

function infoRow(doc: PDFKit.PDFDocument, label: string, value: string, y: number, highlight = false) {
  const x = 40;
  const w = doc.page.width - 80;
  if (highlight) {
    doc.save().rect(x, y, w, 26).fill("#f0fdf4").restore();
  }
  doc
    .font(FONT_REGULAR)
    .fontSize(10)
    .fillColor("#6b7280")
    .text(label, x + 8, y + 7, { direction: "rtl", align: "right", width: w - 16 });
  doc
    .font(FONT_BOLD)
    .fontSize(10)
    .fillColor("#1f2937")
    .text(value, x + 8, y + 7, { direction: "rtl", align: "left", width: w - 16 });
  doc
    .save()
    .moveTo(x, y + 26)
    .lineTo(x + w, y + 26)
    .lineWidth(0.3)
    .strokeColor("#e5e7eb")
    .stroke()
    .restore();
}

// ─── Certificate ─────────────────────────────────────────────────────────────

export async function generateCertificatePDF(opts: {
  donorName: string;
  amount: number;
  type: string;
  certificateNumber: string;
  date?: Date;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      info: {
        Title: `شهادة تبرع — ${opts.certificateNumber}`,
        Author: ORG_NAME,
        Subject: "شهادة تبرع خيري",
        Creator: ORG_NAME,
      },
    });

    doc.registerFont("Regular", FONT_REGULAR);
    doc.registerFont("Bold",    FONT_BOLD);

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawPageBorder(doc);
    drawHeader(doc, "شهادة تبرع خيري");

    const dateStr = formatDate(opts.date);
    const typeLabel = TYPE_LABELS[opts.type] || opts.type || "صدقة عامة";

    // Decorative center ornament
    doc
      .font("Regular")
      .fontSize(28)
      .fillColor("#d1fae5")
      .text("✦  ✦  ✦", 0, 140, { align: "center" });

    // Bismillah / Verse
    doc
      .font("Bold")
      .fontSize(13)
      .fillColor(PRIMARY)
      .text("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", 0, 172, { align: "center", direction: "rtl" });

    doc
      .font("Regular")
      .fontSize(10)
      .fillColor("#374151")
      .text("«مَثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ»",
        40, 196, { align: "center", direction: "rtl", width: doc.page.width - 80 });

    // Divider
    doc.save().moveTo(80, 226).lineTo(doc.page.width - 80, 226).lineWidth(0.5).strokeColor("#d1fae5").stroke().restore();

    // Main text
    doc
      .font("Regular")
      .fontSize(12)
      .fillColor("#374151")
      .text("تُشهد جمعية طويق للخدمات الإنسانية بأن المتبرع الكريم:", 40, 240, { align: "center", direction: "rtl", width: doc.page.width - 80 });

    // Donor name — large
    doc
      .font("Bold")
      .fontSize(22)
      .fillColor(PRIMARY_DARK)
      .text(opts.donorName, 40, 262, { align: "center", direction: "rtl", width: doc.page.width - 80 });

    doc
      .font("Regular")
      .fontSize(12)
      .fillColor("#374151")
      .text("قد أسهم في دعم مسيرة العطاء والعمل الخيري بمبلغ:", 40, 296, { align: "center", direction: "rtl", width: doc.page.width - 80 });

    // Amount box
    doc.save().roundedRect(160, 316, doc.page.width - 320, 46, 8).fill("#f0fdf4").restore();
    doc.save().roundedRect(160, 316, doc.page.width - 320, 46, 8).lineWidth(1).strokeColor("#6ee7b7").stroke().restore();
    doc
      .font("Bold")
      .fontSize(20)
      .fillColor(PRIMARY_DARK)
      .text(formatAmount(opts.amount), 40, 328, { align: "center", width: doc.page.width - 80 });

    doc
      .font("Regular")
      .fontSize(11)
      .fillColor("#374151")
      .text(`تحت مسمى: ${typeLabel}`, 40, 374, { align: "center", direction: "rtl", width: doc.page.width - 80 });

    // Info table
    const tableY = 406;
    doc.save().roundedRect(40, tableY, doc.page.width - 80, 108, 6).fill("#f9fafb").restore();
    doc.save().roundedRect(40, tableY, doc.page.width - 80, 108, 6).lineWidth(0.5).strokeColor("#e5e7eb").stroke().restore();

    infoRow(doc, "رقم الشهادة", opts.certificateNumber, tableY, false);
    infoRow(doc, "تاريخ الإصدار", dateStr, tableY + 27, true);
    infoRow(doc, "الجهة المُصدِرة", ORG_NAME, tableY + 54, false);
    infoRow(doc, "رقم الترخيص", ORG_LICENSE, tableY + 81, true);

    // Dua
    doc
      .font("Bold")
      .fontSize(13)
      .fillColor(PRIMARY)
      .text("نسأل الله أن يبارك في مالك ويجعل تبرعك في ميزان حسناتك", 40, tableY + 120, { align: "center", direction: "rtl", width: doc.page.width - 80 });

    // Official stamp area
    const stampY = tableY + 156;
    doc
      .save()
      .circle(doc.page.width / 2, stampY + 30, 36)
      .lineWidth(1.5)
      .strokeColor(PRIMARY)
      .stroke()
      .restore();
    doc
      .save()
      .circle(doc.page.width / 2, stampY + 30, 30)
      .lineWidth(0.5)
      .strokeColor("#6ee7b7")
      .stroke()
      .restore();
    doc
      .font("Bold")
      .fontSize(8)
      .fillColor(PRIMARY)
      .text("جمعية\nطويق", doc.page.width / 2 - 20, stampY + 18, { align: "center", direction: "rtl", width: 40 });

    doc
      .font("Regular")
      .fontSize(9)
      .fillColor("#6b7280")
      .text("التوقيع والختم", doc.page.width / 2 + 40, stampY + 26, { direction: "rtl" });

    doc
      .font("Regular")
      .fontSize(9)
      .fillColor("#6b7280")
      .text("المدير التنفيذي", doc.page.width / 2 - 130, stampY + 26, { direction: "rtl" });

    drawFooter(doc);
    doc.end();
  });
}

// ─── Invoice ─────────────────────────────────────────────────────────────────

export async function generateInvoicePDF(opts: {
  donorName: string;
  amount: number;
  type: string;
  invoiceNumber: string;
  receiptId?: string;
  date?: Date;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      info: {
        Title: `فاتورة تبرع — ${opts.invoiceNumber}`,
        Author: ORG_NAME,
        Subject: "فاتورة / إيصال تبرع",
        Creator: ORG_NAME,
      },
    });

    doc.registerFont("Regular", FONT_REGULAR);
    doc.registerFont("Bold",    FONT_BOLD);

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawPageBorder(doc);
    drawHeader(doc, "إيصال / فاتورة تبرع");

    const dateStr = formatDate(opts.date);
    const typeLabel = TYPE_LABELS[opts.type] || opts.type || "صدقة عامة";

    // Invoice meta
    const metaY = 136;
    doc
      .font("Bold")
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`رقم الفاتورة: ${opts.invoiceNumber}`, 40, metaY, { align: "right", direction: "rtl" })
      .text(`التاريخ: ${dateStr}`, 40, metaY + 16, { align: "right", direction: "rtl" });

    if (opts.receiptId) {
      doc
        .font("Regular")
        .fontSize(9)
        .fillColor("#9ca3af")
        .text(`رقم العملية: ${opts.receiptId}`, 40, metaY + 32, { align: "right", direction: "rtl" });
    }

    // Divider
    doc.save().moveTo(40, metaY + 54).lineTo(doc.page.width - 40, metaY + 54).lineWidth(0.5).strokeColor("#e5e7eb").stroke().restore();

    // Parties
    const partiesY = metaY + 64;

    // Issuer (right side)
    doc
      .font("Bold")
      .fontSize(10)
      .fillColor(PRIMARY_DARK)
      .text("الجهة المُصدِرة", doc.page.width / 2, partiesY, { direction: "rtl", align: "center", width: doc.page.width / 2 - 40 });
    doc
      .font("Regular")
      .fontSize(9)
      .fillColor("#374151")
      .text(ORG_NAME, doc.page.width / 2, partiesY + 16, { direction: "rtl", align: "center", width: doc.page.width / 2 - 40 })
      .text(`سجل رقم: ${ORG_LICENSE}`, doc.page.width / 2, partiesY + 30, { align: "center", width: doc.page.width / 2 - 40 });

    // Recipient (left side)
    doc
      .font("Bold")
      .fontSize(10)
      .fillColor(PRIMARY_DARK)
      .text("المتبرع الكريم", 40, partiesY, { direction: "rtl", align: "center", width: doc.page.width / 2 - 40 });
    doc
      .font("Regular")
      .fontSize(9)
      .fillColor("#374151")
      .text(opts.donorName, 40, partiesY + 16, { direction: "rtl", align: "center", width: doc.page.width / 2 - 40 });

    // Divider
    const divY = partiesY + 60;
    doc.save().moveTo(40, divY).lineTo(doc.page.width - 40, divY).lineWidth(0.5).strokeColor("#e5e7eb").stroke().restore();

    // Table header
    const tblY = divY + 12;
    doc.save().rect(40, tblY, doc.page.width - 80, 28).fill(PRIMARY_DARK).restore();
    doc
      .font("Bold")
      .fontSize(10)
      .fillColor("#ffffff")
      .text("البيان", 40, tblY + 8, { align: "right", direction: "rtl", width: (doc.page.width - 80) * 0.6 - 8 });
    doc
      .font("Bold")
      .fontSize(10)
      .fillColor("#ffffff")
      .text("المبلغ (ريال)", doc.page.width - 40 - (doc.page.width - 80) * 0.4, tblY + 8, { align: "left", width: (doc.page.width - 80) * 0.4 });

    // Table row
    const rowY = tblY + 28;
    doc.save().rect(40, rowY, doc.page.width - 80, 32).fill("#f0fdf4").restore();
    doc
      .font("Regular")
      .fontSize(10)
      .fillColor("#1f2937")
      .text(typeLabel, 40, rowY + 10, { align: "right", direction: "rtl", width: (doc.page.width - 80) * 0.6 - 8 });
    doc
      .font("Bold")
      .fontSize(10)
      .fillColor(PRIMARY_DARK)
      .text(opts.amount.toLocaleString("en"), doc.page.width - 40 - (doc.page.width - 80) * 0.4, rowY + 10, { align: "left", width: (doc.page.width - 80) * 0.4 });

    // Total
    const totY = rowY + 32;
    doc.save().rect(40, totY, doc.page.width - 80, 36).fill(PRIMARY_DARK).restore();
    doc
      .font("Bold")
      .fontSize(11)
      .fillColor("#ffffff")
      .text("الإجمالي", 40, totY + 11, { align: "right", direction: "rtl", width: (doc.page.width - 80) * 0.6 - 8 });
    doc
      .font("Bold")
      .fontSize(12)
      .fillColor("#d1fae5")
      .text(`${opts.amount.toLocaleString("en")} ريال`, doc.page.width - 40 - (doc.page.width - 80) * 0.4, totY + 11, { align: "left", width: (doc.page.width - 80) * 0.4 });

    // Amount in words note
    const wordsY = totY + 50;
    doc
      .font("Regular")
      .fontSize(9)
      .fillColor("#6b7280")
      .text(`المبلغ: ${formatAmount(opts.amount)}`, 40, wordsY, { align: "center", direction: "rtl", width: doc.page.width - 80 });

    // Payment info
    const payY = wordsY + 22;
    doc.save().roundedRect(40, payY, doc.page.width - 80, 52, 6).fill("#f9fafb").restore();
    doc.save().roundedRect(40, payY, doc.page.width - 80, 52, 6).lineWidth(0.5).strokeColor("#e5e7eb").stroke().restore();
    doc
      .font("Bold")
      .fontSize(9)
      .fillColor(PRIMARY_DARK)
      .text("تفاصيل السداد", 40, payY + 8, { align: "center", direction: "rtl", width: doc.page.width - 80 });
    doc
      .font("Regular")
      .fontSize(9)
      .fillColor("#374151")
      .text("طريقة الدفع: بوابة الدفع الإلكتروني — مصرف الراجحي", 40, payY + 24, { align: "center", direction: "rtl", width: doc.page.width - 80 })
      .text("الحالة: مكتمل ✓", 40, payY + 38, { align: "center", direction: "rtl", width: doc.page.width - 80 });

    // Thank you
    const tqY = payY + 70;
    doc
      .font("Bold")
      .fontSize(12)
      .fillColor(PRIMARY)
      .text("جزاكم الله خيراً على تبرعكم الكريم", 40, tqY, { align: "center", direction: "rtl", width: doc.page.width - 80 });
    doc
      .font("Regular")
      .fontSize(9)
      .fillColor("#6b7280")
      .text("تبرعاتكم تُغير حياة الأسر المحتاجة — بارك الله فيكم", 40, tqY + 18, { align: "center", direction: "rtl", width: doc.page.width - 80 });

    // Signature area
    const sigY = tqY + 52;
    doc
      .save()
      .moveTo(doc.page.width / 2 - 60, sigY + 30)
      .lineTo(doc.page.width / 2 + 60, sigY + 30)
      .lineWidth(0.5)
      .strokeColor("#d1fae5")
      .stroke()
      .restore();
    doc
      .font("Regular")
      .fontSize(9)
      .fillColor("#9ca3af")
      .text("المدير التنفيذي / التوقيع", 0, sigY + 34, { align: "center" });

    // QR placeholder (box)
    doc
      .save()
      .rect(40, sigY, 60, 60)
      .lineWidth(0.5)
      .strokeColor("#d1fae5")
      .stroke()
      .restore();
    doc
      .font("Regular")
      .fontSize(7)
      .fillColor("#9ca3af")
      .text("رمز التحقق", 38, sigY + 22, { width: 64, align: "center" });

    drawFooter(doc);
    doc.end();
  });
}
