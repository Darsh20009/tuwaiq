import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { FileText, ChevronRight, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Applications() {
  const { data: jobs, isLoading } = useQuery<any[]>({ queryKey: ["/api/jobs"] });

  return (
    <div className="container mx-auto p-6 space-y-8" dir="rtl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/employee" className="hover:text-primary">لوحة التحكم</Link>
        <ChevronRight className="h-4 w-4" />
        <span>طلبات التوظيف</span>
      </div>

      <h1 className="text-3xl font-bold text-primary">إدارة طلبات التوظيف</h1>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">جاري التحميل...</div>
        ) : !jobs || jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              لا توجد طلبات توظيف حالياً
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover-elevate">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">القسم: {job.department}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">عرض الطلبات</Button>
                  <Button variant="secondary" size="sm">تعديل الوظيفة</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
