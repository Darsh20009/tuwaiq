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
  { title: "لوحة التحكم", icon: LayoutDashboard, url: "/admin", tab: "stats" },
  { title: "التبرعات", icon: DollarSign, url: "/admin", tab: "donations" },
  { title: "المستفيدين", icon: Heart, url: "/admin", tab: "beneficiaries" },
  { title: "الوظائف", icon: Briefcase, url: "/admin", tab: "jobs" },
  { title: "طلبات التوظيف", icon: UserCheck, url: "/admin", tab: "job-applications" },
  { title: "الأخبار", icon: Newspaper, url: "/admin", tab: "news" },
  { title: "الصور", icon: ImageIcon, url: "/admin", tab: "gallery" },
  { title: "الرسائل", icon: Mail, url: "/admin", tab: "emails" },
  { title: "المستخدمين", icon: Users, url: "/admin", tab: "users" },
  { title: "الإعدادات", icon: Settings, url: "/admin", tab: "settings" },
];

export function AdminSidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.tab}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.tab)}
                    isActive={activeTab === item.tab}
                    className="w-full justify-start gap-3"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
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
