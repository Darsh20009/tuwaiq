import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Truck, Clock, CheckCircle, XCircle, Package, ArrowUpRight, MapPin } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: "معلق",      color: "bg-amber-100 text-amber-700" },
  assigned:   { label: "مُعيَّن",   color: "bg-blue-100 text-blue-700" },
  in_transit: { label: "في الطريق", color: "bg-purple-100 text-purple-700" },
  delivered:  { label: "تم التسليم",color: "bg-emerald-100 text-emerald-700" },
  failed:     { label: "فشل",       color: "bg-red-100 text-red-700" },
  returned:   { label: "مُعاد",    color: "bg-gray-100 text-gray-700" },
};

export default function DeliveryDashboard() {
  const { user } = useAuth() as any;

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/delivery-orders"],
    queryFn: async () => {
      const res = await fetch("/api/delivery-orders", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const pending = orders.filter((o: any) => ["pending", "assigned", "in_transit"].includes(o.status));
  const delivered = orders.filter((o: any) => o.status === "delivered");
  const failed = orders.filter((o: any) => o.status === "failed" || o.status === "returned");
  const today = orders.filter((o: any) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="p-6 space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">لوحة مندوب التوصيل</h1>
            <p className="text-muted-foreground text-sm">مرحباً، {user?.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-l from-primary/5 to-primary/10 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-xl font-black text-primary mb-1">مهامك اليوم</h2>
          <p className="text-muted-foreground">لديك <span className="font-bold text-primary">{pending.length}</span> طلب توصيل نشط في انتظارك</p>
        </div>
        <Truck className="w-24 h-24 text-primary/10 absolute -left-4 -top-4 rotate-12" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-amber-100">
          <div className="h-1 bg-amber-500" />
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs"><Clock className="w-3 h-3" />قيد التنفيذ</div>
            <p className="text-3xl font-black text-amber-600" data-testid="stat-pending">{pending.length}</p>
            <Link href="/delivery/orders" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">عرض <ArrowUpRight className="w-3 h-3" /></Link>
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <div className="h-1 bg-emerald-500" />
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs"><CheckCircle className="w-3 h-3" />تم التسليم</div>
            <p className="text-3xl font-black text-emerald-600" data-testid="stat-delivered">{delivered.length}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100">
          <div className="h-1 bg-blue-500" />
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs"><Package className="w-3 h-3" />طلبيات اليوم</div>
            <p className="text-3xl font-black text-blue-600" data-testid="stat-today">{today.length}</p>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <div className="h-1 bg-red-500" />
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs"><XCircle className="w-3 h-3" />غير مكتملة</div>
            <p className="text-3xl font-black text-red-600" data-testid="stat-failed">{failed.length}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-primary" />الطلبات النشطة</h2>
        {pending.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center space-y-2">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-400" />
              <p className="font-bold text-muted-foreground">لا توجد طلبات نشطة الآن</p>
              <p className="text-sm text-muted-foreground">كل الطلبات تمت بنجاح!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map((o: any) => {
              const info = STATUS_MAP[o.status] || STATUS_MAP.pending;
              return (
                <Card key={o.id} className="hover:shadow-sm transition-shadow" data-testid={`card-active-order-${o.id}`}>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${info.color}`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{o.beneficiaryName}</p>
                        {o.beneficiaryAddress && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{o.beneficiaryAddress}
                          </p>
                        )}
                        {o.items && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Package className="w-3 h-3" />{o.items}</p>}
                      </div>
                    </div>
                    <Badge className={`text-xs shrink-0 ${info.color}`}>{info.label}</Badge>
                  </CardContent>
                </Card>
              );
            })}
            {pending.length > 5 && (
              <Link href="/delivery/orders">
                <Card className="border-dashed cursor-pointer hover:bg-muted/30 transition-colors">
                  <CardContent className="p-3 text-center text-sm text-primary font-bold">عرض كل الطلبات ({pending.length})</CardContent>
                </Card>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
