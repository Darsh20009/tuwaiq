import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { FileText, User, Activity, Briefcase, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export default function Applications() {
  const { data: applications, isLoading } = useQuery<any[]>({ queryKey: ["/api/job-applications"] });

  return (
    <div className="p-6 space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold font-heading">طلبات التوظيف</h1>
            <p className="text-muted-foreground mt-1">مراجعة طلبات الانضمام للفريق</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Activity className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !applications || applications.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center text-muted-foreground space-y-2">
              <FileText className="h-12 w-12 mx-auto opacity-20" />
              <p className="text-lg font-bold">لا توجد طلبات توظيف حالياً</p>
            </CardContent>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id} className="hover-elevate overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black">{app.name}</h3>
                          <p className="text-primary font-bold flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {app.jobTitle}
                          </p>
                        </div>
                      </div>
                      <Badge variant={app.status === 'pending' ? 'secondary' : 'default'} className="font-bold">
                        {app.status === 'pending' ? 'جديد' : app.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" /> {app.email}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" /> {app.phone}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" /> {new Date(app.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-6 md:w-64 border-r flex flex-col justify-center gap-3">
                    {app.cvUrl && (
                      <Button variant="outline" className="w-full font-bold" asChild>
                        <a href={app.cvUrl} target="_blank">
                          <FileText className="ml-2 h-4 w-4" /> عرض السيرة الذاتية
                        </a>
                      </Button>
                    )}
                    <Button className="w-full font-bold">تحديد موعد مقابلة</Button>
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
