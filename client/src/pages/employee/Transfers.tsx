import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, FileText, UserCheck, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Transfers() {
  const { data: donations, isLoading } = useQuery<any[]>({ queryKey: ["/api/donations"] });

  const transfers = donations?.filter((d: any) => d.paymentMethod === "bank_transfer" && d.status === "pending") || [];

  return (
    <div className="container mx-auto p-6 space-y-8" dir="rtl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/employee" className="hover:text-primary">لوحة التحكم</Link>
        <ChevronRight className="h-4 w-4" />
        <span>التحويلات البنكية</span>
      </div>

      <h1 className="text-3xl font-bold text-primary">مراجعة التحويلات البنكية</h1>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">جاري التحميل...</div>
        ) : transfers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              لا توجد تحويلات معلقة حالياً
            </CardContent>
          </Card>
        ) : (
          transfers.map((transfer) => (
            <Card key={transfer.id} className="hover-elevate">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{transfer.donorName || "متبرع فاعل خير"}</h3>
                    <p className="text-sm text-muted-foreground">المبلغ: {transfer.amount} ريال</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">عرض الصورة</Button>
                  <Button size="sm">تأكيد</Button>
                  <Button variant="destructive" size="sm">رفض</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
