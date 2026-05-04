import {
  LayoutDashboard, Users, Briefcase, FileText, Mail, Settings, LogOut,
  DollarSign, UserCheck, Newspaper, Image, CreditCard, BarChart3, Globe, Home,
  ChevronRight, Shield, Truck, Package, Heart, Clock, CalendarDays, Bell,
  TrendingUp, ArrowLeftRight, MessageSquare, Calculator, Code2, Megaphone,
  Send, Inbox, Activity, Award, Bot, MonitorSmartphone,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { NotificationBell } from "@/components/NotificationBell";

const adminGroups = [
  {
    label: "الرئيسية",
    items: [
      { title: "لوحة التحكم", icon: LayoutDashboard, url: "/admin" },
      { title: "التقارير التفصيلية", icon: BarChart3, url: "/admin/reports" },
      { title: "الإحصائيات العامة", icon: TrendingUp, url: "/admin/analytics" },
      { title: "الإشعارات", icon: Bell, url: "/admin/notifications" },
    ],
  },
  {
    label: "إدارة المحتوى",
    items: [
      { title: "بانر الصفحة الرئيسية", icon: Image, url: "/admin/slider" },
      { title: "البانر الإعلاني العائم", icon: Megaphone, url: "/admin/banners" },
      { title: "محرر الصفحات", icon: Globe, url: "/admin/pages" },
      { title: "الأخبار", icon: Newspaper, url: "/admin/news" },
      { title: "الحملات الخيرية", icon: Megaphone, url: "/admin/campaigns" },
      { title: "الأسئلة الشائعة", icon: MessageSquare, url: "/admin/faq" },
    ],
  },
  {
    label: "المالية",
    items: [
      { title: "التبرعات", icon: DollarSign, url: "/admin/donations" },
      { title: "التحويلات البنكية", icon: CreditCard, url: "/admin/transfers" },
    ],
  },
  {
    label: "الموارد البشرية",
    items: [
      { title: "الوظائف", icon: Briefcase, url: "/admin/jobs" },
      { title: "طلبات التوظيف", icon: UserCheck, url: "/admin/applications" },
      { title: "الحضور والانصراف", icon: Clock, url: "/admin/attendance" },
      { title: "طلبات الإجازة", icon: CalendarDays, url: "/admin/leave" },
    ],
  },
  {
    label: "الخدمات الإنسانية",
    items: [
      { title: "المستفيدون", icon: Heart, url: "/admin/beneficiaries" },
      { title: "البضائع والمخزون", icon: Package, url: "/admin/products" },
      { title: "حركة المخزون", icon: ArrowLeftRight, url: "/admin/stock-movements" },
      { title: "إدارة التوصيل", icon: Truck, url: "/admin/deliveries" },
    ],
  },
  {
    label: "الاتصالات الداخلية",
    items: [
      { title: "الشات الداخلي", icon: MessageSquare, url: "/admin/chat" },
      { title: "البريد الداخلي", icon: Inbox, url: "/admin/mail" },
      { title: "البريد الإلكتروني", icon: Mail, url: "/admin/emails" },
    ],
  },
  {
    label: "الذكاء الاصطناعي",
    items: [
      { title: "المساعد الذكي", icon: Bot, url: "/admin/ai" },
    ],
  },
  {
    label: "التتبع والإعلانات",
    items: [
      { title: "البيكسل وتتبع العملاء", icon: TrendingUp, url: "/admin/tracking" },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { title: "الموظفون والصلاحيات", icon: Users, url: "/admin/users" },
      { title: "منشئ البوسترات", icon: Image, url: "/admin/posters" },
      { title: "نشر التطبيق في المتاجر", icon: MonitorSmartphone, url: "/admin/app-store" },
      { title: "إدارة SEO والمشاركة", icon: Globe, url: "/admin/seo" },
      { title: "لوحة Qirox", icon: Activity, url: "/admin/qirox" },
      { title: "الإعدادات", icon: Settings, url: "/admin/settings" },
    ],
  },
];

const employeeGroups = [
  {
    label: "الرئيسية",
    items: [
      { title: "لوحة التحكم", icon: LayoutDashboard, url: "/employee" },
    ],
  },
  {
    label: "الذكاء الاصطناعي",
    items: [
      { title: "المساعد الذكي", icon: Bot, url: "/admin/ai" },
    ],
  },
  {
    label: "التواصل",
    items: [
      { title: "الشات الداخلي", icon: MessageSquare, url: "/employee/chat" },
      { title: "البريد الداخلي", icon: Inbox, url: "/employee/mail" },
    ],
  },
  {
    label: "العمليات",
    items: [
      { title: "التحويلات البنكية", icon: CreditCard, url: "/employee/transfers" },
      { title: "طلبات التوظيف", icon: FileText, url: "/employee/applications" },
    ],
  },
  {
    label: "الحضور والإجازات",
    items: [
      { title: "سجل حضوري", icon: Clock, url: "/employee/attendance" },
      { title: "طلبات الإجازة", icon: CalendarDays, url: "/employee/leave" },
    ],
  },
];

const accountantGroups = [
  {
    label: "الرئيسية",
    items: [
      { title: "لوحة المحاسب", icon: Calculator, url: "/employee" },
    ],
  },
  {
    label: "الذكاء الاصطناعي",
    items: [
      { title: "المساعد الذكي", icon: Bot, url: "/admin/ai" },
    ],
  },
  {
    label: "التواصل",
    items: [
      { title: "الشات الداخلي", icon: MessageSquare, url: "/employee/chat" },
      { title: "البريد الداخلي", icon: Inbox, url: "/employee/mail" },
    ],
  },
  {
    label: "المالية — ERP",
    items: [
      { title: "التحويلات البنكية", icon: CreditCard, url: "/employee/transfers" },
      { title: "التبرعات والمتحصلات", icon: DollarSign, url: "/employee/donations" },
    ],
  },
  {
    label: "الحضور",
    items: [
      { title: "سجل حضوري", icon: Clock, url: "/employee/attendance" },
      { title: "طلبات الإجازة", icon: CalendarDays, url: "/employee/leave" },
    ],
  },
];

const programmerGroups = [
  {
    label: "الرئيسية",
    items: [
      { title: "لوحة المبرمج", icon: Code2, url: "/employee" },
    ],
  },
  {
    label: "الذكاء الاصطناعي",
    items: [
      { title: "المساعد الذكي", icon: Bot, url: "/admin/ai" },
    ],
  },
  {
    label: "التواصل",
    items: [
      { title: "الشات الداخلي", icon: MessageSquare, url: "/employee/chat" },
      { title: "البريد الداخلي", icon: Inbox, url: "/employee/mail" },
    ],
  },
  {
    label: "مهام التطوير",
    items: [
      { title: "مهام النظام", icon: Code2, url: "/employee/tasks" },
    ],
  },
  {
    label: "الحضور",
    items: [
      { title: "سجل حضوري", icon: Clock, url: "/employee/attendance" },
      { title: "طلبات الإجازة", icon: CalendarDays, url: "/employee/leave" },
    ],
  },
];

const salesGroups = [
  {
    label: "الرئيسية",
    items: [
      { title: "لوحة المبيعات", icon: Megaphone, url: "/employee" },
    ],
  },
  {
    label: "الذكاء الاصطناعي",
    items: [
      { title: "المساعد الذكي", icon: Bot, url: "/admin/ai" },
    ],
  },
  {
    label: "التواصل",
    items: [
      { title: "الشات الداخلي", icon: MessageSquare, url: "/employee/chat" },
      { title: "البريد الداخلي", icon: Inbox, url: "/employee/mail" },
    ],
  },
  {
    label: "أدوات التسويق",
    items: [
      { title: "منشئ البوسترات", icon: Image, url: "/employee/posters" },
      { title: "إدارة المحتوى", icon: Globe, url: "/employee/content" },
    ],
  },
  {
    label: "الحضور",
    items: [
      { title: "سجل حضوري", icon: Clock, url: "/employee/attendance" },
      { title: "طلبات الإجازة", icon: CalendarDays, url: "/employee/leave" },
    ],
  },
];

const roleConfig: Record<string, { label: string; badge: string; color: string; dot: string; groups: typeof adminGroups | typeof employeeGroups }> = {
  admin:      { label: "مدير النظام",     badge: "مدير",     color: "from-red-500 to-red-700",     dot: "bg-red-400",    groups: adminGroups },
  manager:    { label: "مدير تنفيذي",    badge: "تنفيذي",   color: "from-violet-500 to-violet-700", dot: "bg-violet-400", groups: adminGroups },
  accountant: { label: "محاسب",           badge: "محاسبة",   color: "from-amber-500 to-amber-700",  dot: "bg-amber-400",  groups: accountantGroups },
  programmer: { label: "مبرمج",           badge: "تقنية",    color: "from-blue-500 to-blue-700",    dot: "bg-blue-400",   groups: programmerGroups },
  sales:      { label: "موظف مبيعات",    badge: "مبيعات",   color: "from-pink-500 to-pink-700",    dot: "bg-pink-400",   groups: salesGroups },
  delivery:   { label: "موظف توصيل",     badge: "توصيل",    color: "from-orange-500 to-orange-700", dot: "bg-orange-400", groups: employeeGroups },
  employee:   { label: "موظف",            badge: "موظف",     color: "from-emerald-500 to-emerald-700", dot: "bg-emerald-400", groups: employeeGroups },
};

export function AppSidebar() {
  const { user, logout } = useAuth() as any;
  const [location, setLocation] = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const config = roleConfig[user?.role] || roleConfig["employee"];
  const groups = config.groups;

  // Close sidebar on mobile after navigation
  const navigate = (url: string) => {
    setLocation(url);
    if (isMobile) setOpenMobile(false);
  };

  const isActive = (url: string) => {
    if (url === "/admin" && location === "/admin") return true;
    if (url === "/employee" && location === "/employee") return true;
    if (url !== "/admin" && url !== "/employee" && location.startsWith(url)) return true;
    return false;
  };

  const initials = user?.name
    ? user.name.trim().split(" ").slice(0, 2).map((w: string) => w[0]).join("")
    : "م";

  return (
    <Sidebar side="right" className="border-l border-border/40 bg-white dark:bg-[#0f1117]">
      {/* ── Header ── */}
      <SidebarHeader className="p-0 border-b border-border/30">
        {/* Logo band */}
        <div className="bg-[#0a2a1a] px-4 pt-5 pb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <img
              src="/images/logo-main.png"
              alt="جمعية طويق"
              className="h-10 w-auto object-contain drop-shadow-md"
            />
            <NotificationBell />
          </div>
          {/* Decorative divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        </div>

        {/* User card */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-l from-primary/5 to-transparent">
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-black text-sm shadow-md shrink-0`}>
            {initials}
          </div>
          {/* Info */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-sm text-foreground truncate leading-tight">{user?.name || "مستخدم"}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
              <span className="text-[11px] text-muted-foreground font-medium">{config.label}</span>
            </div>
          </div>
          {/* Role badge pill */}
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${config.color} text-white shadow-sm shrink-0`}>
            {config.badge}
          </span>
        </div>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className="py-2 scrollbar-thin">
        {groups.map((group, gi) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.15em] px-4 py-1.5">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => navigate(item.url)}
                        className={`
                          w-full justify-start gap-3 rounded-lg mx-1 font-medium text-sm transition-all
                          ${active
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-foreground/70 hover:bg-primary/8 hover:text-primary"}
                        `}
                        tooltip={item.title}
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all
                          ${active ? "bg-white/20" : "bg-muted/60"}`}>
                          <item.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate">{item.title}</span>
                        {active && (
                          <div className="mr-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            {gi < groups.length - 1 && (
              <SidebarSeparator className="my-1.5 opacity-15" />
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="p-3 border-t border-border/30 bg-muted/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate("/")}
              className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/8 rounded-lg font-medium text-sm"
            >
              <div className="w-6 h-6 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                <Home className="h-3.5 w-3.5" />
              </div>
              <span>الموقع الرئيسي</span>
              <ChevronRight className="h-3.5 w-3.5 mr-auto opacity-40" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => { await logout(); navigate("/"); }}
              className="w-full justify-start gap-3 text-destructive/70 hover:text-destructive hover:bg-destructive/8 rounded-lg font-medium text-sm"
            >
              <div className="w-6 h-6 rounded-md bg-destructive/10 flex items-center justify-center shrink-0">
                <LogOut className="h-3.5 w-3.5" />
              </div>
              <span>تسجيل الخروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
