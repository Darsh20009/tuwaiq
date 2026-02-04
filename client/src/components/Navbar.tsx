import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Shield, UserCircle2, Mail, Phone, ChevronDown, Award, Building2, Heart, Droplet, Utensils, Moon } from "lucide-react";
import { SiFacebook, SiInstagram, SiX, SiYoutube } from "react-icons/si";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full font-heading">
      {/* Top Bar - Simplified for mobile */}
      <div className="bg-gradient-to-l from-primary to-teal-600 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10">
            {/* Left Side - Auth Buttons */}
            <div className="flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity px-3 py-1 rounded-md bg-white/10">
                      <User className="w-4 h-4" />
                      <span className="hidden xs:inline">{user.name}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 font-body">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-base">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.mobile}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/profile" className="flex items-center gap-2 w-full">
                        <UserCircle2 className="h-4 w-4" /> الملف الشخصي
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/certificates" className="flex items-center gap-2 w-full">
                        <Award className="h-4 w-4" /> شهاداتي
                      </Link>
                    </DropdownMenuItem>
                    {(user && ["admin", "accountant", "delivery", "editor", "manager"].includes(user.role || "")) && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/admin" className="flex items-center gap-2 w-full">
                          <Shield className="h-4 w-4" /> لوحة التحكم
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => logout()}>
                      <LogOut className="h-4 w-4 ml-2" /> تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <button className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity px-3 py-1 rounded-md bg-white/10" data-testid="button-login-top">
                    <User className="w-4 h-4" />
                    <span>تسجيل الدخول</span>
                  </button>
                </Link>
              )}
            </div>

            {/* Right Side - Contact & Social Icons */}
            <div className="flex items-center gap-4">
              <a href="mailto:tuwaikassociation@gmail.com" className="hover:opacity-80 transition-opacity hidden sm:flex items-center gap-1 text-xs" data-testid="link-email">
                <Mail className="w-4 h-4" />
                <span className="hidden lg:inline">tuwaikassociation@gmail.com</span>
              </a>
              <div className="h-4 w-px bg-white/30 hidden sm:block" />
              <a href="https://facebook.com" target="_blank" className="hover:opacity-80 transition-opacity" data-testid="link-facebook">
                <SiFacebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" className="hover:opacity-80 transition-opacity" data-testid="link-instagram">
                <SiInstagram className="w-4 h-4" />
              </a>
              <a href="https://x.com" target="_blank" className="hover:opacity-80 transition-opacity" data-testid="link-twitter">
                <SiX className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" className="hover:opacity-80 transition-opacity" data-testid="link-youtube">
                <SiYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu - Left side on mobile */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary" data-testid="button-mobile-menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <div className="flex flex-col gap-4 mt-10 font-heading">
                    <Link href="/" className={`text-lg font-medium transition-colors hover:text-primary ${isActive("/") ? "text-primary" : "text-gray-600"}`} onClick={() => setIsOpen(false)}>
                      الرئيسية
                    </Link>
                    
                    {/* Services */}
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-primary">الخدمات</p>
                      <div className="pr-4 space-y-2 text-gray-600">
                        <Link href="/services" className="block hover:text-primary" onClick={() => setIsOpen(false)}>جميع الخدمات</Link>
                        <Link href="/services/water" className="flex items-center gap-2 hover:text-primary" onClick={() => setIsOpen(false)}>
                          <Droplet className="w-4 h-4 text-blue-500" /> سقيا الماء
                        </Link>
                        <Link href="/services/food" className="flex items-center gap-2 hover:text-primary" onClick={() => setIsOpen(false)}>
                          <Utensils className="w-4 h-4 text-amber-500" /> إطعام الجائع
                        </Link>
                        <Link href="/services/iftar" className="flex items-center gap-2 hover:text-primary" onClick={() => setIsOpen(false)}>
                          <Moon className="w-4 h-4 text-purple-500" /> إفطار صائم
                        </Link>
                        <Link href="/services/special-cases" className="flex items-center gap-2 hover:text-primary" onClick={() => setIsOpen(false)}>
                          <Heart className="w-4 h-4 text-rose-500" /> الحالات الخاصة
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-lg font-bold text-primary">عن الجمعية</p>
                      <div className="pr-4 space-y-2 text-gray-600">
                        <Link href="/about" className="block hover:text-primary" onClick={() => setIsOpen(false)}>نشأة الجمعية</Link>
                        <Link href="/goals" className="block hover:text-primary" onClick={() => setIsOpen(false)}>أهداف الجمعية</Link>
                        <Link href="/vision" className="block hover:text-primary" onClick={() => setIsOpen(false)}>الرؤية والرسالة</Link>
                        <Link href="/founders" className="block hover:text-primary" onClick={() => setIsOpen(false)}>مؤسسو الجمعية</Link>
                        <Link href="/board" className="block hover:text-primary" onClick={() => setIsOpen(false)}>أعضاء مجلس الإدارة</Link>
                        <Link href="/assembly" className="block hover:text-primary" onClick={() => setIsOpen(false)}>أعضاء الجمعية العمومية</Link>
                        <Link href="/programs" className="block hover:text-primary" onClick={() => setIsOpen(false)}>برامج الجمعية</Link>
                        <Link href="/newsletters" className="block hover:text-primary" onClick={() => setIsOpen(false)}>نشرات الجمعية</Link>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-lg font-bold text-primary">خدماتنا</p>
                      <div className="pr-4 space-y-2 text-gray-600">
                        <Link href="/services" className="block hover:text-primary" onClick={() => setIsOpen(false)}>جميع الخدمات</Link>
                        <Link href="/beneficiaries" className="block hover:text-primary" onClick={() => setIsOpen(false)}>الخدمات المستفيدين</Link>
                        <Link href="/jobs" className="block hover:text-primary" onClick={() => setIsOpen(false)}>إعلانات الوظائف</Link>
                        <Link href="/apply-job" className="block hover:text-primary" onClick={() => setIsOpen(false)}>التقدم للتوظيف</Link>
                        <Link href="/volunteer" className="block hover:text-primary" onClick={() => setIsOpen(false)}>تطوع الآن</Link>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-lg font-bold text-primary">الحوكمة</p>
                      <div className="pr-4 space-y-2 text-gray-600">
                        <Link href="/bylaws" className="block hover:text-primary" onClick={() => setIsOpen(false)}>اللائحة الأساسية</Link>
                        <Link href="/financials" className="block hover:text-primary" onClick={() => setIsOpen(false)}>القوائم المالية</Link>
                        <Link href="/policies" className="block hover:text-primary" onClick={() => setIsOpen(false)}>السياسات واللوائح</Link>
                        <Link href="/committees" className="block hover:text-primary" onClick={() => setIsOpen(false)}>اللجان</Link>
                        <Link href="/satisfaction" className="block hover:text-primary" onClick={() => setIsOpen(false)}>قياس رضاء أصحاب العلاقة</Link>
                        <Link href="/ethics" className="block hover:text-primary" onClick={() => setIsOpen(false)}>الميثاق الأخلاقي</Link>
                        <Link href="/executive" className="block hover:text-primary" onClick={() => setIsOpen(false)}>المسؤول التنفيذي</Link>
                        <Link href="/disclosure" className="block hover:text-primary" onClick={() => setIsOpen(false)}>الإفصاح</Link>
                      </div>
                    </div>

                    <Link href="/news" className={`text-lg font-medium transition-colors hover:text-primary ${isActive("/news") ? "text-primary" : "text-gray-600"}`} onClick={() => setIsOpen(false)}>
                      الأخبار
                    </Link>
                    <Link href="/bank-accounts" className={`text-lg font-medium transition-colors hover:text-primary ${isActive("/bank-accounts") ? "text-primary" : "text-gray-600"}`} onClick={() => setIsOpen(false)}>
                      الحسابات البنكية
                    </Link>
                    <Link href="/blog" className={`text-lg font-medium transition-colors hover:text-primary ${isActive("/blog") ? "text-primary" : "text-gray-600"}`} onClick={() => setIsOpen(false)}>
                      المدونة
                    </Link>
                    <Link href="/bank-transfer" className={`text-lg font-medium transition-colors hover:text-primary flex items-center gap-2 ${isActive("/bank-transfer") ? "text-primary" : "text-gray-600"}`} onClick={() => setIsOpen(false)}>
                      <Building2 className="w-5 h-5" /> التحويل البنكي
                    </Link>
                    <Link href="/contact" className={`text-lg font-medium transition-colors hover:text-primary ${isActive("/contact") ? "text-primary" : "text-gray-600"}`} onClick={() => setIsOpen(false)}>
                      تواصل معنا
                    </Link>

                    {user ? (
                      <>
                        <div className="h-px bg-gray-100 my-2" />
                        <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-primary">
                          <User className="h-5 w-5" /> الملف الشخصي
                        </Link>
                        <Link href="/certificates" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-primary">
                          <Award className="h-5 w-5" /> شهاداتي
                        </Link>
                        {(user && ["admin", "accountant", "delivery", "editor", "manager"].includes(user.role || "")) && (
                          <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-primary">
                            <Shield className="h-5 w-5" /> لوحة التحكم
                          </Link>
                        )}
                        <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center gap-2 text-lg font-medium text-red-500 hover:text-red-600 text-right">
                          <LogOut className="h-5 w-5" /> تسجيل الخروج
                        </button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full text-lg mt-4 bg-gradient-brand">تسجيل الدخول</Button>
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo - Right side */}
            <Link href="/" className="flex items-center gap-3 hidden lg:flex" data-testid="link-logo">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md border-2 border-primary/20 bg-white">
                <img 
                  src="/images/logo.jpeg" 
                  alt="Twaq Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold font-heading text-gradient tracking-tight">طويق</h1>
                <p className="text-xs text-muted-foreground font-medium">للخدمات الإنسانية</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 font-heading">
              {/* الرئيسية */}
              <Link href="/" className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-accent/50 ${isActive("/") ? "text-primary bg-accent/30" : "text-gray-700"}`}>
                الرئيسية
              </Link>

              {/* الخدمات */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-primary px-3">
                      الخدمات
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[280px] p-3">
                        <Link href="/services" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors font-medium text-primary mb-2">
                          جميع الخدمات
                        </Link>
                        <div className="space-y-1">
                          <Link href="/services/water" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Droplet className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">سقيا الماء</p>
                              <p className="text-xs text-muted-foreground">Water Supply</p>
                            </div>
                          </Link>
                          <Link href="/services/food" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-50 transition-colors">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                              <Utensils className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">إطعام الجائع</p>
                              <p className="text-xs text-muted-foreground">Feed the Hungry</p>
                            </div>
                          </Link>
                          <Link href="/services/iftar" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-purple-50 transition-colors">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Moon className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">إفطار صائم</p>
                              <p className="text-xs text-muted-foreground">Iftar for Fasting</p>
                            </div>
                          </Link>
                          <Link href="/services/special-cases" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-rose-50 transition-colors">
                            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                              <Heart className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">الحالات الخاصة</p>
                              <p className="text-xs text-muted-foreground">Special Cases</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* عن الجمعية */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-primary px-3">
                      عن الجمعية
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[220px] p-2">
                        <Link href="/about" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">نشأة الجمعية</Link>
                        <Link href="/goals" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">أهداف الجمعية</Link>
                        <Link href="/vision" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">الرؤية والرسالة</Link>
                        <Link href="/founders" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">مؤسسو الجمعية</Link>
                        <Link href="/board" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">أعضاء مجلس الإدارة</Link>
                        <Link href="/assembly" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">أعضاء الجمعية العمومية</Link>
                        <Link href="/programs" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">برامج الجمعية</Link>
                        <Link href="/newsletters" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">نشرات الجمعية</Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* خدماتنا */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-primary px-3">
                      خدماتنا
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[220px] p-2">
                        <Link href="/services" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">جميع الخدمات</Link>
                        <Link href="/beneficiaries" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">الخدمات المستفيدين</Link>
                        <Link href="/jobs" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">إعلانات الوظائف</Link>
                        <Link href="/apply-job" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">التقدم للتوظيف</Link>
                        <Link href="/volunteer" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">تطوع الآن</Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* الحوكمة */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-primary px-3">
                      الحوكمة
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[220px] p-2">
                        <Link href="/bylaws" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">اللائحة الأساسية</Link>
                        <Link href="/financials" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">القوائم المالية</Link>
                        <Link href="/policies" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">السياسات واللوائح</Link>
                        <Link href="/committees" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">اللجان</Link>
                        <Link href="/satisfaction" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">قياس رضاء أصحاب العلاقة</Link>
                        <Link href="/ethics" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">الميثاق الأخلاقي</Link>
                        <Link href="/executive" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">المسؤول التنفيذي</Link>
                        <Link href="/disclosure" className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">الإفصاح</Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* الأخبار */}
              <Link href="/news" className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-accent/50 ${isActive("/news") ? "text-primary bg-accent/30" : "text-gray-700"}`}>
                الأخبار
              </Link>

              {/* الحسابات البنكية */}
              <Link href="/bank-accounts" className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-accent/50 ${isActive("/bank-accounts") ? "text-primary bg-accent/30" : "text-gray-700"}`}>
                الحسابات البنكية
              </Link>

              {/* المدونة */}
              <Link href="/blog" className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-accent/50 ${isActive("/blog") ? "text-primary bg-accent/30" : "text-gray-700"}`}>
                المدونة
              </Link>

              {/* التحويل البنكي */}
              <Link href="/bank-transfer" className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-accent/50 flex items-center gap-1 ${isActive("/bank-transfer") ? "text-primary bg-accent/30" : "text-gray-700"}`}>
                <Building2 className="w-4 h-4" />
                التحويل البنكي
              </Link>

              {/* تواصل معنا */}
              <Link href="/contact" className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-accent/50 ${isActive("/contact") ? "text-primary bg-accent/30" : "text-gray-700"}`}>
                تواصل معنا
              </Link>
            </div>

            {/* Mobile Logo */}
            <Link href="/" className="flex items-center gap-2 lg:hidden" data-testid="link-logo-mobile">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-sm border border-primary/20 bg-white">
                <img 
                  src="/images/logo.jpeg" 
                  alt="Twaq Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-bold font-heading text-gradient">طويق</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
