import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { Droplet, Utensils, Moon, Heart, ArrowLeft, Users, Target, CheckCircle2, Share2, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const SERVICES_DETAILS: Record<string, any> = {
  water: {
    title: "سقيا الماء",
    titleEn: "Water Supply",
    icon: Droplet,
    color: "bg-blue-500",
    gradientFrom: "from-blue-500",
    gradientTo: "to-cyan-400",
    heroImage: "https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=1200",
    description: `
      الماء هو أساس الحياة وعماد كل كائن حي. من خلال برنامج سقيا الماء، نسعى لتوفير المياه النظيفة 
      للمناطق المحتاجة والأسر التي تعاني من شح المياه.
      
      يشمل البرنامج:
      - حفر الآبار في المناطق النائية
      - توزيع خزانات المياه
      - صيانة شبكات المياه
      - توفير فلاتر تنقية المياه
    `,
    amounts: [50, 100, 200, 500, 1000],
    stats: {
      beneficiaries: 1200,
      projects: 45,
      targetAmount: 500000,
      currentAmount: 320000
    },
    impacts: [
      { amount: 50, description: "توفير مياه لأسرة لمدة أسبوع" },
      { amount: 100, description: "توفير مياه لأسرة لمدة شهر" },
      { amount: 500, description: "المساهمة في حفر بئر" },
      { amount: 1000, description: "كفالة بئر كامل" },
    ]
  },
  food: {
    title: "إطعام الجائع",
    titleEn: "Feed the Hungry",
    icon: Utensils,
    color: "bg-amber-500",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-400",
    heroImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200",
    description: `
      قال رسول الله ﷺ: "أطعموا الجائع، وعودوا المريض، وفكوا العاني"
      
      برنامج إطعام الجائع يهدف إلى توفير الغذاء للأسر المحتاجة والمتعففة.
      
      يشمل البرنامج:
      - توزيع السلال الغذائية الشهرية
      - وجبات يومية للمحتاجين
      - دعم الأسر المتعففة
      - مشاريع الأضاحي
    `,
    amounts: [30, 75, 150, 300, 600],
    stats: {
      beneficiaries: 3500,
      projects: 120,
      targetAmount: 800000,
      currentAmount: 580000
    },
    impacts: [
      { amount: 30, description: "وجبة غذائية لأسرة" },
      { amount: 75, description: "سلة غذائية أسبوعية" },
      { amount: 150, description: "سلة غذائية شهرية" },
      { amount: 600, description: "كفالة غذائية لأسرة 3 أشهر" },
    ]
  },
  iftar: {
    title: "إفطار صائم",
    titleEn: "Iftar for Fasting",
    icon: Moon,
    color: "bg-purple-500",
    gradientFrom: "from-purple-500",
    gradientTo: "to-pink-400",
    heroImage: "https://images.unsplash.com/photo-1564671165093-20688ff1fffa?w=1200",
    description: `
      قال رسول الله ﷺ: "من فطّر صائماً كان له مثل أجره، غير أنه لا ينقص من أجر الصائم شيء"
      
      برنامج إفطار صائم يقدم وجبات الإفطار للصائمين في شهر رمضان المبارك.
      
      يشمل البرنامج:
      - موائد إفطار جماعية
      - توزيع وجبات الإفطار
      - سلال رمضان الغذائية
      - كسوة العيد
    `,
    amounts: [15, 50, 100, 300, 500],
    stats: {
      beneficiaries: 2800,
      projects: 85,
      targetAmount: 400000,
      currentAmount: 250000
    },
    impacts: [
      { amount: 15, description: "إفطار صائم واحد" },
      { amount: 50, description: "إفطار 3 صائمين" },
      { amount: 100, description: "إفطار أسرة كاملة" },
      { amount: 500, description: "مائدة إفطار جماعية" },
    ]
  },
  "special-cases": {
    title: "الحالات الخاصة",
    titleEn: "Special Cases",
    icon: Heart,
    color: "bg-rose-500",
    gradientFrom: "from-rose-500",
    gradientTo: "to-red-400",
    heroImage: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200",
    description: `
      الحالات الخاصة هي تلك الحالات الإنسانية الطارئة التي تحتاج تدخلاً سريعاً ومباشراً.
      
      يشمل البرنامج:
      - علاج الحالات المرضية الطارئة
      - سداد الإيجارات المتأخرة
      - دعم الأرامل والأيتام
      - مساعدة الغارمين
      - دعم طلاب العلم المحتاجين
    `,
    amounts: [100, 250, 500, 1000, 2000],
    stats: {
      beneficiaries: 850,
      projects: 200,
      targetAmount: 600000,
      currentAmount: 420000
    },
    impacts: [
      { amount: 100, description: "مساعدة طارئة بسيطة" },
      { amount: 250, description: "دعم علاجي" },
      { amount: 500, description: "سداد فاتورة متأخرة" },
      { amount: 2000, description: "دعم شامل لحالة طارئة" },
    ]
  }
};

export default function ServiceDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const service = SERVICES_DETAILS[slug];
  const { toast } = useToast();
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [message, setMessage] = useState("");
  
  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">الخدمة غير موجودة</h1>
            <Link href="/services">
              <Button>العودة للخدمات</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const Icon = service.icon;
  const progress = (service.stats.currentAmount / service.stats.targetAmount) * 100;
  const finalAmount = selectedAmount || (customAmount ? Number(customAmount) : 0);
  
  const handleShare = async () => {
    const shareData = {
      title: service.title,
      text: `ساهم في ${service.title} - جمعية طويق للخدمات الإنسانية`,
      url: window.location.href
    };
    
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "تم نسخ الرابط", description: "يمكنك مشاركته الآن" });
    }
  };
  
  const handleDonate = () => {
    if (!finalAmount || finalAmount < 1) {
      toast({ title: "خطأ", description: "الرجاء اختيار مبلغ التبرع", variant: "destructive" });
      return;
    }
    // Navigate to donate page with pre-filled data
    window.location.href = `/donate?type=${slug}&amount=${finalAmount}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative h-[400px] overflow-hidden">
          <img 
            src={service.heroImage} 
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${service.gradientFrom} ${service.gradientTo} opacity-70`} />
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white max-w-2xl"
              >
                <div className={`w-20 h-20 ${service.color} rounded-3xl flex items-center justify-center mb-6 shadow-2xl`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">{service.title}</h1>
                <p className="text-xl text-white/90">{service.titleEn}</p>
              </motion.div>
            </div>
          </div>
          
          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="absolute top-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold font-heading mb-4">عن البرنامج</h2>
                  <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-line">
                    {service.description}
                  </div>
                </CardContent>
              </Card>

              {/* Impact Cards */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold font-heading mb-6">أثر تبرعك</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.impacts.map((impact: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors"
                      >
                        <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center shrink-0`}>
                          <span className="text-white font-bold text-sm">{impact.amount}</span>
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{impact.amount} ريال</p>
                          <p className="text-sm text-muted-foreground">{impact.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "مستفيد", value: service.stats.beneficiaries, icon: Users },
                  { label: "مشروع", value: service.stats.projects, icon: CheckCircle2 },
                  { label: "المستهدف", value: `${(service.stats.targetAmount / 1000).toFixed(0)}K`, icon: Target },
                  { label: "تم جمعه", value: `${(service.stats.currentAmount / 1000).toFixed(0)}K`, icon: Heart },
                ].map((stat, i) => (
                  <Card key={i} className="border-0 shadow-md">
                    <CardContent className="p-4 text-center">
                      <stat.icon className={`w-8 h-8 mx-auto mb-2 text-${service.color.replace('bg-', '')}`} style={{ color: service.color === 'bg-blue-500' ? '#3b82f6' : service.color === 'bg-amber-500' ? '#f59e0b' : service.color === 'bg-purple-500' ? '#a855f7' : '#f43f5e' }} />
                      <p className="text-2xl font-bold font-heading">{stat.value.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Donation Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-xl sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold font-heading mb-4">تبرع الآن</h3>
                  
                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">تم جمع</span>
                      <span className="font-bold">{service.stats.currentAmount.toLocaleString()} ريال</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{progress.toFixed(0)}%</span>
                      <span>الهدف: {service.stats.targetAmount.toLocaleString()} ريال</span>
                    </div>
                  </div>
                  
                  {/* Amount Selection */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">اختر مبلغ التبرع</Label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {service.amounts.map((amount: number) => (
                        <button
                          key={amount}
                          onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                          className={`p-3 rounded-xl border-2 transition-all text-sm font-bold
                            ${selectedAmount === amount 
                              ? `border-transparent ${service.color} text-white` 
                              : 'border-gray-200 hover:border-primary/50'
                            }`}
                        >
                          {amount}
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="مبلغ آخر"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                        className="pr-16"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">ريال</span>
                    </div>
                  </div>
                  
                  {/* Selected Amount Display */}
                  {finalAmount > 0 && (
                    <div className={`p-4 rounded-xl ${service.color} text-white mb-6`}>
                      <p className="text-sm opacity-90">مبلغ التبرع</p>
                      <p className="text-3xl font-bold">{finalAmount.toLocaleString()} ريال</p>
                    </div>
                  )}
                  
                  {/* Donate Button */}
                  <Button 
                    onClick={handleDonate}
                    className={`w-full h-14 text-lg font-bold bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo}`}
                    disabled={!finalAmount}
                  >
                    تبرع الآن
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                  
                  {/* Share */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={handleShare}>
                      <Share2 className="w-4 h-4 ml-2" />
                      مشاركة
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <a href={`https://wa.me/?text=${encodeURIComponent(`ساهم في ${service.title} - ${window.location.href}`)}`} target="_blank">
                        <MessageCircle className="w-4 h-4 ml-2" />
                        واتساب
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
