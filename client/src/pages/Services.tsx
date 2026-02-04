import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Droplet, Utensils, Moon, Heart, ArrowLeft, Users, Target, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const SERVICES_DATA = [
  {
    slug: "water",
    title: "سقيا الماء",
    titleEn: "Water Supply",
    icon: Droplet,
    color: "bg-blue-500",
    gradientFrom: "from-blue-500",
    gradientTo: "to-cyan-400",
    description: "الماء أساس الحياة، ساهم في توفير المياه النظيفة للمحتاجين",
    image: "https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=800",
    stats: { beneficiaries: 1200, projects: 45 }
  },
  {
    slug: "food",
    title: "إطعام الجائع",
    titleEn: "Feed the Hungry",
    icon: Utensils,
    color: "bg-amber-500",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-400",
    description: "أطعم جائعاً واكسب أجراً عظيماً، ساهم في إطعام المحتاجين",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
    stats: { beneficiaries: 3500, projects: 120 }
  },
  {
    slug: "iftar",
    title: "إفطار صائم",
    titleEn: "Iftar for Fasting",
    icon: Moon,
    color: "bg-purple-500",
    gradientFrom: "from-purple-500",
    gradientTo: "to-pink-400",
    description: "من فطّر صائماً كان له مثل أجره، ساهم في إفطار الصائمين",
    image: "https://images.unsplash.com/photo-1564671165093-20688ff1fffa?w=800",
    stats: { beneficiaries: 2800, projects: 85 }
  },
  {
    slug: "special-cases",
    title: "الحالات الخاصة",
    titleEn: "Special Cases",
    icon: Heart,
    color: "bg-rose-500",
    gradientFrom: "from-rose-500",
    gradientTo: "to-red-400",
    description: "ساعد الحالات الإنسانية الطارئة والعائلات المحتاجة",
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800",
    stats: { beneficiaries: 850, projects: 200 }
  }
];

function ServiceCard({ service, index }: { service: typeof SERVICES_DATA[0], index: number }) {
  const Icon = service.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={service.image} 
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${service.gradientFrom} ${service.gradientTo} opacity-60`} />
          <div className={`absolute top-4 right-4 w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <CardContent className="p-6">
          <h3 className="text-xl font-bold font-heading mb-2">{service.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.description}</p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{service.stats.beneficiaries.toLocaleString()} مستفيد</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{service.stats.projects} مشروع</span>
            </div>
          </div>
          
          <Link href={`/services/${service.slug}`}>
            <Button className={`w-full bg-gradient-to-l ${service.gradientFrom} ${service.gradientTo} hover:opacity-90`}>
              تبرع الآن
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-bl from-primary via-teal-600 to-emerald-700 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">خدماتنا الإنسانية</h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                اختر المجال الذي يلامس قلبك وساهم في صناعة الفرق
              </p>
            </motion.div>
          </div>
        </div>

        {/* Services Grid */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVICES_DATA.map((service, index) => (
                <ServiceCard key={service.slug} service={service} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-heading text-gradient mb-4">إنجازاتنا بالأرقام</h2>
              <p className="text-muted-foreground">نفتخر بثقتكم ونسعى دائماً للمزيد</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: "8,350+", label: "مستفيد", icon: Users },
                { value: "450+", label: "مشروع منجز", icon: CheckCircle2 },
                { value: "1,200+", label: "متبرع", icon: Heart },
                { value: "50+", label: "شريك نجاح", icon: Target },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-3xl font-bold font-heading text-gradient">{stat.value}</h4>
                  <p className="text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-l from-primary to-teal-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-heading mb-4">كن جزءاً من رحلة العطاء</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              تبرعك يصل لمستحقيه بأمان وشفافية تامة
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/donate">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8">
                  تبرع الآن
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold text-lg px-8">
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
