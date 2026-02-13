function ContentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingContent, setEditingContent] = useState<any>(null);
  
  const { data: contents, isLoading } = useQuery({
    queryKey: ['/api/admin/content'],
    queryFn: async () => {
      const res = await fetch('/api/admin/content', { credentials: 'include' });
      return res.json();
    }
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

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">إدارة محتوى الصفحات</h3>
      </div>
      
      <div className="grid gap-4">
        {contents?.map((content: any) => (
          <Card key={content.slug}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{content.slug}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditingContent(content)}>
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold">{content.title}</p>
              <div className="text-xs text-muted-foreground line-clamp-2 mt-1" dangerouslySetInnerHTML={{ __html: content.content }} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل صفحة: {editingContent?.slug}</DialogTitle>
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
