import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart, Award, Building2, Droplet, Utensils, Moon } from "lucide-react";
import { Link } from "wouter";
import { SiFacebook, SiInstagram, SiX, SiYoutube, SiSnapchat } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <img 
                src="/images/logo.jpeg" 
                alt="طويق" 
                className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white/20 object-cover"
              />
              <div>
                <h3 className="text-2xl font-bold font-heading">طويق</h3>
                <p className="text-white/70 text-sm">للخدمات الإنسانية</p>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed">
              جمعية أهلية سعودية مرخصة تسعى لتقديم الدعم للمحتاجين وبناء مجتمع متكافل من خلال 
              برامج سقيا الماء وإطعام الجائع وإفطار الصائم والحالات الخاصة.
            </p>
            
            {/* License Info */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 rounded-xl px-4 py-2">
                <p className="text-xs text-white/60">رقم الترخيص</p>
                <p className="font-mono font-bold">1000820300</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2">
                <p className="text-xs text-white/60">الرقم الوطني الموحد</p>
                <p className="font-mono font-bold">7052479891</p>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <SiFacebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-colors">
                <SiInstagram className="w-5 h-5" />
              </a>
              <a href="https://x.com" target="_blank" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-black transition-colors">
                <SiX className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors">
                <SiYoutube className="w-5 h-5" />
              </a>
              <a href="https://snapchat.com" target="_blank" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors">
                <SiSnapchat className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold font-heading text-lg mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              خدماتنا
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/services/water" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
                  سقيا الماء
                </Link>
              </li>
              <li>
                <Link href="/services/food" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  إطعام الجائع
                </Link>
              </li>
              <li>
                <Link href="/services/iftar" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  إفطار صائم
                </Link>
              </li>
              <li>
                <Link href="/services/special-cases" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  الحالات الخاصة
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold font-heading text-lg mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-white/70 hover:text-white transition-colors">الرئيسية</Link></li>
              <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">عن الجمعية</Link></li>
              <li><Link href="/donate" className="text-white/70 hover:text-white transition-colors">تبرع الآن</Link></li>
              <li><Link href="/bank-transfer" className="text-white/70 hover:text-white transition-colors">التحويل البنكي</Link></li>
              <li><Link href="/certificates" className="text-white/70 hover:text-white transition-colors">شهاداتي</Link></li>
              <li><Link href="/leaderboard" className="text-white/70 hover:text-white transition-colors">قائمة الشرف</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold font-heading text-lg mb-6">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>المملكة العربية السعودية<br />الرياض</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+966505793012" className="font-mono hover:text-white transition-colors" dir="ltr">+966 50 579 3012</a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:tuwaikassociation@gmail.com" className="hover:text-white transition-colors text-sm">tuwaikassociation@gmail.com</a>
              </li>
            </ul>
            
            {/* Bank Accounts Quick Access */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-white/60 mb-2">للتبرع عبر التحويل البنكي</p>
              <Link href="/bank-transfer" className="text-primary hover:text-primary/80 font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                عرض الحسابات البنكية
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-white/60 text-sm text-center md:text-right">
              © {new Date().getFullYear()} جمعية طويق للخدمات الإنسانية. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-4 text-sm text-white/60">
              <Link href="/bylaws" className="hover:text-white transition-colors">اللائحة الأساسية</Link>
              <span>|</span>
              <Link href="/policies" className="hover:text-white transition-colors">السياسات</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6 opacity-70 hover:opacity-100 transition-opacity">
            <img className="h-14 w-auto" src="https://ehsan.sa/ehsan-ui/images/2030.svg" alt="رؤية 2030" />
          </div>
        </div>
      </div>
    </footer>
  );
}
