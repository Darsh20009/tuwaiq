import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, Heart, BookOpen, Phone, Search } from "lucide-react";

const QUICK_LINKS = [
  { href: "/", label: "الصفحة الرئيسية", icon: Home },
  { href: "/donate", label: "تبرع الآن", icon: Heart },
  { href: "/campaigns", label: "حملاتنا", icon: BookOpen },
  { href: "/contact", label: "تواصل معنا", icon: Phone },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl text-center space-y-8"
        >
          {/* Big 404 */}
          <div className="relative inline-block select-none">
            <span
              className="text-[140px] md:text-[180px] font-black leading-none"
              style={{ color: "hsl(152 42% 28% / 0.08)" }}
            >
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Search className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black font-heading text-foreground">
              الصفحة غير موجودة
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
              <br />
              يمكنك العودة للرئيسية أو تصفح الصفحات الأكثر زيارة.
            </p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer shadow-sm group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Link href="/">
              <Button size="lg" className="gap-2 font-bold px-8" data-testid="button-go-home">
                <Home className="w-5 h-5" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
