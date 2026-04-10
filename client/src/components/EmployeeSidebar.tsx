import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, CreditCard, FileUser, Home, LogOut, ClipboardList } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const items = [
  {
    title: "لوحة التحكم",
    url: "/employee",
    icon: LayoutDashboard,
  },
  {
    title: "الحالات الخاصة",
    url: "/employee/cases",
    icon: ClipboardList,
  },
  {
    title: "التحويلات البنكية",
    url: "/employee/transfers",
    icon: CreditCard,
  },
  {
    title: "طلبات التوظيف",
    url: "/employee/applications",
    icon: FileUser,
  },
];

export function EmployeeSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar side="right" className="bg-white dark:bg-card">
      <SidebarHeader className="p-0 border-b">
        <div className="flex items-center gap-3 px-4 py-3" style={{ background: "hsl(152 42% 28%)" }}>
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/30 shrink-0">
            <img src="/images/logo.jpeg" alt="طويق" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-white leading-tight">جمعية طويق</h2>
            <p className="text-[11px] text-white/70 truncate">{user?.name}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-right px-4">لوحة تحكم الموظف</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="flex-row-reverse gap-3 text-right"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex-row-reverse gap-3 text-right"
                >
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>العودة للرئيسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={async () => { await logout(); setLocation("/"); }}
                  className="flex-row-reverse gap-3 text-right text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
