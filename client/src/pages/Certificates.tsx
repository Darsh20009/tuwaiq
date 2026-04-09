import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Award, Download, Share2, Calendar, Heart, Droplet, Utensils, Moon, FileText, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const SERVICE_ICONS: Record<string, any> = {
  water: { icon: Droplet, color: "text-blue-500", bg: "bg-blue-50" },
  food: { icon: Utensils, color: "text-amber-500", bg: "bg-amber-50" },
  iftar: { icon: Moon, color: "text-purple-500", bg: "bg-purple-50" },
  "special-cases": { icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  general: { icon: Heart, color: "text-primary", bg: "bg-primary/10" },
};

const TYPE_LABELS: Record<string, string> = {
  water: "سقيا الماء",
  food: "إطعام الجائع",
  iftar: "إفطار صائم",
  "special-cases": "الحالات الخاصة",
  general: "تبرع عام",
  zakat: "زكاة مال",
  waqf: "وقف",
  "ramadan-basket": "سلة رمضانية",
};

function formatDateAr(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function printInvoice(invoice: any) {
  const typeLabel = TYPE_LABELS[invoice.type] || invoice.type || "تبرع عام";
  const dateStr = formatDateAr(invoice.createdAt);
  const paymentMethod = invoice.paymentMethod === "bank_transfer" ? "تحويل بنكي" : "دفع إلكتروني";
  const amount = Number(invoice.amount).toLocaleString("en");

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>فاتورة تبرع — ${invoice.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Tajawal', Arial, sans-serif;
      background: #fff;
      color: #1f2937;
      direction: rtl;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 0;
      position: relative;
    }
    .header {
      background: linear-gradient(135deg, #047857 0%, #059669 60%, #10b981 100%);
      color: white;
      padding: 28px 40px 22px;
      text-align: center;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -14px;
      left: 0; right: 0;
      height: 28px;
      background: #fff;
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    }
    .header-org { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 4px; }
    .header-title { font-size: 14px; opacity: 0.88; }
    .header-badge {
      display: inline-block;
      margin-top: 10px;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.35);
      border-radius: 20px;
      padding: 4px 20px;
      font-size: 13px;
      font-weight: 700;
    }
    .body { padding: 38px 40px 30px; }
    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .meta-item label { font-size: 11px; color: #6b7280; display: block; margin-bottom: 3px; }
    .meta-item span { font-size: 14px; font-weight: 700; color: #111827; }
    .parties {
      display: flex;
      gap: 16px;
      margin-bottom: 28px;
    }
    .party {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px 18px;
      background: #f9fafb;
    }
    .party-label {
      font-size: 11px;
      color: #059669;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .party-name { font-size: 15px; font-weight: 700; color: #111827; }
    .party-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border-radius: 10px;
      overflow: hidden;
    }
    thead tr { background: #047857; color: white; }
    thead th {
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 700;
      text-align: right;
    }
    thead th:last-child { text-align: left; }
    tbody tr:nth-child(even) { background: #f0fdf4; }
    tbody td {
      padding: 14px 16px;
      font-size: 14px;
      border-bottom: 1px solid #e5e7eb;
    }
    tbody td:last-child { text-align: left; font-weight: 700; color: #047857; }
    .total-row {
      background: #047857 !important;
      color: white;
    }
    .total-row td { 
      padding: 14px 16px;
      font-size: 15px;
      font-weight: 800;
      color: white !important;
      border: none !important;
    }
    .total-row td:last-child { color: #d1fae5 !important; }
    .payment-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px 18px;
      margin-bottom: 24px;
    }
    .payment-box h4 { font-size: 13px; color: #059669; font-weight: 700; margin-bottom: 10px; }
    .payment-box p { font-size: 13px; color: #374151; margin-bottom: 4px; }
    .thank-you {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      border-radius: 10px;
      border: 1px solid #a7f3d0;
      margin-bottom: 24px;
    }
    .thank-you h3 { color: #047857; font-size: 17px; font-weight: 800; margin-bottom: 6px; }
    .thank-you p { color: #6b7280; font-size: 12px; }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding: 16px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-text { font-size: 10px; color: #9ca3af; }
    .footer-note { font-size: 10px; color: #9ca3af; text-align: left; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { width: 100%; }
      @page { margin: 0; size: A4 portrait; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-org">جمعية طويق للخدمات الإنسانية</div>
    <div class="header-title">Tuwaiq Humanitarian Services Association</div>
    <div class="header-badge">إيصال / فاتورة تبرع</div>
  </div>
  <div class="body">
    <div class="meta-row">
      <div class="meta-item">
        <label>رقم الفاتورة</label>
        <span>${invoice.invoiceNumber}</span>
      </div>
      <div class="meta-item" style="text-align:center">
        <label>التاريخ</label>
        <span>${dateStr}</span>
      </div>
      ${invoice.receiptId ? `<div class="meta-item" style="text-align:left">
        <label>رقم العملية</label>
        <span style="font-size:12px;font-weight:500">${invoice.receiptId}</span>
      </div>` : ""}
    </div>
    <div class="parties">
      <div class="party">
        <div class="party-label">الجهة المُصدِرة</div>
        <div class="party-name">جمعية طويق للخدمات الإنسانية</div>
        <div class="party-sub">رقم السجل: 1000820300 | الرياض، المملكة العربية السعودية</div>
      </div>
      <div class="party">
        <div class="party-label">المتبرع الكريم</div>
        <div class="party-name">${invoice.donorName || "متبرع كريم"}</div>
        ${invoice.donorEmail ? `<div class="party-sub">${invoice.donorEmail}</div>` : ""}
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>البيان</th>
          <th>طريقة الدفع</th>
          <th>المبلغ (ريال)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${typeLabel}</td>
          <td>${paymentMethod}</td>
          <td>${amount}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2">الإجمالي</td>
          <td>${amount} ريال</td>
        </tr>
      </tbody>
    </table>
    <div class="payment-box">
      <h4>تفاصيل السداد</h4>
      <p>طريقة الدفع: ${paymentMethod}</p>
      <p>الحالة: مكتمل ✓</p>
    </div>
    <div class="thank-you">
      <h3>جزاكم الله خيراً على تبرعكم الكريم</h3>
      <p>تبرعاتكم تُغير حياة الأسر المحتاجة — بارك الله فيكم</p>
    </div>
  </div>
  <div class="footer">
    <div class="footer-text">
      جمعية طويق للخدمات الإنسانية — الرياض، المملكة العربية السعودية<br/>
      هذه الوثيقة صادرة إلكترونياً وتُعدّ رسمية
    </div>
    <div class="footer-note">
      tuwaikassociation@gmail.com<br/>
      +966 50 579 3012
    </div>
  </div>
</div>
<script>window.onload = function(){ window.print(); };</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

function printCertificate(certificate: any) {
  const typeLabel = TYPE_LABELS[certificate.type] || certificate.type || "تبرع عام";
  const dateStr = formatDateAr(certificate.createdAt);
  const amount = Number(certificate.amount).toLocaleString("en");

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>شهادة تبرع — ${certificate.certificateNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Tajawal', Arial, sans-serif;
      background: #fff;
      color: #1f2937;
      direction: rtl;
    }
    .page {
      width: 297mm;
      min-height: 210mm;
      margin: 0 auto;
      padding: 0;
      border: 3px solid #059669;
      position: relative;
      overflow: hidden;
    }
    .page::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid #a7f3d0;
      pointer-events: none;
      z-index: 0;
    }
    .header {
      background: linear-gradient(135deg, #047857 0%, #059669 100%);
      color: white;
      padding: 24px 48px 20px;
      text-align: center;
      position: relative;
      z-index: 1;
    }
    .header-org { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .header-sub { font-size: 12px; opacity: 0.85; }
    .header-type {
      display: inline-block;
      margin-top: 8px;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.35);
      border-radius: 20px;
      padding: 4px 24px;
      font-size: 13px;
      font-weight: 700;
    }
    .body {
      padding: 28px 56px 24px;
      position: relative;
      z-index: 1;
      text-align: center;
    }
    .ornament { color: #a7f3d0; font-size: 22px; letter-spacing: 8px; margin-bottom: 12px; }
    .bismillah { color: #059669; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .verse {
      font-size: 13px;
      color: #374151;
      margin-bottom: 18px;
      padding: 10px 24px;
      background: #f0fdf4;
      border-radius: 8px;
      border-right: 3px solid #059669;
      text-align: center;
    }
    .intro { font-size: 14px; color: #374151; margin-bottom: 8px; }
    .donor-name { font-size: 30px; font-weight: 800; color: #047857; margin-bottom: 10px; }
    .contribution { font-size: 14px; color: #374151; margin-bottom: 8px; }
    .amount-box {
      display: inline-block;
      background: #f0fdf4;
      border: 2px solid #6ee7b7;
      border-radius: 12px;
      padding: 8px 36px;
      margin-bottom: 8px;
    }
    .amount { font-size: 26px; font-weight: 800; color: #047857; }
    .type-label { font-size: 13px; color: #374151; margin-bottom: 18px; }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .info-table tr:nth-child(even) { background: #f0fdf4; }
    .info-table tr:nth-child(odd) { background: #f9fafb; }
    .info-table td {
      padding: 9px 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-table .lbl { color: #6b7280; font-weight: 400; }
    .info-table .val { font-weight: 700; color: #111827; text-align: left; }
    .dua {
      color: #059669;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 16px;
      padding: 10px;
      background: #ecfdf5;
      border-radius: 8px;
    }
    .sig-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 8px;
    }
    .sig-box { text-align: center; }
    .sig-line { width: 100px; border-top: 1px solid #d1fae5; margin: 0 auto 4px; }
    .sig-label { font-size: 11px; color: #9ca3af; }
    .stamp {
      width: 64px; height: 64px;
      border-radius: 50%;
      border: 2px solid #059669;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #059669;
      text-align: center;
      line-height: 1.3;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding: 10px 56px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #9ca3af;
      position: relative;
      z-index: 1;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { width: 100%; border: none; }
      @page { margin: 0; size: A4 landscape; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-org">جمعية طويق للخدمات الإنسانية</div>
    <div class="header-sub">Tuwaiq Humanitarian Services Association | الرياض، المملكة العربية السعودية</div>
    <div class="header-type">شهادة تبرع خيري</div>
  </div>
  <div class="body">
    <div class="ornament">✦ &nbsp; ✦ &nbsp; ✦</div>
    <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
    <div class="verse">﴿ مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ ﴾</div>
    <div class="intro">تُشهد جمعية طويق للخدمات الإنسانية بأن المتبرع الكريم:</div>
    <div class="donor-name">${certificate.donorName || "متبرع كريم"}</div>
    <div class="contribution">قد أسهم في دعم مسيرة العطاء والعمل الخيري بمبلغ:</div>
    <div class="amount-box">
      <div class="amount">${amount} ريال سعودي</div>
    </div>
    <div class="type-label">تحت مسمى: <strong>${typeLabel}</strong></div>

    <table class="info-table">
      <tr>
        <td class="lbl">رقم الشهادة</td>
        <td class="val">${certificate.certificateNumber}</td>
        <td class="lbl">تاريخ الإصدار</td>
        <td class="val">${dateStr}</td>
      </tr>
      <tr>
        <td class="lbl">الجهة المُصدِرة</td>
        <td class="val">جمعية طويق للخدمات الإنسانية</td>
        <td class="lbl">رقم الترخيص</td>
        <td class="val">1000820300</td>
      </tr>
    </table>

    <div class="dua">نسأل الله أن يبارك في مالك ويجعل تبرعك في ميزان حسناتك</div>

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">المدير التنفيذي</div>
      </div>
      <div class="stamp">جمعية<br/>طويق</div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">التوقيع والختم</div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>هذه الوثيقة صادرة إلكترونياً وتُعدّ رسمية بموجب أنظمة الجمعيات الأهلية</span>
    <span>tuwaikassociation@gmail.com | +966 50 579 3012</span>
  </div>
</div>
<script>window.onload = function(){ window.print(); };</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=1100,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

function InvoiceCard({ invoice, index }: { invoice: any; index: number }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      printInvoice(invoice);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all group">
        <CardHeader className="bg-muted/30 pb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign className="w-12 h-12" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
              {invoice.invoiceNumber}
            </Badge>
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl mt-4 relative z-10">فاتورة تبرع</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-dashed">
              <span className="text-muted-foreground">المبلغ</span>
              <span className="text-2xl font-bold text-primary">{Number(invoice.amount).toLocaleString()} ر.س</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">نوع التبرع</span>
                <span className="font-medium">{TYPE_LABELS[invoice.type] || invoice.type || "تبرع عام"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">طريقة الدفع</span>
                <span className="font-medium">
                  {invoice.paymentMethod === "bank_transfer" ? "تحويل بنكي" : "دفع إلكتروني"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">التاريخ</span>
                <span className="font-medium">{formatDateAr(invoice.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardContent className="pt-0">
          <Button
            className="w-full mt-4 bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground border-0 shadow-none"
            onClick={handleDownload}
            disabled={isDownloading}
            data-testid={`button-download-invoice-${invoice.id || invoice._id}`}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 ml-2" />
            )}
            تحميل الفاتورة (PDF)
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CertificateCard({ certificate, index }: { certificate: any; index: number }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const serviceConfig = SERVICE_ICONS[certificate.type] || SERVICE_ICONS.general;
  const Icon = serviceConfig.icon;

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      printCertificate(certificate);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "شهادة تبرع - جمعية طويق",
      text: `شهادة تبرع رقم ${certificate.certificateNumber}`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
        <div className="relative">
          <div className="bg-gradient-to-br from-primary/5 via-white to-teal-50 p-8">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-brand" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <img src="/images/logo.jpeg" alt="طويق" className="w-16 h-16 rounded-xl shadow-md" />
                <div>
                  <h3 className="font-heading font-bold text-xl text-gradient">طويق</h3>
                  <p className="text-xs text-muted-foreground">للخدمات الإنسانية</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">رقم الشهادة</p>
                <p className="font-mono text-sm font-bold text-primary">{certificate.certificateNumber}</p>
              </div>
            </div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-brand mb-4 shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-foreground mb-2">شهادة تقدير</h2>
              <p className="text-muted-foreground">Certificate of Appreciation</p>
            </div>
            <div className="text-center mb-8 max-w-md mx-auto">
              <p className="text-lg leading-relaxed text-muted-foreground">
                نشهد بأن المتبرع الكريم قد ساهم في دعم
              </p>
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${serviceConfig.bg} my-4`}>
                <Icon className={`w-6 h-6 ${serviceConfig.color}`} />
                <span className={`font-bold text-lg ${serviceConfig.color}`}>
                  {TYPE_LABELS[certificate.type] || certificate.type || "تبرع عام"}
                </span>
              </div>
              <p className="text-lg text-muted-foreground">بمبلغ وقدره</p>
              <p className="text-4xl font-heading font-bold text-gradient my-4">
                {Number(certificate.amount).toLocaleString()} ريال
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDateAr(certificate.createdAt)}</span>
            </div>
            <div className="text-center mb-8 p-4 bg-primary/5 rounded-xl max-w-md mx-auto">
              <p className="text-primary font-heading text-lg">
                ﴿ مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ ﴾
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs text-muted-foreground">
                <p>رقم الترخيص: 1000820300</p>
                <p>المملكة العربية السعودية - الرياض</p>
              </div>
              <div className="text-left text-xs text-muted-foreground">
                <p>tuwaikassociation@gmail.com</p>
                <p>+966 50 579 3012</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-brand" />
          </div>
        </div>
        <CardContent className="p-4 bg-gray-50 flex gap-2">
          <Button
            onClick={handleDownload}
            className="flex-1 bg-gradient-brand"
            disabled={isDownloading}
            data-testid={`button-download-certificate-${certificate.id || certificate._id}`}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 ml-2" />
            )}
            تحميل PDF
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1" data-testid={`button-share-certificate-${certificate.id || certificate._id}`}>
            <Share2 className="w-4 h-4 ml-2" />
            مشاركة
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Certificates() {
  const { user } = useAuth();

  const { data: certificates, isLoading: isCertsLoading } = useQuery<any[]>({
    queryKey: ["/api/certificates"],
    enabled: !!user,
  });

  const { data: invoices, isLoading: isInvoicesLoading } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
    enabled: !!user,
  });

  const isLoading = isCertsLoading || isInvoicesLoading;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-content">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
              <h2 className="text-xl font-bold font-heading mb-2">شهاداتي وفواتيري</h2>
              <p className="text-muted-foreground mb-6">
                سجل الدخول لعرض شهادات التبرع وفواتيرك الخاصة
              </p>
              <Link href="/login">
                <Button className="bg-gradient-brand">تسجيل الدخول</Button>
              </Link>
            </CardContent>
          </Card>
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
            <Award className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">شهاداتي وفواتيري</h1>
            <p className="text-white/80">توثيق لمساهماتك الكريمة في العمل الخيري</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="h-[500px] animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="certificates" className="w-full" dir="rtl">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="certificates" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  الشهادات التقديرية ({certificates?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="invoices" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  فواتير التبرع ({invoices?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="certificates">
                {certificates && certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {certificates.map((cert, index) => (
                      <CertificateCard key={cert.id || cert._id} certificate={cert} index={index} />
                    ))}
                  </div>
                ) : (
                  <Card className="max-w-md mx-auto">
                    <CardContent className="p-12 text-center">
                      <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                      <h3 className="text-xl font-bold font-heading mb-2">لا توجد شهادات</h3>
                      <p className="text-muted-foreground mb-6">
                        ستظهر هنا شهادات التبرع بعد إتمام أي تبرع وتوثيقه
                      </p>
                      <Link href="/donate">
                        <Button className="bg-gradient-brand">تبرع الآن</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="invoices">
                {invoices && invoices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {invoices.map((invoice, index) => (
                      <InvoiceCard key={invoice.id || invoice._id} invoice={invoice} index={index} />
                    ))}
                  </div>
                ) : (
                  <Card className="max-w-md mx-auto">
                    <CardContent className="p-12 text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                      <h3 className="text-xl font-bold font-heading mb-2">لا توجد فواتير</h3>
                      <p className="text-muted-foreground mb-6">
                        سيتم إصدار فاتورة رسمية لكل عملية تبرع تقوم بها
                      </p>
                      <Link href="/bank-transfer">
                        <Button variant="outline">تبرع عبر التحويل</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
