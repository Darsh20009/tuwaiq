import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, TrendingUp, Loader2,
  FileText, UserPlus, CheckCircle2,
  XCircle, Clock, Edit, Trash2, Plus, Mail,
  Heart, HeartHandshake, Activity
} from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

function StatsPanel() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      return res.json();
    }
  });

  const { data: donations } = useQuery({
    queryKey: ['/api/donations'],
    queryFn: async () => {
      const res = await fetch('/api/donations');
      return res.json();
    }
  });

  const recentDonations = donations?.slice(0, 5) || [];

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate bg-white dark:bg-card border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden group relative">
          <div className="h-1.5 w-full bg-blue-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">إجمالي التبرعات</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-blue-600 tracking-tight">{stats?.totalDonations || 0} ر.س</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate bg-white dark:bg-card border-emerald-100 dark:border-emerald-900 shadow-sm overflow-hidden group relative">
          <div className="h-1.5 w-full bg-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">المستفيدين</CardTitle>
            <Heart className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-600 tracking-tight">{stats?.beneficiariesCount || 0}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate bg-white dark:bg-card border-purple-100 dark:border-purple-900 shadow-sm overflow-hidden group relative">
          <div className="h-1.5 w-full bg-purple-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">طلبات التوظيف</CardTitle>
            <UserPlus className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-purple-600 tracking-tight">{stats?.applicationsCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function JobManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [newQuestion, setNewQuestion] = useState("");
  
  const [jobForm, setJobJobForm] = useState({ 
    title: "", 
    department: "", 
    description: "", 
    requirements: "", 
    isActive: true,
    customQuestions: [] as string[]
  });

  const { data: jobs, isLoading } = useQuery<any[]>({
    queryKey: ['/api/jobs'],
  });

  const addMutation = useMutation({
    mutationFn: async (job: any) => {
      const res = await apiRequest("POST", "/api/jobs", job);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تمت العملية بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setShowAddDialog(false);
      setJobJobForm({ title: "", department: "", description: "", requirements: "", isActive: true, customQuestions: [] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (job: any) => {
      await apiRequest("PUT", `/api/jobs/${job.id}`, job);
    },
    onSuccess: () => {
      toast({ title: "تم التحديث بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setEditingJob(null);
    }
  });

  const handleAddQuestion = (isEditing: boolean) => {
    if (!newQuestion.trim()) return;
    if (isEditing) {
      setEditingJob({ ...editingJob, customQuestions: [...(editingJob.customQuestions || []), newQuestion.trim()] });
    } else {
      setJobJobForm({ ...jobForm, customQuestions: [...jobForm.customQuestions, newQuestion.trim()] });
    }
    setNewQuestion("");
  };

  const handleRemoveQuestion = (isEditing: boolean, index: number) => {
    if (isEditing) {
      const qs = [...editingJob.customQuestions];
      qs.splice(index, 1);
      setEditingJob({ ...editingJob, customQuestions: qs });
    } else {
      const qs = [...jobForm.customQuestions];
      qs.splice(index, 1);
      setJobJobForm({ ...jobForm, customQuestions: qs });
    }
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الوظائف</h2>
        <Button onClick={() => setShowAddDialog(true)}><Plus className="ml-2 h-4 w-4" /> إضافة وظيفة</Button>
      </div>

      <div className="grid gap-4">
        {jobs?.map(job => (
          <Card key={job.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.department}</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setEditingJob(job)}><Edit className="h-4 w-4" /></Button>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog || !!editingJob} onOpenChange={(open) => { if(!open) { setShowAddDialog(false); setEditingJob(null); } }}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingJob ? "تعديل وظيفة" : "إضافة وظيفة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-right">
            <Input 
              placeholder="المسمى الوظيفي" 
              value={editingJob ? editingJob.title : jobForm.title} 
              onChange={e => editingJob ? setEditingJob({...editingJob, title: e.target.value}) : setJobJobForm({...jobForm, title: e.target.value})} 
            />
            <Input 
              placeholder="القسم" 
              value={editingJob ? editingJob.department : jobForm.department} 
              onChange={e => editingJob ? setEditingJob({...editingJob, department: e.target.value}) : setJobJobForm({...jobForm, department: e.target.value})} 
            />
            <Textarea 
              placeholder="الوصف" 
              value={editingJob ? editingJob.description : jobForm.description} 
              onChange={e => editingJob ? setEditingJob({...editingJob, description: e.target.value}) : setJobJobForm({...jobForm, description: e.target.value})} 
            />
            
            <div className="border-t pt-4">
              <Label>أسئلة مخصصة</Label>
              <div className="flex gap-2 mt-2">
                <Input value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="أضف سؤالاً..." />
                <Button onClick={() => handleAddQuestion(!!editingJob)}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="mt-2 space-y-2">
                {(editingJob ? editingJob.customQuestions : jobForm.customQuestions)?.map((q: string, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-muted p-2 rounded">
                    <span>{q}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveQuestion(!!editingJob, i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={() => editingJob ? updateMutation.mutate(editingJob) : addMutation.mutate(jobForm)}>حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationManagement() {
  const { data: apps, isLoading } = useQuery<any[]>({
    queryKey: ['/api/job-applications'],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await apiRequest("PATCH", `/api/job-applications/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-applications'] });
      toast({ title: "تم تحديث الحالة" });
    }
  });

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-bold">طلبات التوظيف</h2>
      {apps?.map(app => (
        <Card key={app.id}>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div className="text-right">
                <h3 className="font-bold text-lg">{app.name}</h3>
                <p className="text-primary">{app.jobTitle}</p>
                <p className="text-sm text-muted-foreground">{app.email} | {app.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ id: app.id, status: "approved" })} className={app.status === "approved" ? "bg-green-50" : ""}>قبول</Button>
                <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ id: app.id, status: "rejected" })} className={app.status === "rejected" ? "bg-red-50" : ""}>رفض</Button>
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
              <div>
                <p className="font-bold">الإجابات:</p>
                {app.customAnswers?.map((ans: string, i: number) => <p key={i} className="text-sm">- {ans}</p>)}
              </div>
              <div>
                <p className="font-bold">المرفقات:</p>
                {app.cvUrl ? <a href={app.cvUrl} target="_blank" className="text-blue-600 hover:underline flex items-center"><FileText className="ml-1 h-4 w-4" /> السيرة الذاتية</a> : "لا يوجد"}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-heading text-center">لوحة التحكم</h1>
        
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
            <TabsTrigger value="jobs">الوظائف</TabsTrigger>
            <TabsTrigger value="applications">الطلبات</TabsTrigger>
            <TabsTrigger value="content">المحتوى</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <StatsPanel />
          </TabsContent>

          <TabsContent value="jobs">
            <JobManagement />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationManagement />
          </TabsContent>

          <TabsContent value="content">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>إدارة الصفحات</CardTitle></CardHeader>
                <CardContent>
                  <Button asChild className="w-full"><a href="/admin/content">فتح الإدارة</a></Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>إدارة البريد</CardTitle></CardHeader>
                <CardContent>
                  <Button asChild className="w-full"><a href="/admin/emails">فتح الإدارة</a></Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
