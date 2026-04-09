import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import {
  Menu, User, LogOut, Shield, UserCircle2,
  ChevronDown, Award, Building2, Heart,
  Globe2, Home, Baby, Phone, Mail, Landmark, Newspaper,
  BookOpen, HandHeart, Users, Briefcase, FileText,
  Star, Scale, ClipboardList, Vote, MessageSquare,
  UserCog, Eye, GraduationCap, ChevronLeft, X,
  Handshake, MapPin, Zap, TrendingUp, Bell, Target,
} from "lucide-react";
import { SiFacebook, SiInstagram, SiX, SiWhatsapp } from "react-icons/si";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect, useRef } from "react";

type MegaMenu = "services" | "about" | "governance" | "join" | null;

export function Navbar() {
  const { user, logout } = useAuth();
  const { unread } = useNotifications();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<MegaMenu>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (s: string) => setExpandedSection((prev) => (prev === s ? null : s));
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (m: MegaMenu) => setOpenMenu((prev) => (prev === m ? null : m));

  const linkCls = (path?: string) =>
    `relative px-3 py-1.5 text-[14px] font-semibold transition-colors duration-150 rounded-md font-heading cursor-pointer
    ${path && location === path ? "text-primary" : "text-[#304f6d] hover:text-primary"}`;

  const mobileLink = "flex items-center gap-2.5 px-2 py-2 text-sm text-foreground hover:bg-white hover:shadow-sm rounded-xl transition-all font-heading w-full";
  const dropItem = "flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors w-full font-body";

  return (
    <nav ref={navRef} className="sticky top-0 z-50 w-full" dir="rtl">
      <div
        className="bg-primary text-white text-xs"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex md:hidden items-center justify-between h-9">
            <div className="flex items-center gap-2">
              <a href="https://x.com/tuwaiq_2030" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity" data-testid="link-twitter-mobile">
                <SiX className="w-3.5 h-3.5" />
              </a>
              <a href="https://instagram.com/tuwaiq_2030" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity" data-testid="link-instagram-mobile">
                <SiInstagram className="w-3.5 h-3.5" />
              </a>
              <a href="https://facebook.com/tuwaiq2030" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity" data-testid="link-facebook-mobile">
                <SiFacebook className="w-3.5 h-3.5" />
              </a>
            </div>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:bg-white/15 px-2 py-1 rounded-md transition-colors font-semibold text-xs" data-testid="button-user-menu-mobile">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="max-w-[80px] truncate">{user.name}</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-70 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 font-body shadow-xl border border-gray-100 bg-white">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-bold text-sm text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.mobile}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                      <UserCircle2 className="h-4 w-4 text-primary" /> الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/certificates" className="flex items-center gap-2 w-full cursor-pointer">
                      <Award className="h-4 w-4 text-amber-500" /> شهاداتي
                    </Link>
                  </DropdownMenuItem>
                  {["admin", "accountant", "editor", "manager"].includes(user.role || "") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 w-full cursor-pointer">
                        <Shield className="h-4 w-4 text-blue-500" /> لوحة التحكم
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "delivery" && (
                    <DropdownMenuItem asChild>
                      <Link href="/delivery" className="flex items-center gap-2 w-full cursor-pointer">
                        <Shield className="h-4 w-4 text-orange-500" /> لوحة المندوب
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "employee" && (
                    <DropdownMenuItem asChild>
                      <Link href="/employee" className="flex items-center gap-2 w-full cursor-pointer">
                        <Shield className="h-4 w-4 text-purple-500" /> لوحة الموظف
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 focus:text-red-500 cursor-pointer" onClick={() => logout()}>
                    <LogOut className="h-4 w-4 ml-2" /> تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <button className="flex items-center gap-1 hover:bg-white/15 px-2 py-1 rounded-md transition-colors font-semibold text-xs" data-testid="button-login-top-mobile">
                  <User className="w-3 h-3" />
                  دخول الداعمين
                </button>
              </Link>
            )}
          </div>
          <div className="hidden md:flex items-center justify-between h-9">
            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-white/15 px-3 py-1 rounded-md transition-colors text-xs" data-testid="button-user-menu">
                      <User className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline font-semibold">{user.name}</span>
                      <ChevronDown className="w-3 h-3 opacity-70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52 font-body shadow-xl border border-gray-100 bg-white">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="font-bold text-sm text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.mobile}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                        <UserCircle2 className="h-4 w-4 text-primary" /> الملف الشخصي
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/certificates" className="flex items-center gap-2 w-full cursor-pointer">
                        <Award className="h-4 w-4 text-amber-500" /> شهاداتي
                      </Link>
                    </DropdownMenuItem>
                    {["admin", "accountant", "editor", "manager"].includes(user.role || "") && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 w-full cursor-pointer">
                          <Shield className="h-4 w-4 text-blue-500" /> لوحة التحكم
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "delivery" && (
                      <DropdownMenuItem asChild>
                        <Link href="/delivery" className="flex items-center gap-2 w-full cursor-pointer">
                          <Shield className="h-4 w-4 text-orange-500" /> لوحة المندوب
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "employee" && (
                      <DropdownMenuItem asChild>
                        <Link href="/employee" className="flex items-center gap-2 w-full cursor-pointer">
                          <Shield className="h-4 w-4 text-purple-500" /> لوحة الموظف
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500 cursor-pointer"
                      onClick={() => logout()}
                    >
                      <LogOut className="h-4 w-4 ml-2" /> تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <button className="flex items-center gap-1.5 hover:bg-white/15 px-3 py-1 rounded-md transition-colors font-semibold text-xs" data-testid="button-login-top">
                    <User className="w-3.5 h-3.5" />
                    دخول الداعمين
                  </button>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3">
              <a href="mailto:tuwaikassociation@gmail.com" className="hidden md:flex items-center gap-1 hover:opacity-80 transition-opacity" data-testid="link-email">
                <Mail className="w-3 h-3" />
                <span className="hidden lg:inline">tuwaikassociation@gmail.com</span>
              </a>
              <div className="w-px h-3.5 bg-white/25 hidden md:block" />
              <div className="flex items-center gap-2">
                <a href="https://x.com/tuwaiq_2030" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity" data-testid="link-twitter">
                  <SiX className="w-3 h-3" />
                </a>
                <a href="https://instagram.com/tuwaiq_2030" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity" data-testid="link-instagram">
                  <SiInstagram className="w-3 h-3" />
                </a>
                <a href="https://facebook.com/tuwaiq2030" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity" data-testid="link-facebook">
                  <SiFacebook className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}
        style={{ backgroundColor: "hsl(35 30% 92%)", borderBottom: "1px solid hsl(35 20% 84%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[68px]">
            <div className="lg:hidden order-first">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button
                    className="p-2 rounded-lg hover:bg-primary/8 transition-colors text-[#304f6d]"
                    data-testid="button-mobile-menu"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[290px] sm:w-[320px] overflow-y-auto p-0 border-r" style={{ background: "#fff", borderColor: "hsl(152 20% 88%)" }}>

                  {/* ── Header ── */}
                  <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "hsl(152 20% 88%)", background: "hsl(152 42% 28%)" }}>
                    <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/30 shrink-0">
                      <img src="/images/logo.jpeg" alt="طويق" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-black font-heading text-sm leading-tight text-white">جمعية طويق للخدمات الإنسانية</h2>
                      <p className="text-[10px] mt-0.5 text-white/70">رقم الترخيص: ٦٥٧٣</p>
                    </div>
                  </div>

                  {/* ── Nav Body ── */}
                  <div className="pb-6 px-0 pt-0">

                    {/* Donate button */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: "hsl(152 20% 90%)" }}>
                      <Link href="/donate" onClick={() => setIsOpen(false)}>
                        <button className="w-full py-2.5 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                          style={{ background: "hsl(152 42% 28%)" }}>
                          <Heart className="w-4 h-4" />
                          تبرع الآن
                        </button>
                      </Link>
                    </div>

                    {/* Nav links */}
                    <div className="py-2">
                      {/* Home */}
                      <Link href="/" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors" style={{ color: "hsl(152 42% 22%)" }}>
                          <Home className="w-4 h-4 shrink-0 opacity-60" />
                          الرئيسية
                        </div>
                      </Link>

                      {/* ── Accordion sections ── */}
                      {[
                        {
                          key: "services", label: "الخدمات الإنسانية", icon: HandHeart,
                          links: [
                            { href: "/services/hajj", icon: Globe2, label: "كفالة حاج" },
                            { href: "/services/families", icon: Home, label: "كفالة أسر أرامل" },
                            { href: "/services/orphan", icon: Baby, label: "كفالة يتيم" },
                            { href: "/services/relief", icon: HandHeart, label: "تفريج كربة" },
                            { href: "/services", icon: ClipboardList, label: "جميع الخدمات" },
                          ],
                        },
                        {
                          key: "about", label: "عن الجمعية", icon: Building2,
                          links: [
                            { href: "/about", icon: BookOpen, label: "نشأة الجمعية" },
                            { href: "/vision", icon: Eye, label: "الرؤية والرسالة" },
                            { href: "/goals", icon: Target, label: "الأهداف" },
                            { href: "/founders", icon: Star, label: "المؤسسون" },
                            { href: "/board", icon: Users, label: "مجلس الإدارة" },
                            { href: "/programs", icon: ClipboardList, label: "البرامج" },
                          ],
                        },
                        {
                          key: "governance", label: "الحوكمة والشفافية", icon: Scale,
                          links: [
                            { href: "/governance/financials", icon: TrendingUp, label: "القوائم المالية" },
                            { href: "/governance/policies", icon: FileText, label: "السياسات واللوائح" },
                            { href: "/governance/committees", icon: Users, label: "اللجان" },
                            { href: "/governance/ethics", icon: Star, label: "الميثاق الأخلاقي" },
                            { href: "/governance/disclosure", icon: Eye, label: "الإفصاح" },
                            { href: "/governance/satisfaction", icon: MessageSquare, label: "قياس الرضا" },
                            { href: "/governance/executive", icon: UserCog, label: "المسؤول التنفيذي" },
                          ],
                        },
                        {
                          key: "join", label: "المشاركة والتطوع", icon: Heart,
                          links: [
                            { href: "/volunteer", icon: HandHeart, label: "تطوع معنا" },
                            { href: "/jobs", icon: Briefcase, label: "الوظائف" },
                            { href: "/bank-accounts", icon: Landmark, label: "الحسابات البنكية" },
                          ],
                        },
                        {
                          key: "content", label: "الأخبار والمحتوى", icon: Newspaper,
                          links: [
                            { href: "/news", icon: Newspaper, label: "الأخبار" },
                            { href: "/blog", icon: BookOpen, label: "المدونة" },
                            { href: "/impact", icon: TrendingUp, label: "الأثر والتأثير" },
                            { href: "/campaigns", icon: Zap, label: "الحملات" },
                          ],
                        },
                      ].map((section) => (
                        <div key={section.key} className="border-b last:border-0" style={{ borderColor: "hsl(152 20% 92%)" }}>
                          <button
                            onClick={() => toggleSection(section.key)}
                            className="flex items-center justify-between w-full px-5 py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors"
                            style={{ color: "hsl(210 22% 18%)" }}
                          >
                            <span className="flex items-center gap-2.5">
                              <section.icon className="w-4 h-4 shrink-0" style={{ color: "hsl(152 42% 32%)" }} />
                              {section.label}
                            </span>
                            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 opacity-40 ${expandedSection === section.key ? "-rotate-90" : ""}`} />
                          </button>

                          {expandedSection === section.key && (
                            <div className="pb-1" style={{ background: "hsl(35 25% 98%)" }}>
                              {section.links.map((l) => (
                                <Link key={l.href} href={l.href} onClick={() => setIsOpen(false)}>
                                  <div className="flex items-center gap-2.5 px-8 py-2 text-sm hover:bg-gray-100 transition-colors"
                                    style={{ color: "hsl(210 18% 30%)" }}>
                                    <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "hsl(152 42% 42%)" }} />
                                    {l.label}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Contact */}
                      <Link href="/contact" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors" style={{ color: "hsl(152 42% 22%)" }}>
                          <Phone className="w-4 h-4 shrink-0 opacity-60" />
                          تواصل معنا
                        </div>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t mx-0" style={{ borderColor: "hsl(152 20% 88%)" }} />

                    {/* User section */}
                    <div className="px-4 py-3">
                      {user ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-3 px-1 py-2 mb-2 border-b" style={{ borderColor: "hsl(152 20% 90%)" }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                              style={{ background: "hsl(152 42% 32%)" }}>
                              {user.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate" style={{ color: "hsl(152 42% 18%)" }}>{user.name}</p>
                              <p className="text-[11px] text-gray-500">{user.mobile}</p>
                            </div>
                          </div>
                          <Link href="/profile" className={mobileLink} onClick={() => setIsOpen(false)}>
                            <UserCircle2 className="w-4 h-4 opacity-50 shrink-0" /> ملفي الشخصي
                          </Link>
                          <Link href="/notifications" className={mobileLink} onClick={() => setIsOpen(false)}>
                            <Bell className="w-4 h-4 opacity-50 shrink-0" /> إشعاراتي
                            {unread > 0 && (
                              <span className="mr-auto text-white text-[10px] font-bold rounded-full px-1.5 py-0.5" style={{ background: "hsl(152 42% 28%)" }}>{unread}</span>
                            )}
                          </Link>
                          <Link href="/certificates" className={mobileLink} onClick={() => setIsOpen(false)}>
                            <Award className="w-4 h-4 opacity-50 shrink-0" /> شهاداتي
                          </Link>
                          {["admin", "accountant", "editor", "manager"].includes(user.role || "") && (
                            <Link href="/admin" className={mobileLink} onClick={() => setIsOpen(false)}>
                              <Shield className="w-4 h-4 opacity-50 shrink-0" /> لوحة التحكم
                            </Link>
                          )}
                          {user.role === "delivery" && (
                            <Link href="/delivery" className={mobileLink} onClick={() => setIsOpen(false)}>
                              <Shield className="w-4 h-4 opacity-50 shrink-0" /> لوحة المندوب
                            </Link>
                          )}
                          {user.role === "employee" && (
                            <Link href="/employee" className={mobileLink} onClick={() => setIsOpen(false)}>
                              <Shield className="w-4 h-4 opacity-50 shrink-0" /> لوحة الموظف
                            </Link>
                          )}
                          <button onClick={() => { logout(); setIsOpen(false); }}
                            className={`${mobileLink} text-red-600`}>
                            <LogOut className="w-4 h-4 opacity-60 shrink-0" /> تسجيل الخروج
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            <button className="w-full py-2.5 rounded-lg font-bold text-sm text-white transition-opacity hover:opacity-90"
                              style={{ background: "hsl(152 42% 28%)" }}
                              data-testid="button-mobile-login">
                              تسجيل الدخول
                            </button>
                          </Link>
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            <button className="w-full py-2.5 rounded-lg font-semibold text-sm border transition-colors hover:bg-gray-50"
                              style={{ borderColor: "hsl(152 30% 72%)", color: "hsl(152 42% 28%)" }}>
                              إنشاء حساب جديد
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Footer info */}
                    <div className="px-4 pt-2 pb-3 text-center">
                      <p className="text-[10px]" style={{ color: "hsl(152 20% 55%)" }}>رقم السجل ١٠٠٠٨٢٠٣٠٠ • الترخيص ٦٥٧٣</p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <Link href="/" className="flex items-center gap-3 shrink-0" data-testid="link-logo">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow border border-white/60 shrink-0">
                <img src="/images/logo.jpeg" alt="طويق" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-[20px] font-black font-heading leading-tight" style={{ color: "hsl(152 42% 28%)" }}>طويق</div>
                <div className="text-[11px] font-medium leading-none mt-0.5" style={{ color: "#304f6d" }}>للخدمات الإنسانية</div>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-0">
              <Link href="/" className={linkCls("/")}>الرئيسية</Link>
              <div className="relative">
                <button
                  className={`${linkCls()} flex items-center gap-1`}
                  onClick={() => toggle("services")}
                  data-testid="nav-services"
                >
                  الخدمات
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "services" ? "rotate-180" : ""}`} />
                </button>
                {openMenu === "services" && (
                  <div className="absolute top-full right-0 mt-1.5 w-[260px] bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50">
                    <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">خدماتنا الإنسانية</p>
                    {[
                      { href: "/services/hajj", icon: Globe2, color: "text-emerald-600 bg-emerald-50", label: "كفالة حاج" },
                      { href: "/services/families", icon: Home, color: "text-sky-600 bg-sky-50", label: "كفالة أسر أرامل" },
                      { href: "/services/orphan", icon: Baby, color: "text-amber-600 bg-amber-50", label: "كفالة يتيم" },
                      { href: "/services/relief", icon: HandHeart, color: "text-violet-600 bg-violet-50", label: "تفريج كربة" },
                    ].map((s) => (
                      <Link key={s.href + s.label} href={s.href} className={dropItem} onClick={() => setOpenMenu(null)}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                          <s.icon className="w-4 h-4" />
                        </div>
                        {s.label}
                      </Link>
                    ))}
                    <div className="mt-1 pt-1 border-t border-gray-50">
                      <Link href="/services" className={dropItem} onClick={() => setOpenMenu(null)}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/8 text-primary">
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        جميع الخدمات
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  className={`${linkCls()} flex items-center gap-1`}
                  onClick={() => toggle("about")}
                  data-testid="nav-about"
                >
                  عن الجمعية
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "about" ? "rotate-180" : ""}`} />
                </button>
                {openMenu === "about" && (
                  <div className="absolute top-full right-0 mt-1.5 w-[230px] bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50">
                    {[
                      { href: "/about", label: "نشأة الجمعية" },
                      { href: "/vision", label: "الرؤية والرسالة" },
                      { href: "/goals", label: "الأهداف" },
                      { href: "/founders", label: "المؤسسون" },
                      { href: "/board", label: "مجلس الإدارة" },
                      { href: "/general-assembly", label: "الجمعية العمومية" },
                      { href: "/programs", label: "برامج الجمعية" },
                      { href: "/newsletters", label: "نشرات الجمعية" },
                    ].map((l) => (
                      <Link key={l.href} href={l.href} className={dropItem} onClick={() => setOpenMenu(null)}>{l.label}</Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  className={`${linkCls()} flex items-center gap-1`}
                  onClick={() => toggle("governance")}
                  data-testid="nav-governance"
                >
                  الحوكمة
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "governance" ? "rotate-180" : ""}`} />
                </button>
                {openMenu === "governance" && (
                  <div className="absolute top-full right-0 mt-1.5 w-[230px] bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50">
                    {[
                      { href: "/governance/charter", label: "اللائحة الأساسية" },
                      { href: "/governance/financials", label: "القوائم المالية" },
                      { href: "/governance/policies", label: "السياسات واللوائح" },
                      { href: "/governance/committees", label: "اللجان" },
                      { href: "/governance/satisfaction", label: "قياس الرضا" },
                      { href: "/governance/ethics", label: "الميثاق الأخلاقي" },
                      { href: "/governance/executive", label: "المسؤول التنفيذي" },
                      { href: "/governance/disclosure", label: "الإفصاح" },
                    ].map((l) => (
                      <Link key={l.href} href={l.href} className={dropItem} onClick={() => setOpenMenu(null)}>{l.label}</Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  className={`${linkCls()} flex items-center gap-1`}
                  onClick={() => toggle("join")}
                  data-testid="nav-join"
                >
                  انضم إلينا
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "join" ? "rotate-180" : ""}`} />
                </button>
                {openMenu === "join" && (
                  <div className="absolute top-full right-0 mt-1.5 w-[210px] bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50">
                    <Link href="/volunteer" className={dropItem} onClick={() => setOpenMenu(null)}>
                      <HandHeart className="w-4 h-4 text-rose-500" /> تطوع معنا
                    </Link>
                    <Link href="/jobs" className={dropItem} onClick={() => setOpenMenu(null)}>
                      <Briefcase className="w-4 h-4 text-blue-500" /> الوظائف
                    </Link>
                    <Link href="/apply-job" className={dropItem} onClick={() => setOpenMenu(null)}>
                      <GraduationCap className="w-4 h-4 text-primary" /> التقدم للتوظيف
                    </Link>
                    <Link href="/beneficiaries" className={dropItem} onClick={() => setOpenMenu(null)}>
                      <Users className="w-4 h-4 text-teal-500" /> خدمات المستفيدين
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/news" className={linkCls("/news")}>الأخبار</Link>
              <Link href="/impact" className={linkCls("/impact")}>الأثر</Link>
              <Link href="/contact" className={linkCls("/contact")}>تواصل معنا</Link>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {user && (
                <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-primary/8 transition-colors text-[#304f6d]" data-testid="button-notifications">
                  <Bell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
              )}
              <Link href="/bank-transfer" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#304f6d] hover:text-primary transition-colors font-heading">
                <Building2 className="w-3.5 h-3.5" />
                التحويل البنكي
              </Link>
              <Link href="/donate" data-testid="button-donate-nav">
                <button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white font-heading transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{ backgroundColor: "hsl(28 44% 59%)" }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "hsl(26 52% 42%)")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "hsl(28 44% 59%)")}
                >
                  <Zap className="w-3.5 h-3.5" />
                  تبرع سريع
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
