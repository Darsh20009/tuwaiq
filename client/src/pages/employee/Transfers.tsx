import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Clock, CreditCard, Activity, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Transfers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transfers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/bank-transfers"],
    queryFn: async () => {
      const res = await fetch("/api/bank-transfers", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const pending = (Array.isArray(transfers) ? transfers : []).filter((t: any) => t.status === "pending");

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await apiRequest("PATCH", `/api/bank-transfers/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      toast({ title: "تم تحديث حالة التحويل بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء التحديث", variant: "destructive" });
    }
  });

  return (
    <div className="p-6 space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold font-heading">التحويلات البنكية</h1>
            <p className="text-muted-foreground mt-1">مراجعة وتوثيق التحويلات البنكية الواردة</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Activity className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : pending.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center text-muted-foreground space-y-2">
              <CheckCircle className="h-12 w-12 mx-auto opacity-20" />
              <p className="text-lg font-bold">لا توجد تحويلات معلقة حالياً</p>
              <p className="text-sm">لقد قمت بإنجاز جميع المهام المتعلقة بالتحويلات</p>
            </CardContent>
          </Card>
        ) : (
          pending.map((transfer: any) => (
            <Card key={transfer.id || transfer._id} className="hover-elevate overflow-hidden border-amber-100">
              <div className="h-1.5 w-full bg-amber-500/10" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                      <CreditCard className="h-7 w-7 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black">{transfer.donorName || "متبرع فاعل خير"}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xl font-black text-primary">{Number(transfer.amount).toLocaleString()} ر.س</p>
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">بانتظار التأكيد</span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {transfer.donorPhone && <span>📱 {transfer.donorPhone}</span>}
                        {transfer.bankName && <span>🏦 {transfer.bankName}</span>}
                        {transfer.type && <span>📂 {transfer.type}</span>}
                        {transfer.createdAt && <span>📅 {new Date(transfer.createdAt).toLocaleDateString("ar-SA")}</span>}
                      </div>
                      {(transfer.receiptImage || transfer.receiptUrl || transfer.bankTransferPhoto) && (
                        <div className="mt-3">
                          <img
                            src={transfer.receiptImage || transfer.receiptUrl || transfer.bankTransferPhoto}
                            alt="الإيصال"
                            className="max-h-32 rounded-lg border shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[160px]">
                    {(transfer.receiptImage || transfer.receiptUrl || transfer.bankTransferPhoto) && (
                      <Button variant="outline" size="sm" asChild className="gap-1">
                        <a href={transfer.receiptImage || transfer.receiptUrl || transfer.bankTransferPhoto} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          عرض الإيصال
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => updateMutation.mutate({ id: transfer.id || transfer._id?.toString(), status: "approved" })}
                      disabled={updateMutation.isPending}
                    >
                      تأكيد التحويل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateMutation.mutate({ id: transfer.id || transfer._id?.toString(), status: "rejected" })}
                      disabled={updateMutation.isPending}
                    >
                      رفض
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
