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
  Heart, HeartHandshake, LayoutDashboard
} from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

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
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التبرعات</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDonations || 0} ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">+12% من الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المستفيدين</CardTitle>
            <Heart className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.beneficiariesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">حالات نشطة حالياً</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">طلبات التوظيف</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.applicationsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">طلبات جديدة هذا الإسبوع</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">نسبة الإنجاز</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <div className="w-full bg-amber-200 rounded-full h-1.5 mt-3">
              <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: '84%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>آخر التبرعات</CardTitle>
            <CardDescription>عرض أحدث العمليات المالية المستلمة</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDonations.length > 0 ? (
              <div className="space-y-4">
                {recentDonations.map((donation: any) => (
                  <div key={donation.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{donation.donorName || "متبرع فاعل خير"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(donation.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-blue-600">{donation.amount} ر.س</p>
                      <Badge variant="outline" className="text-[10px]">{donation.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد تبرعات حديثة</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>نشاطات قادمة</CardTitle>
            <CardDescription>الفعاليات والبرامج المجدولة</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">لا توجد فعاليات مجدولة</p>
          </CardContent>
        </Card>
      </div>
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

// Job Management Tab
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

// Job Applications Management Tab
function JobApplicationsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewingApplication, setViewingApplication] = useState<any>(null);

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
                    <p className="text-xs text-muted-foreground mt-1">
                      الوظيفة: {app.jobTitle || 'غير محدد'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(app.status)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setViewingApplication(app)}>
                          <Eye className="w-4 h-4 ml-1" />
                          عرض
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>تفاصيل طلب التوظيف</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">الاسم</Label>
                              <p className="font-medium">{app.name}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                              <p className="font-medium">{app.email}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">رقم الجوال</Label>
                              <p className="font-medium">{app.phone}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">الوظيفة المتقدم لها</Label>
                              <p className="font-medium">{app.jobTitle || 'غير محدد'}</p>
                            </div>
                          </div>
                          {app.resumeUrl && (
                            <div>
                              <Label className="text-muted-foreground">السيرة الذاتية</Label>
                              <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-primary hover:underline mt-1">
                                <FileText className="w-4 h-4" />
                                عرض السيرة الذاتية
                              </a>
                            </div>
                          )}
                          {app.coverLetter && (
                            <div>
                              <Label className="text-muted-foreground">رسالة التقديم</Label>
                              <p className="mt-1 text-sm bg-muted p-3 rounded-lg">{app.coverLetter}</p>
                            </div>
                          )}
                          <div className="pt-4 border-t">
                            <Label className="text-muted-foreground mb-2 block">تحديث الحالة</Label>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                variant={app.status === 'reviewed' ? 'default' : 'outline'}
                                onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'reviewed' })}
                              >
                                <Clock className="w-4 h-4 ml-1" />
                                تمت المراجعة
                              </Button>
                              <Button 
                                size="sm" 
                                variant={app.status === 'accepted' ? 'default' : 'outline'}
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'accepted' })}
                              >
                                <CheckCircle2 className="w-4 h-4 ml-1" />
                                قبول
                              </Button>
                              <Button 
                                size="sm" 
                                variant={app.status === 'rejected' ? 'destructive' : 'outline'}
                                onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'rejected' })}
                              >
                                <XCircle className="w-4 h-4 ml-1" />
                                رفض
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!filteredApplications || filteredApplications.length === 0) && (
            <p className="text-center text-muted-foreground py-8">لا توجد طلبات توظيف</p>
          )}
        </div>
      )}
    </div>
  );
}

// News Management Tab
function NewsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newArticle, setNewArticle] = useState({
    title: "",
    titleEn: "",
    content: "",
    contentEn: "",
    summary: "",
    summaryEn: "",
    imageUrl: "",
    category: "general",
    isPublished: true
  });

  const { data: newsArticles, isLoading } = useQuery({
    queryKey: ['/api/news'],
    queryFn: async () => {
      const res = await fetch('/api/news', { credentials: 'include' });
      return res.json();
    }
  });

  const addMutation = useMutation({
    mutationFn: async (article: any) => {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم الحفظ", description: "تم إضافة الخبر بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      setShowAddDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (article: any) => {
      const res = await fetch(`/api/news/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث الخبر بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      setShowAddDialog(false);
      setEditingNews(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      toast({ title: "تم الحذف", description: "تم حذف الخبر" });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
    }
  });

  const resetForm = () => {
    setNewArticle({
      title: "", titleEn: "", content: "", contentEn: "",
      summary: "", summaryEn: "", imageUrl: "", category: "general", isPublished: true
    });
  };

  const handleEdit = (article: any) => {
    setEditingNews(article);
    setNewArticle({
      title: article.title || "",
      titleEn: article.titleEn || "",
      content: article.content || "",
      contentEn: article.contentEn || "",
      summary: article.summary || "",
      summaryEn: article.summaryEn || "",
      imageUrl: article.imageUrl || "",
      category: article.category || "general",
      isPublished: article.isPublished ?? true
    });
    setShowAddDialog(true);
  };

  const handleSubmit = () => {
    if (editingNews) {
      updateMutation.mutate({ ...newArticle, id: editingNews.id });
    } else {
      addMutation.mutate(newArticle);
    }
  };

  const filteredNews = newsArticles?.filter((article: any) =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { value: "general", label: "عام" },
    { value: "events", label: "فعاليات" },
    { value: "achievements", label: "إنجازات" },
    { value: "announcements", label: "إعلانات" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold">إدارة الأخبار</h3>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) { setEditingNews(null); resetForm(); }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-brand">
              <Plus className="w-4 h-4 ml-2" />
              إضافة خبر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNews ? "تعديل الخبر" : "إضافة خبر جديد"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>العنوان (عربي) *</Label>
                <Input value={newArticle.title} onChange={e => setNewArticle(n => ({ ...n, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Title (English)</Label>
                <Input value={newArticle.titleEn} onChange={e => setNewArticle(n => ({ ...n, titleEn: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>الملخص (عربي)</Label>
                <Textarea value={newArticle.summary} onChange={e => setNewArticle(n => ({ ...n, summary: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Summary (English)</Label>
                <Textarea value={newArticle.summaryEn} onChange={e => setNewArticle(n => ({ ...n, summaryEn: e.target.value }))} rows={2} dir="ltr" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>المحتوى الكامل (عربي) *</Label>
                <Textarea value={newArticle.content} onChange={e => setNewArticle(n => ({ ...n, content: e.target.value }))} rows={5} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Full Content (English)</Label>
                <Textarea value={newArticle.contentEn} onChange={e => setNewArticle(n => ({ ...n, contentEn: e.target.value }))} rows={5} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>صورة الخبر</Label>
                <FileUpload 
                  currentUrl={newArticle.imageUrl}
                  onUpload={(url) => setNewArticle(n => ({ ...n, imageUrl: url }))}
                  accept="image/*"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select value={newArticle.category} onValueChange={(v) => setNewArticle(n => ({ ...n, category: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={newArticle.isPublished} 
                    onChange={e => setNewArticle(n => ({ ...n, isPublished: e.target.checked }))} 
                    className="w-4 h-4"
                  />
                  <Label>منشور</Label>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={addMutation.isPending || updateMutation.isPending || !newArticle.title} 
              className="w-full mt-4 bg-gradient-brand"
            >
              {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin ml-2 w-4 h-4" />}
              {editingNews ? "تحديث الخبر" : "إضافة الخبر"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <Input 
          placeholder="البحث في الأخبار..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredNews?.map((article: any) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {article.imageUrl && (
                  <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg">{article.title}</h4>
                        <Badge variant={article.isPublished ? "default" : "secondary"} className="text-xs">
                          {article.isPublished ? "منشور" : "مسودة"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {categories.find(c => c.value === article.category)?.label || "عام"}
                        </Badge>
                      </div>
                      {article.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {article.createdAt && new Date(article.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                        <Edit className="w-4 h-4 ml-1" />
                        تعديل
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => deleteMutation.mutate(article.id)}
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
          {(!filteredNews || filteredNews.length === 0) && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا توجد أخبار</p>
              <p className="text-sm text-muted-foreground/70">أضف خبراً جديداً للبدء</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Content Management Tab
function ContentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSlug, setSelectedSlug] = useState("about");
  const [content, setContent] = useState({ 
    title: "", 
    titleEn: "", 
    content: "", 
    contentEn: "", 
    imageUrl: "",
    videoUrl: "" // Added
  });

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['/api/content', selectedSlug],
    queryFn: async () => {
      const res = await fetch(`/api/content/${selectedSlug}`);
      return res.json();
    }
  });

  useEffect(() => {
    if (contentData) {
      setContent({
        title: contentData.title || "",
        titleEn: contentData.titleEn || "",
        content: contentData.content || "",
        contentEn: contentData.contentEn || "",
        imageUrl: contentData.imageUrl || "",
        videoUrl: contentData.videoUrl || "" // Added
      });
    }
  }, [contentData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/content/${selectedSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم الحفظ", description: "تم تحديث المحتوى بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/content', selectedSlug] });
    }
  });

  const pages = [
    { slug: "about", label: "نشأة الجمعية" },
    { slug: "goals", label: "أهداف الجمعية" },
    { slug: "vision", label: "الرؤية والرسالة" },
    { slug: "founders", label: "المؤسسون" },
    { slug: "board", label: "مجلس الإدارة" },
    { slug: "bylaws", label: "اللائحة الأساسية" },
    { slug: "policies", label: "السياسات" },
    { slug: "assembly", label: "أعضاء الجمعية العمومية" },
    { slug: "programs", label: "برامج الجمعية" },
    { slug: "newsletters", label: "نشرات الجمعية" },
    { slug: "beneficiaries", label: "المستفيدين" },
    { slug: "jobs", label: "إعلانات الوظائف" },
    { slug: "apply-job", label: "التقدم للتوظيف" },
    { slug: "volunteer", label: "تطوع الآن" },
    { slug: "financials", label: "القوائم المالية" },
    { slug: "committees", label: "اللجان" },
    { slug: "satisfaction", label: "قياس رضاء أصحاب العلاقة" },
    { slug: "ethics", label: "الميثاق الأخلاقي" },
    { slug: "executive", label: "المسؤول التنفيذي" },
    { slug: "disclosure", label: "الإفصاح" },
    { slug: "news", label: "الأخبار" },
    { slug: "blog", label: "المدونة" },
    { slug: "contact-info", label: "معلومات التواصل" },
    { slug: "home-hero", label: "واجهة الصفحة الرئيسية" },
    { slug: "statistics", label: "إحصائيات الجمعية" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">إدارة محتوى الصفحات</h3>
        <Select value={selectedSlug} onValueChange={setSelectedSlug}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pages.map(p => (
              <SelectItem key={p.slug} value={p.slug}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>العنوان (عربي)</Label>
              <Input
                value={content.title}
                onChange={e => setContent(c => ({ ...c, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>العنوان (إنجليزي)</Label>
              <Input
                value={content.titleEn}
                onChange={e => setContent(c => ({ ...c, titleEn: e.target.value }))}
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>رفع صورة</Label>
              <FileUpload 
                currentUrl={content.imageUrl}
                onUpload={(url) => setContent(c => ({ ...c, imageUrl: url }))}
                accept="image/*"
                label="اختر صورة"
              />
              {content.imageUrl && (
                <Input
                  value={content.imageUrl}
                  onChange={e => setContent(c => ({ ...c, imageUrl: e.target.value }))}
                  placeholder="أو أدخل رابط الصورة..."
                  className="text-xs"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>رفع فيديو</Label>
              <FileUpload 
                currentUrl={content.videoUrl}
                onUpload={(url) => setContent(c => ({ ...c, videoUrl: url }))}
                accept="video/*"
                label="اختر فيديو"
              />
              {content.videoUrl && (
                <Input
                  value={content.videoUrl}
                  onChange={e => setContent(c => ({ ...c, videoUrl: e.target.value }))}
                  placeholder="أو أدخل رابط الفيديو..."
                  className="text-xs"
                />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>المحتوى (عربي) - يدعم HTML</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                value={content.content}
                onChange={e => setContent(c => ({ ...c, content: e.target.value }))}
                rows={15}
                className="font-mono text-sm"
              />
              <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[400px]">
                <div className="text-xs text-muted-foreground mb-2 border-b pb-1 uppercase">معاينة مباشرة</div>
                <div 
                  className="prose prose-sm max-w-none text-right" 
                  style={{ direction: 'rtl' }}
                  dangerouslySetInnerHTML={{ __html: content.content }} 
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Content (English) - Supports HTML</Label>
            <Textarea
              value={content.contentEn}
              onChange={e => setContent(c => ({ ...c, contentEn: e.target.value }))}
              rows={10}
              dir="ltr"
              className="font-mono text-sm"
            />
          </div>

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-gradient-brand">
            {saveMutation.isPending ? <Loader2 className="animate-spin ml-2" /> : null}
            حفظ التغييرات
          </Button>
        </div>
      )}
    </div>
  );
}

// Employees Management Tab
function EmployeesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", mobile: "", password: "", role: "accountant", department: "" });

  const { data: employees, isLoading } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const res = await fetch('/api/employees', { credentials: 'include' });
      return res.json();
    }
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تمت الإضافة", description: "تم إضافة الموظف بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setShowAddDialog(false);
      setNewEmployee({ name: "", mobile: "", password: "", role: "accountant", department: "" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      toast({ title: "تم الحذف", description: "تم حذف الموظف" });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
    }
  });

  const roleLabels: Record<string, string> = {
    admin: "مدير النظام",
    accountant: "محاسب",
    delivery: "مندوب توصيل",
    editor: "محرر محتوى",
    manager: "مدير فرع"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">إدارة الموظفين</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-brand">
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة موظف
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة موظف جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم</Label>
                <Input
                  value={newEmployee.name}
                  onChange={e => setNewEmployee(n => ({ ...n, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الجوال</Label>
                <Input
                  value={newEmployee.mobile}
                  onChange={e => setNewEmployee(n => ({ ...n, mobile: e.target.value }))}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور</Label>
                <Input
                  type="password"
                  value={newEmployee.password}
                  onChange={e => setNewEmployee(n => ({ ...n, password: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select value={newEmployee.role} onValueChange={v => setNewEmployee(n => ({ ...n, role: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير النظام</SelectItem>
                    <SelectItem value="accountant">محاسب</SelectItem>
                    <SelectItem value="delivery">مندوب توصيل</SelectItem>
                    <SelectItem value="editor">محرر محتوى</SelectItem>
                    <SelectItem value="manager">مدير فرع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>القسم</Label>
                <Input
                  value={newEmployee.department}
                  onChange={e => setNewEmployee(n => ({ ...n, department: e.target.value }))}
                />
              </div>
              <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending} className="w-full">
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {employees?.map((emp: any) => (
            <Card key={emp.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{emp.name}</p>
                    <p className="text-sm text-muted-foreground">{emp.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{roleLabels[emp.role] || emp.role}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(emp.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!employees || employees.length === 0) && (
            <p className="text-center text-muted-foreground py-8">لا يوجد موظفين</p>
          )}
        </div>
      )}
    </div>
  );
}

// Bank Transfers Tab
function BankTransfersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['/api/bank-transfers'],
    queryFn: async () => {
      const res = await fetch('/api/bank-transfers', { credentials: 'include' });
      return res.json();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/bank-transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث حالة التحويل" });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-transfers'] });
    }
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };

  const statusLabels: Record<string, string> = {
    pending: "قيد المراجعة",
    approved: "معتمد",
    rejected: "مرفوض"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">إيصالات التحويل البنكي</h3>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/bank-transfers'] })}>
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {transfers?.map((transfer: any) => (
            <Card key={transfer.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{Number(transfer.amount).toLocaleString()} ريال</span>
                      <Badge className={statusColors[transfer.status]}>
                        {statusLabels[transfer.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transfer.donorName || "متبرع"} - {transfer.donorPhone || "غير محدد"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transfer.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  
                  {transfer.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateMutation.mutate({ id: transfer.id, status: 'approved' })}
                      >
                        <CheckCircle2 className="w-4 h-4 ml-1" />
                        اعتماد
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateMutation.mutate({ id: transfer.id, status: 'rejected' })}
                      >
                        <XCircle className="w-4 h-4 ml-1" />
                        رفض
                      </Button>
                    </div>
                  )}
                </div>
                
                {transfer.receiptImage && (
                  <div className="mt-4">
                    <Label className="text-muted-foreground mb-2 block">إيصال التحويل</Label>
                    <div className="border rounded-lg overflow-hidden bg-muted/50">
                      <img
                        src={transfer.receiptImage}
                        alt="Receipt"
                        className="max-h-64 h-auto mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(transfer.receiptImage, '_blank')}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => window.open(transfer.receiptImage, '_blank')}
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض بحجم كامل
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {(!transfers || transfers.length === 0) && (
            <p className="text-center text-muted-foreground py-8">لا توجد إيصالات</p>
          )}
        </div>
      )}
    </div>
  );
}

// Contact Messages Tab
function ContactMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['/api/contact'],
    queryFn: async () => {
      const res = await fetch('/api/contact', { credentials: 'include' });
      return res.json();
    }
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">رسائل التواصل</h3>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {messages?.map((msg: any) => (
            <Card key={msg.id} className={msg.read ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-bold">{msg.name}</p>
                    <p className="text-sm text-primary">{msg.subject}</p>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>{msg.email}</span>
                      <span>{msg.phone}</span>
                    </div>
                  </div>
                  <Badge variant={msg.read ? "secondary" : "default"}>
                    {msg.read ? "مقروءة" : "جديدة"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!messages || messages.length === 0) && (
            <p className="text-center text-muted-foreground py-8">لا توجد رسائل</p>
          )}
        </div>
      )}
    </div>
  );
}

function SystemSettings({ stats, updateMutation }: { stats: any, updateMutation: any }) {
  const [localSettings, setLocalSettings] = useState({
    totalOrganizations: 0,
    totalBeneficiaries: 0,
    employeeFeesPercentage: 10,
    donationGoal: 1000000,
    activeCampaigns: 5
  });

  useEffect(() => {
    if (stats) {
      setLocalSettings({
        totalOrganizations: stats.totalOrganizations || 0,
        totalBeneficiaries: stats.totalBeneficiaries || 0,
        employeeFeesPercentage: stats.employeeFeesPercentage || 10,
        donationGoal: stats.donationGoal || 1000000,
        activeCampaigns: stats.activeCampaigns || 5
      });
    }
  }, [stats]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>إعدادات النظام العامة</CardTitle>
        <CardDescription>التحكم في الأرقام والإحصائيات التي تظهر للجمهور</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>إجمالي الجمعيات الشريكة</Label>
            <Input 
              type="number" 
              value={localSettings.totalOrganizations} 
              onChange={e => setLocalSettings(s => ({ ...s, totalOrganizations: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>إجمالي المستفيدين</Label>
            <Input 
              type="number" 
              value={localSettings.totalBeneficiaries} 
              onChange={e => setLocalSettings(s => ({ ...s, totalBeneficiaries: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>الهدف المالي الكلي (ريال)</Label>
            <Input 
              type="number" 
              value={localSettings.donationGoal} 
              onChange={e => setLocalSettings(s => ({ ...s, donationGoal: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>نسبة الرسوم الإدارية (%)</Label>
            <Input 
              type="number" 
              value={localSettings.employeeFeesPercentage} 
              onChange={e => setLocalSettings(s => ({ ...s, employeeFeesPercentage: Number(e.target.value) }))}
            />
          </div>
        </div>
        <Button 
          className="w-full bg-gradient-brand" 
          onClick={() => updateMutation.mutate(localSettings)}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending && <Loader2 className="animate-spin ml-2" />}
          حفظ إعدادات النظام
        </Button>
      </CardContent>
    </Card>
  );
}

// Main Admin Component
export default function Admin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    totalOrganizations: 0,
    totalBeneficiaries: 0,
    employeeFeesPercentage: 10,
  });

  useEffect(() => {
    if (!isLoading && (!user || !["admin", "accountant", "delivery", "editor", "manager"].includes(user.role || ""))) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [api.admin.getStats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.getStats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!user && ["admin", "accountant", "manager"].includes(user.role || ""),
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
      const res = await fetch(api.admin.updateSettings.path, {
        method: api.admin.updateSettings.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalOrganizations: data.totalOrganizations,
          totalBeneficiaries: data.totalBeneficiaries,
          employee_fees_percentage: data.employeeFeesPercentage,
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.getStats.path] });
      toast({ title: "تم الحفظ", description: "تم تحديث الإعدادات بنجاح" });
    },
  });

  if (isLoading || !user) return null;

  const isAdmin = user.role === "admin";
  const isAccountant = user.role === "accountant";
  const isEditor = user.role === "editor";
  const isManager = user.role === "manager";

  const [activeTab, setActiveTab] = useState(isAdmin ? "news" : "transfers");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: "news", label: "إدارة الأخبار", icon: FileText, roles: ["admin"] },
    { id: "content", label: "إدارة المحتوى", icon: Image, roles: ["admin"] },
    { id: "jobs", label: "إدارة الوظائف", icon: Building2, roles: ["admin"] },
    { id: "applications", label: "طلبات التوظيف", icon: UserPlus, roles: ["admin"] },
    { id: "employees", label: "إدارة الموظفين", icon: Users, roles: ["admin"] },
    { id: "transfers", label: "التحويلات البنكية", icon: Truck, roles: ["admin", "accountant"] },
    { id: "messages", label: "رسائل التواصل", icon: MessageSquare, roles: ["admin"] },
    { id: "emails", label: "البريد الإلكتروني", icon: Mail, roles: ["admin"] },
    { id: "settings", label: "الإعدادات", icon: Settings, roles: ["admin"] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role || "")
  );

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <main className="flex-1 flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-l border-gray-200 shadow-sm transition-all duration-300 hidden md:block`}>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-md">
                <Settings className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-bold text-lg">لوحة التحكم</h2>
                  <p className="text-xs text-muted-foreground">{user.name}</p>
                </div>
              )}
            </div>
          </div>
          
          <nav className="p-3 space-y-1">
            {filteredMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-brand text-white shadow-md'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Badge variant="outline" className={`${sidebarOpen ? 'w-full justify-center' : 'w-10 h-10'} py-2`}>
              {sidebarOpen ? (
                user.role === "admin" ? "مدير النظام" : 
                user.role === "accountant" ? "محاسب" : 
                user.role === "delivery" ? "مندوب توصيل" : 
                user.role === "editor" ? "محرر محتوى" : "مدير فرع"
              ) : (
                <Settings className="w-4 h-4" />
              )}
            </Badge>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b shadow-sm p-3">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filteredMenuItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 md:pt-8 pt-20 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Stats Cards - Only for admin/accountant/manager */}
          {(isAdmin || isAccountant || isManager) && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">إجمالي التبرعات</CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                  <div className="text-lg md:text-2xl font-bold">{Number(stats?.totalDonations || 0).toLocaleString()} <span className="text-xs font-normal">ريال</span></div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">صافي التبرعات</CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                  <div className="text-lg md:text-2xl font-bold text-green-600">{Number(stats?.netDonations || 0).toLocaleString()} <span className="text-xs font-normal">ريال</span></div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">المستفيدون</CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                  <div className="text-lg md:text-2xl font-bold">{stats?.totalBeneficiaries?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">الشركاء</CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Building className="h-4 w-4 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                  <div className="text-lg md:text-2xl font-bold">{stats?.totalOrganizations || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content Sections based on activeTab */}
          {activeTab === "news" && isAdmin && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <NewsManagement />
              </CardContent>
            </Card>
          )}

          {activeTab === "content" && isAdmin && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <ContentManagement />
              </CardContent>
            </Card>
          )}

          {activeTab === "jobs" && isAdmin && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <JobManagement />
              </CardContent>
            </Card>
          )}

          {activeTab === "applications" && isAdmin && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <JobApplicationsManagement />
              </CardContent>
            </Card>
          )}

          {activeTab === "employees" && isAdmin && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <EmployeesManagement />
              </CardContent>
            </Card>
          )}

          {activeTab === "transfers" && (isAdmin || isAccountant) && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <BankTransfersManagement />
              </CardContent>
            </Card>
          )}

          {activeTab === "emails" && isAdmin && (
            <EmailPanel />
          )}
          {activeTab === "messages" && isAdmin && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <ContactMessages />
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && isAdmin && (
            <Card className="border-0 shadow-lg">
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
                      min={0}
                      max={100}
                      value={settings.employeeFeesPercentage}
                      onChange={(e) => setSettings(s => ({ ...s, employeeFeesPercentage: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => updateMutation.mutate(settings)} 
                  disabled={updateMutation.isPending}
                  className="bg-gradient-brand"
                >
                  {updateMutation.isPending ? <Loader2 className="animate-spin ml-2" /> : null}
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          )}

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
