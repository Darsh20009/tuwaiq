import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  FileText,
  Mail,
  Settings,
  Briefcase,
  UserCheck,
  Newspaper,
  Image as ImageIcon,
  Heart,
  MessageSquare,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

  const menuItems = [
    { title: "الإحصائيات", icon: LayoutDashboard, tab: "stats" },
    { title: "التبرعات", icon: DollarSign, tab: "donations" },
    { title: "إدارة الأخبار", icon: Newspaper, tab: "news" },
    { title: "التحكم في الصفحات", icon: FileText, tab: "pages" },
    { title: "إدارة المحتوى", icon: ImageIcon, tab: "content" },
    { title: "التحويلات البنكية", icon: CreditCard, tab: "bank-transfers" },
    { title: "إدارة الوظائف", icon: Briefcase, tab: "jobs" },
    { title: "طلبات التوظيف", icon: UserCheck, tab: "job-applications" },
    { title: "إدارة المستخدمين", icon: Users, tab: "users" },
    { title: "البريد الإلكتروني", icon: Mail, tab: "emails" },
    { title: "الإعدادات", icon: Settings, tab: "settings" },
  ];

import { CreditCard } from "lucide-react";

export function AdminSidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sidebar side="right">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-sm">لوحة الإدارة</h2>
            <p className="text-xs text-muted-foreground">{user?.name}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-[#1c1d21] text-[#e6e9ed]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70 font-bold px-4">القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.tab} className="mb-1">
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.tab)}
                    isActive={activeTab === item.tab}
                    className="w-full justify-start gap-3 rounded-xl transition-all data-[active=true]:bg-primary data-[active=true]:text-white hover:bg-white/5"
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.tab ? 'text-white' : 'text-primary'}`} />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
