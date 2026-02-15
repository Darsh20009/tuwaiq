import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Clock, CreditCard, ChevronRight, Activity, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Transfers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: donations, isLoading } = useQuery<any[]>({ queryKey: ["/api/donations"] });

  const transfers = donations?.filter((d: any) => d.paymentMethod === "bank_transfer" && d.status === "pending") || [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      // Find the transfer in bank_transfers collection too if needed, 
      // but the donation table is the source of truth for display here
      await apiRequest("PATCH", `/api/bank-transfers/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      toast({ title: "تم تحديث حالة التحويل بنجاح" });
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
        ) : transfers.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center text-muted-foreground space-y-2">
              <CheckCircle className="h-12 w-12 mx-auto opacity-20" />
              <p className="text-lg font-bold">لا توجد تحويلات معلقة حالياً</p>
              <p className="text-sm">لقد قمت بإنجاز جميع المهام المتعلقة بالتحويلات</p>
            </CardContent>
          </Card>
        ) : (
          transfers.map((transfer) => (
            <Card key={transfer.id} className="hover-elevate overflow-hidden border-amber-100">
              <div className="h-1.5 w-full bg-amber-500/10" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                      <CreditCard className="h-7 w-7 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black">{transfer.donorName || "متبرع فاعل خير"}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xl font-black text-primary">{transfer.amount} ر.س</p>
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">بانتظار التأكيد</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {transfer.bankTransferPhoto && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={transfer.bankTransferPhoto} target="_blank">عرض الإيصال</a>
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => updateMutation.mutate({ id: transfer.id, status: "approved" })}
                    >
                      تأكيد التحويل
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => updateMutation.mutate({ id: transfer.id, status: "rejected" })}
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
