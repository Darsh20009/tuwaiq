import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, Users, Building, DollarSign, Percent, TrendingUp, Loader2,
  FileText, UserPlus, Truck, MessageSquare, Building2, CheckCircle2,
  XCircle, Clock, Edit, Trash2, Eye, Plus, RefreshCw, Image, Upload, Mail,
  Heart, HeartHandshake, LayoutDashboard, Activity
} from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

function StatsPanel() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      return res.json();
    }
  });

  const { data: donations } = useQuery({
    queryKey: ['/api/donations'],
    queryFn: async () => {
      const res = await fetch('/api/donations', { credentials: 'include' });
      return res.json();
    }
  });

  const recentDonations = donations?.slice(0, 5) || [];

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate bg-white dark:bg-card border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden group">
          <div className="h-1 w-full bg-blue-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">إجمالي التبرعات</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">{stats?.totalDonations || 0} ر.س</div>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-100">+12%</Badge>
              <span className="text-[10px] text-muted-foreground">نمو هذا الشهر</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate bg-white dark:bg-card border-emerald-100 dark:border-emerald-900 shadow-sm overflow-hidden group">
          <div className="h-1 w-full bg-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">المستفيدين</CardTitle>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <Heart className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">{stats?.beneficiariesCount || 0}</div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>حالات مكتملة الدعم</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate bg-white dark:bg-card border-purple-100 dark:border-purple-900 shadow-sm overflow-hidden group">
          <div className="h-1 w-full bg-purple-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">طلبات التوظيف</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <UserPlus className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-purple-600">{stats?.applicationsCount || 0}</div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3 text-purple-500" />
              <span>بانتظار المراجعة</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate bg-white dark:bg-card border-amber-100 dark:border-amber-900 shadow-sm overflow-hidden group">
          <div className="h-1 w-full bg-amber-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">نسبة الإنجاز</CardTitle>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600">84%</div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3">
              <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: '84%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b bg-muted/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              آخر التبرعات
            </CardTitle>
            <CardDescription>عرض أحدث العمليات المالية المستلمة</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentDonations.length > 0 ? (
              <div className="divide-y">
                {recentDonations.map((donation: any) => (
                  <div key={donation.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                        <HeartHandshake className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{donation.donorName || "متبرع فاعل خير"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(donation.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-blue-600">{donation.amount} ر.س</p>
                      <Badge variant="secondary" className="text-[10px] py-0">{donation.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center opacity-20">
                  <DollarSign className="w-8 h-8" />
                </div>
                <p>لا توجد تبرعات حديثة</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b bg-muted/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              نشاطات قادمة
            </CardTitle>
            <CardDescription>الفعاليات والبرامج المجدولة</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex items-center justify-center min-h-[300px]">
            <div className="text-center text-muted-foreground p-8">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center opacity-20">
                <Clock className="w-8 h-8" />
              </div>
              <p>لا توجد فعاليات مجدولة</p>
              <Button variant="outline" size="sm" className="mt-4">إضافة فعالية</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContentManagement({ filter }: { filter?: "news" | "pages" }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingContent, setEditingContent] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newContent, setNewContent] = useState({ 
    slug: filter === "news" ? "news-" : "", 
    title: "", 
    content: "", 
    imageUrl: "" 
  });
  
  const { data: contents, isLoading } = useQuery({
    queryKey: ['/api/admin/content'],
    queryFn: async () => {
      const res = await fetch('/api/admin/content', { credentials: 'include' });
      return res.json();
    }
  });

  const filteredContents = contents?.filter((c: any) => {
    if (filter === "news") return c.slug.startsWith("news-");
    if (filter === "pages") return !c.slug.startsWith("news-");
    return true;
  });

  const updateMutation = useMutation({
    mutationFn: async (content: any) => {
      await apiRequest("PUT", `/api/admin/content/${content.slug}`, content);
    },
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث المحتوى بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setEditingContent(null);
    }
  });

  const addMutation = useMutation({
    mutationFn: async (content: any) => {
      await apiRequest("POST", "/api/admin/content", content);
    },
    onSuccess: () => {
      toast({ title: "تمت الإضافة", description: "تم إضافة المحتوى بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setShowAddDialog(false);
      setNewContent({ 
        slug: filter === "news" ? "news-" : "", 
        title: "", 
        content: "", 
        imageUrl: "" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      await apiRequest("DELETE", `/api/admin/content/${slug}`);
    },
    onSuccess: () => {
      toast({ title: "تم الحذف", description: "تم حذف المحتوى بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
    }
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-primary/10">
        <div>
          <h3 className="text-xl font-black text-primary">
            {filter === "news" ? "إدارة الأخبار" : "التحكم في الصفحات"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {filter === "news" ? "تعديل وإضافة أخبار الجمعية" : "تعديل محتوى صفحات الموقع"}
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-brand shadow-md hover:scale-105 transition-transform">
          <Plus className="w-4 h-4 ml-2" />
          {filter === "news" ? "إضافة خبر جديد" : "إضافة صفحة جديدة"}
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {filteredContents?.map((content: any) => (
          <Card key={content.slug} className="group hover:shadow-md transition-all border-primary/5 overflow-hidden">
            <div className="flex">
              {content.imageUrl && (
                <div className="w-24 sm:w-32 h-auto overflow-hidden shrink-0 bg-muted">
                  <img src={content.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[10px] font-mono">{content.slug}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary" onClick={() => setEditingContent(content)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive" onClick={() => deleteMutation.mutate(content.slug)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-bold line-clamp-1">{content.title}</p>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-1 opacity-70" dangerouslySetInnerHTML={{ __html: content.content }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة محتوى جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>المعرف (Slug) - ابدأ بـ news- للأخبار</Label>
              <Input 
                value={newContent.slug} 
                onChange={e => setNewContent({...newContent, slug: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input 
                value={newContent.title} 
                onChange={e => setNewContent({...newContent, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>رابط الصورة</Label>
              <Input 
                value={newContent.imageUrl} 
                onChange={e => setNewContent({...newContent, imageUrl: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>المحتوى (HTML)</Label>
              <Textarea 
                className="min-h-[200px]"
                value={newContent.content} 
                onChange={e => setNewContent({...newContent, content: e.target.value})}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => addMutation.mutate(newContent)}
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "إضافة الآن"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل: {editingContent?.slug}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input 
                value={editingContent?.title || ""} 
                onChange={e => setEditingContent({...editingContent, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>رابط الصورة</Label>
              <Input 
                value={editingContent?.imageUrl || ""} 
                onChange={e => setEditingContent({...editingContent, imageUrl: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>المحتوى (HTML)</Label>
              <Textarea 
                className="min-h-[300px]"
                value={editingContent?.content || ""} 
                onChange={e => setEditingContent({...editingContent, content: e.target.value})}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => updateMutation.mutate(editingContent)}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "حفظ التعديلات"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmailPanel() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const sendEmailMutation = useMutation({
    mutationFn: async (data: { to: string; subject: string; message: string }) => {
      await apiRequest("POST", "/api/admin/send-email", data);
    },
    onSuccess: () => {
      toast({
        title: "تم الإرسال",
        description: "تم إرسال البريد الإلكتروني بنجاح",
      });
      setTo("");
      setSubject("");
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "فشل الإرسال",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            إرسال بريد إلكتروني
          </CardTitle>
          <CardDescription>إرسال رسائل بريدية للعملاء والمستفيدين</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>إلى (البريد الإلكتروني)</Label>
            <Input 
              placeholder="example@mail.com" 
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>الموضوع</Label>
            <Input 
              placeholder="موضوع الرسالة" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>الرسالة</Label>
            <Textarea 
              placeholder="اكتب رسالتك هنا..." 
              className="min-h-[200px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button 
            className="w-full bg-gradient-brand" 
            onClick={() => sendEmailMutation.mutate({ to, subject, message })}
            disabled={sendEmailMutation.isPending || !to || !subject || !message}
          >
            {sendEmailMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "إرسال الآن"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function JobManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newJob, setNewJob] = useState({ 
    title: "", 
    titleEn: "", 
    department: "", 
    departmentEn: "", 
    description: "", 
    descriptionEn: "", 
    requirements: "", 
    requirementsEn: "",
    isActive: true 
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs', { credentials: 'include' });
      return res.json();
    }
  });

  const addMutation = useMutation({
    mutationFn: async (job: any) => {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تمت العملية", description: "تم حفظ الوظيفة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setShowAddDialog(false);
      setEditingJob(null);
      setNewJob({ title: "", titleEn: "", department: "", departmentEn: "", description: "", descriptionEn: "", requirements: "", requirementsEn: "", isActive: true });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (job: any) => {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث الوظيفة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setEditingJob(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      toast({ title: "تم الحذف", description: "تم حذف الوظيفة" });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    }
  });

  const handleSubmit = () => {
    if (editingJob) {
      updateMutation.mutate({ ...newJob, id: editingJob.id });
    } else {
      addMutation.mutate(newJob);
    }
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setNewJob({
      title: job.title || "",
      titleEn: job.titleEn || "",
      department: job.department || "",
      departmentEn: job.departmentEn || "",
      description: job.description || "",
      descriptionEn: job.descriptionEn || "",
      requirements: job.requirements || "",
      requirementsEn: job.requirementsEn || "",
      isActive: job.isActive ?? true
    });
    setShowAddDialog(true);
  };

  const filteredJobs = jobs?.filter((job: any) => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "active" && job.isActive) ||
                          (filterStatus === "inactive" && !job.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold">إدارة الوظائف</h3>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setEditingJob(null);
            setNewJob({ title: "", titleEn: "", department: "", departmentEn: "", description: "", descriptionEn: "", requirements: "", requirementsEn: "", isActive: true });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-brand">
              <Plus className="w-4 h-4 ml-2" />
              إضافة وظيفة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingJob ? "تعديل وظيفة" : "إضافة وظيفة جديدة"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1">
              <div className="space-y-2">
                <Label>المسمى الوظيفي (عربي)</Label>
                <Input value={newJob.title} onChange={e => setNewJob(n => ({ ...n, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Job Title (English)</Label>
                <Input value={newJob.titleEn} onChange={e => setNewJob(n => ({ ...n, titleEn: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>القسم (عربي)</Label>
                <Input value={newJob.department} onChange={e => setNewJob(n => ({ ...n, department: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Department (English)</Label>
                <Input value={newJob.departmentEn} onChange={e => setNewJob(n => ({ ...n, departmentEn: e.target.value }))} dir="ltr" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>الوصف الوظيفي (عربي)</Label>
                <Textarea value={newJob.description} onChange={e => setNewJob(n => ({ ...n, description: e.target.value }))} rows={3} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Job Description (English)</Label>
                <Textarea value={newJob.descriptionEn} onChange={e => setNewJob(n => ({ ...n, descriptionEn: e.target.value }))} rows={3} dir="ltr" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>المتطلبات (عربي)</Label>
                <Textarea value={newJob.requirements} onChange={e => setNewJob(n => ({ ...n, requirements: e.target.value }))} rows={3} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Requirements (English)</Label>
                <Textarea value={newJob.requirementsEn} onChange={e => setNewJob(n => ({ ...n, requirementsEn: e.target.value }))} rows={3} dir="ltr" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={newJob.isActive} onChange={e => setNewJob(n => ({ ...n, isActive: e.target.checked }))} />
                <Label>وظيفة نشطة</Label>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={addMutation.isPending || updateMutation.isPending} className="w-full mt-4">
              {editingJob ? "تعديل" : "إضافة"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input 
            placeholder="البحث عن وظيفة..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredJobs?.map((job: any) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-lg">{job.title}</p>
                      <Badge variant={job.isActive ? "default" : "secondary"} className="text-xs">
                        {job.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.department}</p>
                    {job.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(job)}>
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(job.id)}>
                      <Trash2 className="w-4 h-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!filteredJobs || filteredJobs.length === 0) && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">لا توجد وظائف</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobApplicationsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: applications, isLoading } = useQuery({
    queryKey: ['/api/job-applications'],
    queryFn: async () => {
      const res = await fetch('/api/job-applications', { credentials: 'include' });
      return res.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/job-applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث حالة الطلب" });
      queryClient.invalidateQueries({ queryKey: ['/api/job-applications'] });
    }
  });

  const filteredApplications = applications?.filter((app: any) => 
    selectedStatus === "all" || app.status === selectedStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">قيد المراجعة</Badge>;
      case 'reviewed': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">تمت المراجعة</Badge>;
      case 'accepted': return <Badge className="bg-green-100 text-green-800">مقبول</Badge>;
      case 'rejected': return <Badge variant="destructive">مرفوض</Badge>;
      default: return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold">طلبات التوظيف</h3>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الطلبات</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="reviewed">تمت المراجعة</SelectItem>
            <SelectItem value="accepted">مقبول</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications?.map((app: any) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-lg">{app.name}</p>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                    <p className="text-sm text-muted-foreground">{app.phone}</p>
                    <div className="mt-2">{getStatusBadge(app.status)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function UserManagement() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const res = await fetch('/api/employees', { credentials: 'include' });
      return res.json();
    }
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">إدارة الموظفين</h3>
      <div className="grid gap-4">
        {users?.map((user: any) => (
          <Card key={user.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.role} - {user.department}</p>
              </div>
              <Badge>{user.isActive ? "نشط" : "غير نشط"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BankTransfersManagement() {
  const { data: transfers, isLoading } = useQuery({
    queryKey: ['/api/bank-transfers'],
    queryFn: async () => {
      const res = await fetch('/api/bank-transfers', { credentials: 'include' });
      return res.json();
    }
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">التحويلات البنكية</h3>
      <div className="grid gap-4">
        {transfers?.map((transfer: any) => (
          <Card key={transfer.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{transfer.donorName}</p>
                <p className="text-sm text-muted-foreground">{transfer.amount} ر.س - {transfer.bankName}</p>
              </div>
              <Badge variant={transfer.status === "approved" ? "default" : "secondary"}>
                {transfer.status === "approved" ? "تم التأكيد" : "قيد الانتظار"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SettingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    totalOrganizations: 0,
    totalBeneficiaries: 0,
    employeeFeesPercentage: 10,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      return res.json();
    }
  });

  useEffect(() => {
    if (stats) {
      setSettings({
        totalOrganizations: stats.totalOrganizations || 0,
        totalBeneficiaries: stats.totalBeneficiaries || 0,
        employeeFeesPercentage: 10,
      });
    }
  }, [stats]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      await apiRequest("POST", "/api/admin/settings", {
        totalOrganizations: data.totalOrganizations,
        totalBeneficiaries: data.totalBeneficiaries,
        employee_fees_percentage: data.employeeFeesPercentage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "تم الحفظ", description: "تم تحديث الإعدادات بنجاح" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات النظام</CardTitle>
        <CardDescription>تحديث بيانات الجمعية والإحصائيات العامة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>عدد المنظمات المستفيدة</Label>
            <Input
              type="number"
              value={settings.totalOrganizations}
              onChange={(e) => setSettings(s => ({ ...s, totalOrganizations: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>عدد المستفيدين</Label>
            <Input
              type="number"
              value={settings.totalBeneficiaries}
              onChange={(e) => setSettings(s => ({ ...s, totalBeneficiaries: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>نسبة رسوم الموظفين (%)</Label>
            <Input
              type="number"
              value={settings.employeeFeesPercentage}
              onChange={(e) => setSettings(s => ({ ...s, employeeFeesPercentage: Number(e.target.value) }))}
            />
          </div>
        </div>
        <Button onClick={() => updateMutation.mutate(settings)} disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          حفظ التغييرات
        </Button>
      </CardContent>
    </Card>
  );
}

function NewsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [newNews, setNewNews] = useState({ title: "", content: "", imageUrl: "", slug: "news-" });

  const { data: newsItems, isLoading } = useQuery({
    queryKey: ['/api/admin/content'],
    queryFn: async () => {
      const res = await fetch('/api/admin/content', { credentials: 'include' });
      const data = await res.json();
      return Array.isArray(data) ? data.filter((item: any) => item.slug.startsWith('news-')) : [];
    }
  });

  const addMutation = useMutation({
    mutationFn: async (news: any) => {
      await apiRequest("POST", "/api/admin/content", news);
    },
    onSuccess: () => {
      toast({ title: "تمت الإضافة", description: "تم إضافة الخبر بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setShowAddDialog(false);
      setNewNews({ title: "", content: "", imageUrl: "", slug: "news-" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (news: any) => {
      await apiRequest("PUT", `/api/admin/content/${news.slug}`, news);
    },
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث الخبر بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setEditingNews(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      await apiRequest("DELETE", `/api/admin/content/${slug}`);
    },
    onSuccess: () => {
      toast({ title: "تم الحذف", description: "تم حذف الخبر بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
    }
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">إدارة الأخبار</h3>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-brand">
          <Plus className="w-4 h-4 ml-2" />
          إضافة خبر
        </Button>
      </div>

      <div className="grid gap-4">
        {newsItems?.map((news: any) => (
          <Card key={news.slug}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{news.title}</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditingNews(news);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(news.slug)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: news.content }} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة خبر جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>المعرف (Slug)</Label>
              <Input value={newNews.slug} onChange={e => setNewNews({...newNews, slug: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>رابط الصورة</Label>
              <Input value={newNews.imageUrl} onChange={e => setNewNews({...newNews, imageUrl: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>المحتوى (HTML)</Label>
              <Textarea className="min-h-[200px]" value={newNews.content} onChange={e => setNewNews({...newNews, content: e.target.value})} />
            </div>
            <Button className="w-full" onClick={() => addMutation.mutate(newNews)} disabled={addMutation.isPending}>
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNews} onOpenChange={() => setEditingNews(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل الخبر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input value={editingNews?.title} onChange={e => setEditingNews({...editingNews, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>رابط الصورة</Label>
              <Input value={editingNews?.imageUrl} onChange={e => setEditingNews({...editingNews, imageUrl: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>المحتوى (HTML)</Label>
              <Textarea className="min-h-[200px]" value={editingNews?.content} onChange={e => setEditingNews({...editingNews, content: e.target.value})} />
            </div>
            <Button className="w-full" onClick={() => updateMutation.mutate(editingNews)} disabled={updateMutation.isPending}>
              تحديث
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    if (!isLoading && (!user || !["admin", "accountant", "manager"].includes(user.role || ""))) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const isAdmin = user.role === "admin";
  const isAccountant = user.role === "accountant";

  const style = {
    "--sidebar-width": "18rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-muted/20" dir="rtl">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-primary">لوحة الإدارة</h1>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {activeTab === "stats" && <StatsPanel />}
              {activeTab === "news" && isAdmin && <ContentManagement filter="news" />}
              {activeTab === "pages" && isAdmin && <ContentManagement filter="pages" />}
              {activeTab === "jobs" && isAdmin && <JobManagement />}
              {activeTab === "job-applications" && isAdmin && <JobApplicationsManagement />}
              {activeTab === "users" && isAdmin && <UserManagement />}
              {activeTab === "emails" && isAdmin && <EmailPanel />}
              {activeTab === "settings" && isAdmin && <SettingsManagement />}
              {activeTab === "donations" && (isAdmin || isAccountant) && <BankTransfersManagement />}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
