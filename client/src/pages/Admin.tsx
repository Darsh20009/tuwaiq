import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, Users, Building, DollarSign, Percent, TrendingUp, Loader2,
  FileText, UserPlus, Truck, MessageSquare, Building2, CheckCircle2,
  XCircle, Clock, Edit, Trash2, Eye, Plus, RefreshCw, Image
} from "lucide-react";

// Job Management Tab
function JobManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs?.map((job: any) => (
            <Card key={job.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={job.isActive ? "default" : "secondary"}>
                    {job.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(job)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(job.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!jobs || jobs.length === 0) && <p className="text-center text-muted-foreground py-8">لا توجد وظائف</p>}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>العنوان (عربي)</Label>
              <Input
                value={content.title}
                onChange={e => setContent(c => ({ ...c, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>رابط الفيديو (اختياري)</Label>
              <div className="flex gap-2">
                <Input
                  value={content.videoUrl}
                  onChange={e => setContent(c => ({ ...c, videoUrl: e.target.value }))}
                  placeholder="رابط فيديو MP4..."
                />
                <Button size="icon" variant="outline" onClick={() => {
                  const url = prompt("أدخل رابط الفيديو:");
                  if (url) setContent(c => ({ ...c, videoUrl: url }));
                }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>رابط الصورة</Label>
              <div className="flex gap-2">
                <Input
                  value={content.imageUrl}
                  onChange={e => setContent(c => ({ ...c, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
                <Button size="icon" variant="outline" onClick={() => {
                  const url = prompt("أدخل رابط الصورة:");
                  if (url) setContent(c => ({ ...c, imageUrl: url }));
                }}>
                  <Image className="h-4 w-4" />
                </Button>
              </div>
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
                    <img
                      src={transfer.receiptImage}
                      alt="Receipt"
                      className="max-h-32 rounded-lg border"
                    />
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

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading">لوحة التحكم</h1>
                <p className="text-muted-foreground text-sm">مرحباً {user.name}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {user.role === "admin" ? "مدير النظام" : 
               user.role === "accountant" ? "محاسب" : 
               user.role === "delivery" ? "مندوب توصيل" : 
               user.role === "editor" ? "محرر محتوى" : "مدير فرع"}
            </Badge>
          </div>

          {/* Stats Cards - Only for admin/accountant/manager */}
          {(isAdmin || isAccountant || isManager) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي التبرعات</CardTitle>
                  <DollarSign className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Number(stats?.totalDonations || 0).toLocaleString()} ريال</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">صافي التبرعات</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{Number(stats?.netDonations || 0).toLocaleString()} ريال</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">المستفيدون</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalBeneficiaries?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الشركاء</CardTitle>
                  <Building className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalOrganizations || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue={isAdmin ? "content" : "transfers"} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2 bg-muted/50 p-1 h-auto">
              {isAdmin && <TabsTrigger value="content" className="gap-2 py-2"><FileText className="w-4 h-4" /> <span className="hidden sm:inline">المحتوى</span></TabsTrigger>}
              {isAdmin && <TabsTrigger value="jobs" className="gap-2 py-2"><Building2 className="w-4 h-4" /> <span className="hidden sm:inline">الوظائف</span></TabsTrigger>}
              {isAdmin && <TabsTrigger value="employees" className="gap-2 py-2"><Users className="w-4 h-4" /> <span className="hidden sm:inline">الموظفين</span></TabsTrigger>}
              {(isAdmin || isAccountant) && <TabsTrigger value="transfers" className="gap-2 py-2"><Building2 className="w-4 h-4" /> <span className="hidden sm:inline">التحويلات</span></TabsTrigger>}
              {isAdmin && <TabsTrigger value="messages" className="gap-2 py-2"><MessageSquare className="w-4 h-4" /> <span className="hidden sm:inline">الرسائل</span></TabsTrigger>}
              {isAdmin && <TabsTrigger value="settings" className="gap-2 py-2"><Settings className="w-4 h-4" /> <span className="hidden sm:inline">الإعدادات</span></TabsTrigger>}
            </TabsList>

            {isAdmin && (
              <TabsContent value="content">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <ContentManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="jobs">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <JobManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="employees">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <EmployeesManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {(isAdmin || isAccountant) && (
              <TabsContent value="transfers">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <BankTransfersManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="messages">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <ContactMessages />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="settings">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>إعدادات النظام</CardTitle>
                    <CardDescription>تحديث بيانات الجمعية والإحصائيات العامة</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
