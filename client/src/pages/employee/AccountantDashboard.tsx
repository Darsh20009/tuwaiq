import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2, Calculator, TrendingUp, TrendingDown, DollarSign, CreditCard, CheckCircle2, Clock, XCircle, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AccountantDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transfers = [], isLoading: loadingT } = useQuery<any[]>({
    queryKey: ["/api/bank-transfers"],
  });

  const { data: donations = [], isLoading: loadingD } = useQuery<any[]>({
    queryKey: ["/api/donations"],
    queryFn: async () => {
      const res = await fetch("/api/donations", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : (json?.donations ?? []);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/bank-transfers/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-transfers"] });
      toast({ title: "✓ تم تحديث التحويل" });
    },
  });

  const pendingTransfers = (transfers as any[]).filter(t => t.status === "pending");
  const approvedTransfers = (transfers as any[]).filter(t => t.status === "approved");
  const totalIn = (donations as any[])
    .filter(d => d.status === "confirmed")
    .reduce((sum, d) => sum + parseFloat(d.amount || "0"), 0);
  const pendingAmount = pendingTransfers.reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

  const stats = [
    { label: "إجمالي المتحصلات", value: `${totalIn.toLocaleString("ar-SA")} ر.س`, icon: TrendingUp, color: "text-green-600 bg-green-50", border: "border-green-200" },
    { label: "تحويلات معلقة", value: `${pendingAmount.toLocaleString("ar-SA")} ر.س`, icon: Clock, color: "text-amber-600 bg-amber-50", border: "border-amber-200" },
    { label: "تحويلات مؤكدة", value: approvedTransfers.length, icon: CheckCircle2, color: "text-blue-600 bg-blue-50", border: "border-blue-200" },
    { label: "إجمالي التبرعات", value: (donations as any[]).length, icon: DollarSign, color: "text-primary bg-primary/5", border: "border-primary/20" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <Calculator className="h-6 w-6 text-amber-600" />
        <div>
          <h1 className="text-xl font-black">لوحة المحاسب — ERP مالي</h1>
          <p className="text-xs text-muted-foreground">إدارة المعاملات المالية والتحويلات</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`border ${stat.border} overflow-hidden`}>
              <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/50" />
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending transfers */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              تحويلات بنكية معلقة
              <Badge variant="secondary" className="mr-auto">{pendingTransfers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingT ? (
              <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
            ) : pendingTransfers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">لا توجد تحويلات معلقة</div>
            ) : (
              <div className="divide-y divide-border/50">
                {pendingTransfers.slice(0, 8).map((t: any) => (
                  <div key={t.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{t.donorName || "متبرع"}</p>
                        <p className="text-xs text-muted-foreground">{t.bankName} — {new Date(t.createdAt).toLocaleDateString("ar-SA")}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-amber-600">{parseFloat(t.amount).toLocaleString("ar-SA")} ر.س</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 px-2"
                          onClick={() => approveMutation.mutate({ id: t.id, status: "approved" })}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 text-xs px-2"
                          onClick={() => approveMutation.mutate({ id: t.id, status: "rejected" })}
                          disabled={approveMutation.isPending}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {t.photoUrl && (
                      <div className="mt-2">
                        <a href={t.photoUrl} target="_blank" className="text-xs text-primary hover:underline">📄 عرض إيصال التحويل</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent confirmed donations */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              آخر التبرعات المؤكدة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingD ? (
              <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
            ) : (
              <div className="divide-y divide-border/50">
                {(donations as any[]).filter(d => d.status === "confirmed").slice(0, 8).map((d: any) => (
                  <div key={d.id} className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{d.donorName || "متبرع"}</p>
                        <p className="text-xs text-muted-foreground">{d.type} — {new Date(d.createdAt).toLocaleDateString("ar-SA")}</p>
                      </div>
                    </div>
                    <p className="font-black text-green-600 text-sm">{parseFloat(d.amount).toLocaleString("ar-SA")} ر.س</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            ملخص المعاملات المالية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="p-3 text-right font-bold text-muted-foreground">النوع</th>
                  <th className="p-3 text-right font-bold text-muted-foreground">العدد</th>
                  <th className="p-3 text-right font-bold text-muted-foreground">الإجمالي</th>
                  <th className="p-3 text-right font-bold text-muted-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr className="hover:bg-muted/20">
                  <td className="p-3 font-medium">تبرعات مؤكدة</td>
                  <td className="p-3">{(donations as any[]).filter(d => d.status === "confirmed").length}</td>
                  <td className="p-3 font-bold text-green-600">{totalIn.toLocaleString("ar-SA")} ر.س</td>
                  <td className="p-3"><Badge className="bg-green-100 text-green-700 text-[10px]">مؤكدة</Badge></td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="p-3 font-medium">تحويلات بنكية معلقة</td>
                  <td className="p-3">{pendingTransfers.length}</td>
                  <td className="p-3 font-bold text-amber-600">{pendingAmount.toLocaleString("ar-SA")} ر.س</td>
                  <td className="p-3"><Badge className="bg-amber-100 text-amber-700 text-[10px]">قيد المراجعة</Badge></td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="p-3 font-medium">تحويلات مؤكدة</td>
                  <td className="p-3">{approvedTransfers.length}</td>
                  <td className="p-3 font-bold text-blue-600">
                    {approvedTransfers.reduce((s, t) => s + parseFloat(t.amount || "0"), 0).toLocaleString("ar-SA")} ر.س
                  </td>
                  <td className="p-3"><Badge className="bg-blue-100 text-blue-700 text-[10px]">مؤكدة</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
