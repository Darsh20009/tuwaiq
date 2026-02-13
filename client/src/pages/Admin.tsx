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
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
// import { ThemeToggle } from "@/components/ThemeToggle";

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
        <Card className="hover-elevate bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التبرعات</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDonations || 0} ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">+12% من الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المستفيدين</CardTitle>
            <Heart className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.beneficiariesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">حالات نشطة حالياً</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">طلبات التوظيف</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.applicationsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">طلبات جديدة هذا الإسبوع</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200">
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
                    <div className="mt-2">{getStatusBadge(app.status)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setViewingApplication(app)}>
                          <Eye className="w-4 h-4 ml-1" />
                          عرض
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>تفاصيل الطلب</DialogTitle>
                        </DialogHeader>
                        {viewingApplication && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">الاسم الكامل</Label>
                              <p className="font-medium">{viewingApplication.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">البريد</Label>
                                <p className="font-medium">{viewingApplication.email}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">الجوال</Label>
                                <p className="font-medium">{viewingApplication.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-4">
                              <Button size="sm" className="bg-green-600" onClick={() => updateStatusMutation.mutate({ id: viewingApplication.id, status: 'accepted' })}>قبول</Button>
                              <Button size="sm" variant="destructive" onClick={() => updateStatusMutation.mutate({ id: viewingApplication.id, status: 'rejected' })}>رفض</Button>
                              <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: viewingApplication.id, status: 'reviewed' })}>تحديد كمراجع</Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      return res.json();
    }
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة المستخدمين والأدوار</CardTitle>
        <CardDescription>إدارة صلاحيات الموظفين والمسؤولين</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user: any) => (
            <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.mobile}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{user.role}</Badge>
                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RolesManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة الصلاحيات</CardTitle>
        <CardDescription>تحديد مستويات الوصول للأدوار المختلفة</CardDescription>
      </CardHeader>
      <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
        <p className="text-muted-foreground">قيد التطوير...</p>
      </CardContent>
    </Card>
  );
}

function BankTransfersManagement() {
  const { data: donations, isLoading } = useQuery<any[]>({
    queryKey: ["/api/donations"],
  });

  const transfers = Array.isArray(donations) 
    ? donations.filter((d: any) => d.paymentMethod === "bank_transfer")
    : [];

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/donations/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      toast({ title: "تم التحديث", description: "تم تحديث حالة التحويل بنجاح" });
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">إدارة التحويلات البنكية</h3>
      <div className="grid gap-4">
        {transfers.map((transfer) => (
          <Card key={transfer.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{transfer.donorName || "فاعل خير"}</p>
                <p className="text-sm text-muted-foreground">{transfer.amount} ر.س - {transfer.type}</p>
                <Badge variant={transfer.status === "success" ? "default" : "secondary"}>
                  {transfer.status === "success" ? "مكتمل" : "معلق"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: transfer.id, status: "success" })} disabled={transfer.status === "success"}>تأكيد</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: transfer.id, status: "failed" })} disabled={transfer.status === "failed"}>رفض</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {transfers.length === 0 && <p className="text-center text-muted-foreground">لا توجد تحويلات بنكية</p>}
      </div>
    </div>
  );
}

function NewsManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة الأخبار</CardTitle>
        <CardDescription>إضافة وتعديل أخبار الجمعية</CardDescription>
      </CardHeader>
      <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
        <p className="text-muted-foreground">نظام إدارة الأخبار قيد التطوير...</p>
      </CardContent>
    </Card>
  );
}

function ContentManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة المحتوى</CardTitle>
        <CardDescription>إدارة الصور والملفات في الموقع</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload onUpload={(url) => console.log(url)} />
      </CardContent>
    </Card>
  );
}

function EmployeesManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة الموظفين</CardTitle>
        <CardDescription>قائمة الموظفين وصلاحياتهم</CardDescription>
      </CardHeader>
      <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
        <p className="text-muted-foreground">قائمة الموظفين قيد التطوير...</p>
      </CardContent>
    </Card>
  );
}

function SettingsManagement() {
  const [settings, setSettings] = useState({
    totalOrganizations: 0,
    totalBeneficiaries: 0,
    employeeFeesPercentage: 10,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

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
            {/* <ThemeToggle /> */}
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {activeTab === "stats" && <StatsPanel />}
              {activeTab === "news" && isAdmin && <NewsManagement />}
              {activeTab === "content" && isAdmin && <ContentManagement />}
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
