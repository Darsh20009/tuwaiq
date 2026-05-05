import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, BellRing, Check, CheckCheck, Info, AlertTriangle, Package, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const typeIcon: Record<string, any> = {
  attendance: UserCheck,
  stock: Package,
  leave: AlertTriangle,
  info: Info,
};

const typeColor: Record<string, string> = {
  attendance: "text-blue-500",
  stock: "text-orange-500",
  leave: "text-yellow-500",
  info: "text-gray-500",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  const { data: rawNotifications } = useQuery<any>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  // API may return {data: [], total: N} or a plain array
  const notifications: any[] = Array.isArray(rawNotifications)
    ? rawNotifications
    : Array.isArray(rawNotifications?.data)
      ? rawNotifications.data
      : [];

  const markRead = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/mark-all-read"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const unreadCount = notifications.filter(n => !n.readBy?.length).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" data-testid="button-notifications">
          {unreadCount > 0 ? <BellRing className="h-5 w-5 text-primary animate-pulse" /> : <Bell className="h-5 w-5" />}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-2 border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" data-testid="panel-notifications">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-bold text-sm">الإشعارات</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => markAll.mutate()} data-testid="button-mark-all-read">
              <CheckCheck className="h-3.5 w-3.5" />
              تحديد الكل مقروء
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
              <Bell className="h-8 w-8 opacity-30" />
              <p className="text-sm">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n: any) => {
                const Icon = typeIcon[n.type] || Info;
                const isRead = n.readBy?.length > 0;
                return (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors ${!isRead ? "bg-primary/5" : ""}`}
                    onClick={() => !isRead && markRead.mutate(n._id)}
                    data-testid={`notification-item-${n._id}`}
                  >
                    <div className={`mt-0.5 ${typeColor[n.type] || "text-gray-500"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ar })}
                      </p>
                    </div>
                    {!isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
