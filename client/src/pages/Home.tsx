import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DonationCard } from "@/components/DonationCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Award, Heart, ShieldCheck, Users, ArrowLeft, Target, Eye, Handshake, Droplet, Utensils, Moon, Building2, Phone } from "lucide-react";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

// Banner Images - Using gradient backgrounds with text
const BANNERS = [
  {
    id: 1,
    title: "بصمتكم تصنع الفرق",
    subtitle: "طويق للخدمات الإنسانية وجهتكم للعطاء",
    bgGradient: "from-primary via-teal-600 to-emerald-700",
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920"
  },
  {
    id: 2,
    title: "تبرعك يصل لمستحقيه بأمان",
    subtitle: "شفافية تامة في كل ريال",
    bgGradient: "from-blue-600 via-blue-700 to-indigo-800",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920"
  },
  {
    id: 3,
    title: "كن من السباقين في قائمة الشرف",
    subtitle: "تبرع الآن بضغطة زر",
    bgGradient: "from-amber-600 via-orange-600 to-red-700",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920"
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((c) => (c + 1) % BANNERS.length);
  const prev = () => setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length);

  const { data: heroContent } = useQuery({
    queryKey: ['/api/content', 'home-hero'],
    queryFn: async () => {
      const res = await fetch('/api/content/home-hero');
      return res.json();
    }
  });

  const displayBanners = heroContent?.title ? [
    {
      id: 1,
      title: heroContent.title,
      subtitle: heroContent.content, // Using content field for subtitle
      bgGradient: "from-primary via-teal-600 to-emerald-700",
      image: heroContent.videoUrl || heroContent.imageUrl || BANNERS[0].image
    },
    ...BANNERS.slice(1)
  ] : BANNERS;

  return (
    <div className="relative w-full h-[50vh] min-h-[400px] md:h-[550px] overflow-hidden group min-h-screen-ios">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image/Video */}
          {displayBanners[current].image.endsWith('.mp4') || displayBanners[current].image.includes('video') ? (
            <video
              src={displayBanners[current].image}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${displayBanners[current].image})` }}
            />
          )}
          {/* Gradient Overlay - Optimized for readability */}
          <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l ${displayBanners[current].bgGradient} opacity-70 md:opacity-85`} />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-end md:items-center pb-12 md:pb-0">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-3xl text-white text-center md:text-right"
              >
                {/* Logo - Hidden on very small screens to save space */}
                <div className="hidden sm:flex items-center gap-4 mb-6 justify-center md:justify-start">
                  <img 
                    src="/images/logo.jpeg" 
                    alt="طويق" 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-2xl border-4 border-white/20"
                  />
                  <div className="text-right">
                    <h2 className="text-xl md:text-2xl font-heading font-bold">طويق</h2>
                    <p className="text-white/80 text-sm md:text-base">للخدمات الإنسانية</p>
                  </div>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-heading mb-4 leading-tight">
                  {displayBanners[current].title}
                </h1>
                <p className="text-lg md:text-2xl text-white/90 mb-8 px-4 md:px-0">
                  {displayBanners[current].subtitle}
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Link href="/donate">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 shadow-xl w-full sm:w-auto">
                      تبرع الآن
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 w-full sm:w-auto backdrop-blur-sm">
                      خدماتنا
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button 
        onClick={prev} 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 z-20 flex items-center justify-center"
        data-testid="button-prev-banner"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>
      <button 
        onClick={next} 
        className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 z-20 flex items-center justify-center"
        data-testid="button-next-banner"
      >
        <ChevronRight className="w-7 h-7" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-3 rounded-full transition-all duration-300 ${
              idx === current ? "bg-white w-10 shadow-lg" : "bg-white/40 w-3 hover:bg-white/60"
            }`}
            data-testid={`button-dot-${idx}`}
          />
        ))}
      </div>
    </div>
  );
}

function ServicesSection() {
  const services = [
    { 
      title: "سقيا الماء", 
      titleEn: "Water Supply",
      icon: Droplet, 
      color: "bg-blue-500",
      gradientFrom: "from-blue-500",
      gradientTo: "to-cyan-400",
      slug: "water",
      description: "الماء أساس الحياة، ساهم في توفير المياه للمحتاجين"
    },
    { 
      title: "إطعام الجائع", 
      titleEn: "Feed the Hungry",
      icon: Utensils, 
      color: "bg-amber-500",
      gradientFrom: "from-amber-500",
      gradientTo: "to-orange-400",
      slug: "food",
      description: "أطعم جائعاً واكسب أجراً عظيماً"
    },
    { 
      title: "إفطار صائم", 
      titleEn: "Iftar for Fasting",
      icon: Moon, 
      color: "bg-purple-500",
      gradientFrom: "from-purple-500",
      gradientTo: "to-pink-400",
      slug: "iftar",
      description: "من فطّر صائماً كان له مثل أجره"
    },
    { 
      title: "الحالات الخاصة", 
      titleEn: "Special Cases",
      icon: Heart, 
      color: "bg-rose-500",
      gradientFrom: "from-rose-500",
      gradientTo: "to-red-400",
      slug: "special-cases",
      description: "ساعد الحالات الإنسانية الطارئة"
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gradient mb-4">خدماتنا الإنسانية</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              اختر المجال الذي يلامس قلبك وساهم في صناعة الفرق
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/services/${service.slug}`}>
                <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white overflow-hidden h-full" data-testid={`card-service-${service.slug}`}>
                  <div className={`h-2 bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo}`} />
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 ${service.color} text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <service.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-foreground mb-1">{service.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{service.titleEn}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-primary text-sm font-medium">تبرع الآن</span>
                      <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/services">
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5">
              عرض جميع الخدمات
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <span className="text-primary font-bold text-sm tracking-wider mb-4 block">جمعية طويق للخدمات الإنسانية</span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 leading-tight">
              نسعى لبناء مجتمع <span className="text-gradient">متكافل ومتراحم</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              جمعية طويق للخدمات الإنسانية هي جمعية أهلية سعودية مرخصة من وزارة الموارد البشرية والتنمية الاجتماعية، 
              تأسست بهدف الارتقاء بالمستوى المعيشي للمستفيدين وترسيخ مبدأ التكافل الاجتماعي.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">رقم الترخيص</p>
                  <p className="text-sm text-muted-foreground">1000820300</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-bold text-foreground">المقر الرئيسي</p>
                  <p className="text-sm text-muted-foreground">الرياض</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/about">
                <Button className="bg-gradient-brand" data-testid="button-about">
                  اعرف المزيد عنا
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  <Phone className="w-4 h-4 ml-2" />
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-primary to-teal-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-12 h-12 mx-auto mb-3 opacity-80" />
                    <h3 className="font-heading font-bold text-xl mb-2">رؤيتنا</h3>
                    <p className="text-sm opacity-90">الريادة في العمل الخيري والإنساني</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-100 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-primary" />
                    <h3 className="font-heading font-bold text-xl mb-2 text-foreground">الشفافية</h3>
                    <p className="text-sm text-muted-foreground">نضمن وصول تبرعاتك لمستحقيها</p>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4 mt-8">
                <Card className="bg-white border border-gray-100 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Target className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                    <h3 className="font-heading font-bold text-xl mb-2 text-foreground">رسالتنا</h3>
                    <p className="text-sm text-muted-foreground">تقديم الدعم للفئات المحتاجة</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <Handshake className="w-12 h-12 mx-auto mb-3 opacity-80" />
                    <h3 className="font-heading font-bold text-xl mb-2">قيمنا</h3>
                    <p className="text-sm opacity-90">الأمانة والتكافل والمسؤولية</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { label: "مستفيد", value: "+8,350", icon: Users },
    { label: "مشروع منجز", value: "+450", icon: ShieldCheck },
    { label: "متبرع كريم", value: "+1,200", icon: Heart },
    { label: "شريك نجاح", value: "+50", icon: Handshake },
  ];

  return (
    <section className="py-16 bg-gradient-to-l from-primary to-teal-600 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">إنجازاتنا بالأرقام</h2>
          <p className="text-white/80 text-lg">نفتخر بثقتكم ونسعى دائماً للمزيد</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
              data-testid={`stat-${i}`}
            >
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <stat.icon className="w-10 h-10" />
              </div>
              <h4 className="text-4xl md:text-5xl font-bold font-heading mb-2">{stat.value}</h4>
              <p className="text-white/80 text-lg">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TopDonorsSection() {
  const { data: leaderboard } = useLeaderboard();
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gradient mb-4">قائمة الشرف</h2>
            <p className="text-muted-foreground text-lg">
              نفتخر بشركائنا في العطاء ونقدر مساهماتهم الكريمة
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-xl h-full">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold font-heading flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Award className="text-amber-500 w-6 h-6" />
                    </div>
                    أعلى المتبرعين
                  </h3>
                  <Link href="/leaderboard" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium" data-testid="link-leaderboard">
                    عرض الكل <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {leaderboard && leaderboard.length > 0 ? (
                    leaderboard.slice(0, 5).map((donor, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-l from-accent/50 to-accent/20 hover:from-accent hover:to-accent/40 transition-all"
                        data-testid={`donor-${idx}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md
                            ${idx === 0 ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white" : 
                              idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" : 
                              idx === 2 ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white" :
                              "bg-gray-100 text-gray-600"}`
                          }>
                            {idx + 1}
                          </div>
                          <span className="font-bold text-foreground text-lg">{donor.name}</span>
                        </div>
                        <span className="font-bold text-primary text-lg">{Number(donor.totalDonations).toLocaleString()} ريال</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">كن أول المتبرعين!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Donate Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <DonationCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <Card className="border-0 shadow-2xl bg-gradient-to-bl from-primary via-teal-600 to-emerald-700 text-white overflow-hidden">
          <CardContent className="p-12 md:p-16 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                  ﴿ وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ ﴾
                </h2>
                <p className="text-xl text-white/90 mb-10">
                  كل ريال تتبرع به يصنع فرقاً حقيقياً في حياة المحتاجين
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/donate">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-10 h-14 shadow-xl">
                      تبرع الآن
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </Button>
                  </Link>
                  <Link href="/bank-transfer">
                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-10 h-14">
                      <Building2 className="w-5 h-5 ml-2" />
                      تحويل بنكي
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function NewsSection() {
  const { data: news } = useQuery({
    queryKey: ['/api/admin/content'],
    queryFn: async () => {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      return Array.isArray(data) ? data.filter((c: any) => c.slug.startsWith('news-')) : [];
    }
  });

  if (!news || news.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-gradient mb-4">آخر الأخبار والفعاليات</h2>
          <p className="text-muted-foreground">تابع آخر مستجدات جمعية طويق ومشاريعها</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.slice(0, 3).map((item: any) => (
            <Card key={item.slug} className="overflow-hidden hover-elevate border-0 shadow-lg">
              {item.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-sm line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: item.content }} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <HeroSlider />
        <ServicesSection />
        <AboutSection />
        <NewsSection />
        <StatsSection />
        <TopDonorsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
