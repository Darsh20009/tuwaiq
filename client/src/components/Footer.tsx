import { Mail, Phone, MapPin, Heart, Building2, Globe2, Home, Baby, HandHeart } from "lucide-react";
import { Link } from "wouter";
import { SiFacebook, SiInstagram, SiX, SiYoutube, SiSnapchat, SiTiktok } from "react-icons/si";

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
                alt="جمعية طويق للخدمات الإنسانية"
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

            {/* License Info + QR Code */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm w-fit">
              {/* QR Code */}
              <div className="relative shrink-0 group">
                <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-xl p-2 shadow-lg ring-2 ring-primary/40">
                  <img
                    src="/images/qr-code.png"
                    alt="باركود التحقق من ترخيص الجمعية"
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <p className="text-[10px] text-center text-white/50 mt-1.5 font-medium tracking-wide">امسح للتحقق</p>
              </div>

              {/* License Numbers */}
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5">رقم السجل</p>
                  <p className="font-mono font-black text-base text-white tracking-wider">1000820300</p>
                </div>
                <div className="w-full h-px bg-white/10" />
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5">رقم الترخيص</p>
                  <p className="font-mono font-black text-base text-primary tracking-wider">6573</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              <a
                href="https://x.com/tuwaiq_2o3o"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تويتر / X"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-black transition-colors"
              >
                <SiX className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/tuwaiq_2o3o"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="إنستغرام"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-colors"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/tuwaiq_2o3o"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="فيسبوك"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <SiFacebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@tuwaiq_2o3o"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="يوتيوب"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <SiYoutube className="w-4 h-4" />
              </a>
              <a
                href="https://snapchat.com/add/tuwaiq_2o3o"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="سناب شات"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors"
              >
                <SiSnapchat className="w-4 h-4" />
              </a>
              <a
                href="https://tiktok.com/@tuwaiq_2o3o"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تيك توك"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <SiTiktok className="w-4 h-4" />
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
                <Link href="/services/hajj" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Globe2 className="w-4 h-4" />
                  كفالة حاج
                </Link>
              </li>
              <li>
                <Link href="/services/families" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  كفالة أسر أرامل
                </Link>
              </li>
              <li>
                <Link href="/services/orphan" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Baby className="w-4 h-4" />
                  كفالة يتيم
                </Link>
              </li>
              <li>
                <Link href="/services/relief" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <HandHeart className="w-4 h-4" />
                  تفريج كربة
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
              <li><Link href="/news" className="text-white/70 hover:text-white transition-colors">الأخبار</Link></li>
              <li><Link href="/donate" className="text-white/70 hover:text-white transition-colors">تبرع الآن</Link></li>
              <li><Link href="/bank-transfer" className="text-white/70 hover:text-white transition-colors">التحويل البنكي</Link></li>
              <li><Link href="/volunteer" className="text-white/70 hover:text-white transition-colors">تطوع معنا</Link></li>
              <li><Link href="/jobs" className="text-white/70 hover:text-white transition-colors">الوظائف</Link></li>
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

            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-white/60 mb-2">للتبرع عبر التحويل البنكي</p>
              <Link href="/bank-accounts" className="text-primary hover:text-primary/80 font-medium flex items-center gap-2">
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
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/60 justify-center md:justify-start">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
              <span className="hidden sm:inline">|</span>
              <Link href="/bylaws" className="hover:text-white transition-colors">اللائحة الأساسية</Link>
              <span className="hidden sm:inline">|</span>
              <Link href="/policies" className="hover:text-white transition-colors">السياسات</Link>
              <span className="hidden sm:inline">|</span>
              <Link href="/ethics" className="hover:text-white transition-colors">الميثاق الأخلاقي</Link>
            </div>
          </div>

          <div className="flex items-center gap-6 opacity-70 hover:opacity-100 transition-opacity">
            <img className="h-14 w-auto" src="https://ehsan.sa/ehsan-ui/images/2030.svg" alt="رؤية 2030" />
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-white/40 text-xs">
            made by{" "}
            <a
              href="https://qiroxstudio.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors font-medium"
            >
              Qirox Studio
            </a>
            {" "}group
          </p>
        </div>
      </div>
    </footer>
  );
}
