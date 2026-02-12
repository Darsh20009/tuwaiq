import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, CreditCard, FileUser, Home, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const items = [
  {
    title: "لوحة التحكم",
    url: "/employee",
    icon: LayoutDashboard,
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
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  return (
    <Sidebar right>
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
                  onClick={() => logoutMutation.mutate()}
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
