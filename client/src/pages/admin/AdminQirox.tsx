import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Loader2, ExternalLink, ShoppingCart, FolderOpen, FileText,
  Wallet, Users, TrendingUp, CheckCircle2, Clock, AlertCircle,
  Activity, RefreshCw, User, Mail, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const SAR = (n: number) =>
  `${Number(n || 0).toLocaleString("en-SA", { maximumFractionDigits: 0 })} ر.س`;

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-bold mb-1">{label}</p>
            <p className="text-2xl font-black">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    paid:       { label: "مدفوع",    variant: "default" },
    pending:    { label: "معلق",     variant: "secondary" },
    active:     { label: "نشط",      variant: "default" },
    completed:  { label: "مكتمل",    variant: "default" },
    cancelled:  { label: "ملغي",     variant: "destructive" },
    draft:      { label: "مسودة",    variant: "outline" },
  };
  const cfg = map[status?.toLowerCase()] || { label: status, variant: "outline" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export default function AdminQirox() {
  const qc = useQueryClient();

  const { data: me, isLoading: meLoading } = useQuery<any>({
    queryKey: ["/api/qirox/me"],
  });
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/qirox/stats"],
  });
  const { data: wallet, isLoading: walletLoading } = useQuery<any>({
    queryKey: ["/api/qirox/wallet"],
  });
  const { data: orders, isLoading: ordersLoading } = useQuery<any>({
    queryKey: ["/api/qirox/orders"],
  });
  const { data: projects, isLoading: projectsLoading } = useQuery<any>({
    queryKey: ["/api/qirox/projects"],
  });
  const { data: invoices, isLoading: invoicesLoading } = useQuery<any>({
    queryKey: ["/api/qirox/invoices"],
  });
  const { data: customers, isLoading: customersLoading } = useQuery<any>({
    queryKey: ["/api/qirox/customers"],
  });

  const isLoading = meLoading || statsLoading || walletLoading || ordersLoading || projectsLoading || invoicesLoading || customersLoading;

  const refresh = () => {
    ["/api/qirox/me", "/api/qirox/stats", "/api/qirox/wallet",
     "/api/qirox/orders", "/api/qirox/projects", "/api/qirox/invoices", "/api/qirox/customers"
    ].forEach(k => qc.invalidateQueries({ queryKey: [k] }));
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black">لوحة Qirox</h1>
              <p className="text-xs text-muted-foreground">ربط مع منصة qiroxstudio.online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {me && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-full">
              <User className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-xs font-bold text-violet-700">{me.fullName || me.username}</span>
              <Badge variant="secondary" className="text-xs py-0">{me.subscriptionStatus}</Badge>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <a href="https://qiroxstudio.online" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              فتح المنصة
            </Button>
          </a>
        </div>
      </div>

      {/* Account Info */}
      {meLoading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : me && (
        <Card className="border-0 shadow-sm bg-gradient-to-l from-violet-600 to-purple-700 text-white">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-lg">{me.fullName || me.username}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Mail className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-sm text-white/80">{me.email}</span>
                </div>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs text-white/60 mb-1">الصلاحيات</p>
                <div className="flex flex-wrap gap-1">
                  {(me.scopes || []).map((s: string) => (
                    <span key={s} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-4">
                <div className="h-16 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={ShoppingCart} label="إجمالي الطلبات" value={stats.orders?.total ?? 0} color="bg-blue-500" />
          <StatCard icon={FolderOpen} label="المشاريع النشطة" value={stats.projects?.active ?? 0} color="bg-emerald-500" />
          <StatCard icon={FileText} label="الفواتير المدفوعة" value={stats.invoices?.paid ?? 0} sub={`من ${stats.invoices?.total ?? 0} إجمالاً`} color="bg-violet-500" />
          <StatCard icon={TrendingUp} label="إجمالي الإيرادات" value={SAR(stats.invoices?.totalRevenue ?? 0)} color="bg-amber-500" />
        </div>
      )}

      {/* Wallet */}
      {!walletLoading && wallet && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              المحفظة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-6 py-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">الرصيد الحالي</p>
                <p className="text-3xl font-black text-emerald-700">{SAR(wallet.balance ?? 0)}</p>
              </div>
            </div>
            {wallet.transactions?.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground mb-2">آخر المعاملات</p>
                {wallet.transactions.slice(0, 5).map((tx: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0 ? "bg-emerald-100" : "bg-rose-100"}`}>
                        <TrendingUp className={`w-4 h-4 ${tx.amount > 0 ? "text-emerald-600" : "text-rose-500 rotate-180"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{tx.description || "معاملة"}</p>
                        <p className="text-xs text-muted-foreground">{tx.date ? new Date(tx.date).toLocaleDateString("ar-SA") : ""}</p>
                      </div>
                    </div>
                    <span className={`font-black ${tx.amount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {tx.amount > 0 ? "+" : ""}{SAR(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد معاملات بعد</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Orders & Projects */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              الطلبات
              {orders && <Badge variant="secondary" className="mr-auto text-xs">{orders.total ?? 0}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : orders?.data?.length > 0 ? (
              <div className="space-y-2">
                {orders.data.slice(0, 6).map((order: any, i: number) => (
                  <div key={order._id || i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-sm font-bold">{order.title || order.name || `طلب #${i + 1}`}</p>
                      <p className="text-xs text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-SA") : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.amount && <span className="text-sm font-bold">{SAR(order.amount)}</span>}
                      {order.status && <StatusBadge status={order.status} />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد طلبات بعد</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-emerald-600" />
              المشاريع
              {projects && <Badge variant="secondary" className="mr-auto text-xs">{projects.total ?? 0}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : projects?.data?.length > 0 ? (
              <div className="space-y-2">
                {projects.data.slice(0, 6).map((proj: any, i: number) => (
                  <div key={proj._id || i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-sm font-bold">{proj.title || proj.name || `مشروع #${i + 1}`}</p>
                      <p className="text-xs text-muted-foreground">{proj.client || proj.customer || ""}</p>
                    </div>
                    {proj.status && <StatusBadge status={proj.status} />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد مشاريع بعد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-600" />
            الفواتير
            {invoices && <Badge variant="secondary" className="mr-auto text-xs">{invoices.total ?? 0}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : invoices?.data?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-right py-2 font-bold">رقم الفاتورة</th>
                    <th className="text-right py-2 font-bold">العميل</th>
                    <th className="text-right py-2 font-bold">المبلغ</th>
                    <th className="text-right py-2 font-bold">التاريخ</th>
                    <th className="text-right py-2 font-bold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.data.slice(0, 8).map((inv: any, i: number) => (
                    <tr key={inv._id || i} className="border-b border-muted/50 hover:bg-muted/20">
                      <td className="py-2.5 font-mono text-xs">{inv.number || inv._id?.slice(-6)}</td>
                      <td className="py-2.5">{inv.client || inv.customer || "—"}</td>
                      <td className="py-2.5 font-bold">{SAR(inv.amount || inv.total || 0)}</td>
                      <td className="py-2.5 text-muted-foreground">{inv.date || inv.createdAt ? new Date(inv.date || inv.createdAt).toLocaleDateString("ar-SA") : "—"}</td>
                      <td className="py-2.5">{inv.status ? <StatusBadge status={inv.status} /> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد فواتير بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customers */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            العملاء
            {customers && <Badge variant="secondary" className="mr-auto text-xs">{customers.total ?? 0}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customersLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : customers?.data?.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {customers.data.slice(0, 8).map((cust: any, i: number) => (
                <div key={cust._id || i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{cust.name || cust.fullName || "عميل"}</p>
                    <p className="text-xs text-muted-foreground truncate">{cust.email || ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا يوجد عملاء بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
