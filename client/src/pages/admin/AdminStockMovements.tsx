import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownCircle, ArrowUpCircle, Package, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminStockMovements() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", productName: "", type: "in", quantity: "", reason: "", notes: "" });

  const { data: movements = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/stock-movements"],
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });

  const submit = useMutation({
    mutationFn: () => apiRequest("POST", "/api/stock-movements", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "تم تحديث المخزون بنجاح" });
      setOpen(false);
      setForm({ productId: "", productName: "", type: "in", quantity: "", reason: "", notes: "" });
    },
    onError: (e: any) => toast({ title: e.message || "خطأ", variant: "destructive" }),
  });

  const totalIn = movements.filter(m => m.type === "in").reduce((s, m) => s + (m.quantity || 0), 0);
  const totalOut = movements.filter(m => m.type === "out").reduce((s, m) => s + (m.quantity || 0), 0);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-black">حركة المخزون</h1>
            <p className="text-muted-foreground text-sm">سجل كامل لجميع عمليات الإضافة والسحب</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2" data-testid="button-new-movement">
          <Plus className="h-4 w-4" />
          حركة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 text-center">
            <p className="text-2xl font-black text-primary">{movements.length}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الحركات</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 text-center">
            <p className="text-2xl font-black text-green-600">{totalIn}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الإضافة</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 text-center">
            <p className="text-2xl font-black text-red-600">{totalOut}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي السحب</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 text-center">
            <p className="text-2xl font-black text-blue-600">{products.filter((p: any) => (p.quantity || 0) <= (p.minStock || 5)).length}</p>
            <p className="text-xs text-muted-foreground mt-1">منخفض المخزون</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            سجل الحركات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4">جاري التحميل...</p>
          ) : movements.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد حركات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-right text-muted-foreground text-xs">
                    <th className="pb-3 font-semibold">المنتج</th>
                    <th className="pb-3 font-semibold">النوع</th>
                    <th className="pb-3 font-semibold">الكمية</th>
                    <th className="pb-3 font-semibold">قبل</th>
                    <th className="pb-3 font-semibold">بعد</th>
                    <th className="pb-3 font-semibold">السبب</th>
                    <th className="pb-3 font-semibold">المستخدم</th>
                    <th className="pb-3 font-semibold">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {movements.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/30" data-testid={`movement-row-${i}`}>
                      <td className="py-3 font-medium">{m.productName}</td>
                      <td className="py-3">
                        {m.type === "in" ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300 text-xs gap-1">
                            <ArrowDownCircle className="h-3 w-3" /> إضافة
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-red-300 text-xs gap-1">
                            <ArrowUpCircle className="h-3 w-3" /> سحب
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 font-bold">{m.quantity}</td>
                      <td className="py-3 text-muted-foreground">{m.quantityBefore}</td>
                      <td className="py-3 font-semibold">{m.quantityAfter}</td>
                      <td className="py-3 text-muted-foreground max-w-32 truncate">{m.reason || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{m.userName}</td>
                      <td className="py-3 text-muted-foreground text-xs">{format(new Date(m.createdAt), "dd/MM/yyyy HH:mm")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>تسجيل حركة مخزون</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>المنتج</Label>
              <Select
                value={form.productId}
                onValueChange={v => {
                  const p = products.find((p: any) => p._id === v) as any;
                  setForm(f => ({ ...f, productId: v, productName: p?.name || "" }));
                }}
              >
                <SelectTrigger data-testid="select-product">
                  <SelectValue placeholder="اختر المنتج" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name} (المخزون: {p.quantity || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>نوع الحركة</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger data-testid="select-movement-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">إضافة للمخزون</SelectItem>
                    <SelectItem value="out">سحب من المخزون</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الكمية</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  data-testid="input-quantity"
                />
              </div>
            </div>
            <div>
              <Label>السبب</Label>
              <Input
                placeholder="مثال: استلام شحنة، توزيع على مستفيدين..."
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                data-testid="input-movement-reason"
              />
            </div>
            <div>
              <Label>ملاحظات (اختياري)</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                data-testid="textarea-movement-notes"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button
                onClick={() => submit.mutate()}
                disabled={submit.isPending || !form.productId || !form.quantity}
                data-testid="button-submit-movement"
              >
                {submit.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
