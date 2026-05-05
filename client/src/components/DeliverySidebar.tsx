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
import { LayoutDashboard, Truck, Home, LogOut, Package } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const items = [
  { title: "لوحة التحكم", url: "/delivery", icon: LayoutDashboard },
  { title: "طلبات التوصيل", url: "/delivery/orders", icon: Truck },
];

export function DeliverySidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (url: string) => {
    if (url === "/delivery" && location === "/delivery") return true;
    if (url !== "/delivery" && location.startsWith(url)) return true;
    return false;
  };

  return (
    <Sidebar side="right" className="border-l border-border/50 bg-white dark:bg-card">
      <SidebarHeader className="p-0 border-b border-border/50">
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
          <SidebarGroupLabel className="text-primary/70 font-bold px-4 text-right">القائمة</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url} className="mb-1">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="flex-row-reverse gap-3 text-right rounded-xl transition-all data-[active=true]:bg-primary data-[active=true]:text-white"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t space-y-1">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-3 text-sm" size="sm">
            <Home className="w-4 h-4" />
            <span>الموقع الرئيسي</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 text-sm"
          size="sm"
          onClick={async () => { await logout(); setLocation("/"); }}
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
