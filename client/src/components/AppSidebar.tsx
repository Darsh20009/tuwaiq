import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Mail,
  Settings,
  LogOut,
  ChevronLeft,
  DollarSign,
  Activity,
  UserCheck
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const adminItems = [
  { title: "الإحصائيات", icon: LayoutDashboard, url: "/admin" },
  { title: "الوظائف", icon: Briefcase, url: "/admin/jobs" },
  { title: "طلبات التوظيف", icon: FileText, url: "/admin/applications" },
  { title: "إدارة المستخدمين", icon: Users, url: "/admin/users" },
  { title: "المحتوى", icon: Settings, url: "/admin/content" },
  { title: "البريد", icon: Mail, url: "/admin/emails" },
];

const employeeItems = [
  { title: "لوحة التحكم", icon: LayoutDashboard, url: "/employee" },
  { title: "التحويلات البنكية", icon: DollarSign, url: "/employee/transfers" },
  { title: "طلبات التوظيف", icon: FileText, url: "/employee/applications" },
];

export function AppSidebar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const location = window.location.pathname;

  const items = user?.role === "admin" ? adminItems : employeeItems;

  return (
    <Sidebar side="right">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            ج
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">جمعية تكاتف</span>
            <span className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'مدير النظام' : 'موظف'}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    tooltip={item.title}
                  >
                    <a 
                      href={item.url} 
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation(item.url);
                      }}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => logoutMutation.mutate()}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
