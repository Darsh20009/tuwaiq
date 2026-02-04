import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Award, Download, Share2, Calendar, Heart, Droplet, Utensils, Moon } from "lucide-react";
import { useRef } from "react";

const SERVICE_ICONS: Record<string, any> = {
  water: { icon: Droplet, color: "text-blue-500", bg: "bg-blue-50" },
  food: { icon: Utensils, color: "text-amber-500", bg: "bg-amber-50" },
  iftar: { icon: Moon, color: "text-purple-500", bg: "bg-purple-50" },
  "special-cases": { icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  general: { icon: Heart, color: "text-primary", bg: "bg-primary/10" },
};

function CertificateCard({ certificate, index }: { certificate: any; index: number }) {
  const certRef = useRef<HTMLDivElement>(null);
  const serviceConfig = SERVICE_ICONS[certificate.type] || SERVICE_ICONS.general;
  const Icon = serviceConfig.icon;
  
  const handleDownload = () => {
    // In production, this would generate a PDF
    window.print();
  };
  
  const handleShare = async () => {
    const shareData = {
      title: "شهادة تبرع - جمعية طويق",
      text: `شهادة تبرع رقم ${certificate.certificateNumber}`,
      url: window.location.href
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
        <div ref={certRef} className="relative">
          {/* Certificate Design */}
          <div className="bg-gradient-to-br from-primary/5 via-white to-teal-50 p-8 print:p-12">
            {/* Header Pattern */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-brand" />
            
            {/* Logo and Organization */}
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
            
            {/* Certificate Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-brand mb-4 shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-foreground mb-2">شهادة تقدير</h2>
              <p className="text-muted-foreground">Certificate of Appreciation</p>
            </div>
            
            {/* Certificate Body */}
            <div className="text-center mb-8 max-w-md mx-auto">
              <p className="text-lg leading-relaxed text-muted-foreground">
                نشهد بأن المتبرع الكريم قد ساهم في دعم
              </p>
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${serviceConfig.bg} my-4`}>
                <Icon className={`w-6 h-6 ${serviceConfig.color}`} />
                <span className={`font-bold text-lg ${serviceConfig.color}`}>
                  {certificate.type === "water" ? "سقيا الماء" :
                   certificate.type === "food" ? "إطعام الجائع" :
                   certificate.type === "iftar" ? "إفطار صائم" :
                   certificate.type === "special-cases" ? "الحالات الخاصة" : "تبرع عام"}
                </span>
              </div>
              <p className="text-lg text-muted-foreground">بمبلغ وقدره</p>
              <p className="text-4xl font-heading font-bold text-gradient my-4">
                {Number(certificate.amount).toLocaleString()} ريال
              </p>
            </div>
            
            {/* Date */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(certificate.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            {/* Verse */}
            <div className="text-center mb-8 p-4 bg-primary/5 rounded-xl max-w-md mx-auto">
              <p className="text-primary font-heading text-lg">
                ﴿ مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ ﴾
              </p>
            </div>
            
            {/* Footer */}
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
            
            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-brand" />
          </div>
        </div>
        
        {/* Actions */}
        <CardContent className="p-4 bg-gray-50 flex gap-2 print:hidden">
          <Button onClick={handleDownload} className="flex-1 bg-gradient-brand">
            <Download className="w-4 h-4 ml-2" />
            تحميل
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1">
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
  
  const { data: certificates, isLoading } = useQuery<any[]>({
    queryKey: ['/api/certificates'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
              <h2 className="text-xl font-bold font-heading mb-2">شهاداتي</h2>
              <p className="text-muted-foreground mb-6">
                سجل الدخول لعرض شهادات التبرع الخاصة بك
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
        {/* Hero */}
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">شهاداتي</h1>
            <p className="text-white/80">شهادات تقدير لمساهماتك الكريمة</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <Card key={i} className="h-[500px] animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : certificates && certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert, index) => (
                <CertificateCard key={cert.id || cert._id} certificate={cert} index={index} />
              ))}
            </div>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-xl font-bold font-heading mb-2">لا توجد شهادات</h3>
                <p className="text-muted-foreground mb-6">
                  ستظهر هنا شهادات التبرع بعد إتمام أي تبرع
                </p>
                <Link href="/donate">
                  <Button className="bg-gradient-brand">تبرع الآن</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-12 {
            padding: 3rem !important;
          }
          [ref="certRef"], [ref="certRef"] * {
            visibility: visible;
          }
          [ref="certRef"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
