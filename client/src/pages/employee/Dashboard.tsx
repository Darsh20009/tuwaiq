import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { CheckCircle, Clock, FileText, UserCheck } from "lucide-react";
import { Link } from "wouter";

export default function EmployeeDashboard() {
  const { data: donations } = useQuery({ queryKey: ["/api/donations"] });
  const { data: jobs } = useQuery({ queryKey: ["/api/jobs"] });

  const pendingTransfers = donations?.filter((d: any) => d.paymentMethod === "bank_transfer" && d.status === "pending") || [];
  
  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8" dir="rtl">
        <h1 className="text-3xl font-bold text-primary">لوحة تحكم الموظف</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">تحويلات قيد الانتظار</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTransfers.length}</div>
              <Link href="/employee/transfers" className="text-xs text-primary hover:underline">عرض التفاصيل</Link>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">طلبات التوظيف</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs?.length || 0}</div>
              <Link href="/employee/applications" className="text-xs text-primary hover:underline">إدارة الطلبات</Link>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المهام المكتملة</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">تحديث يومي</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المتطوعين النشطين</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">قيد المراجعة</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
