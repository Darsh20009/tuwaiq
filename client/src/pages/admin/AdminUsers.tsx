import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Loader2, Users, Plus, Edit, Trash2, Search, Shield,
  Phone, Mail, CheckCircle2, XCircle, Lock, RefreshCw,
  Eye, EyeOff, Crown, Briefcase, Code2, Calculator,
  Truck, Megaphone, UserCheck, Key, AlertTriangle,
  BarChart3, TrendingUp, Grid3X3, Send, Building2,
  ChevronDown, Filter, MoreVertical, Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ROLES: {
  value: string;
  label: string;
  labelEn: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  dot: string;
  gradient: string;
  permissions: string[];
}[] = [
  {
    value: "admin",
    label: "مدير عام",
    labelEn: "Super Admin",
    icon: Crown,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    gradient: "from-red-500 to-red-700",
    permissions: ["كل الصلاحيات", "إدارة المستخدمين", "الإعدادات", "التبرعات", "التقارير", "المحتوى", "المخزون", "الموارد البشرية"],
  },
  {
    value: "manager",
    label: "مدير تنفيذي",
    labelEn: "Manager",
    icon: Shield,
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
    gradient: "from-violet-500 to-violet-700",
    permissions: ["إدارة المستخدمين", "التبرعات", "التقارير", "المحتوى", "المخزون", "الموارد البشرية"],
  },
  {
    value: "accountant",
    label: "محاسب",
    labelEn: "Accountant",
    icon: Calculator,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    gradient: "from-amber-500 to-amber-700",
    permissions: ["التبرعات والمتحصلات", "التحويلات البنكية", "التقارير المالية", "الحضور"],
  },
  {
    value: "programmer",
    label: "مبرمج",
    labelEn: "Developer",
    icon: Code2,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
    gradient: "from-blue-500 to-blue-700",
    permissions: ["مهام التطوير", "الشات الداخلي", "البريد الداخلي", "الحضور"],
  },
  {
    value: "sales",
    label: "موظف مبيعات",
    labelEn: "Sales",
    icon: Megaphone,
    color: "text-pink-700",
    bg: "bg-pink-50",
    border: "border-pink-200",
    dot: "bg-pink-500",
    gradient: "from-pink-500 to-pink-700",
    permissions: ["منشئ البوسترات", "إدارة المحتوى", "الشات الداخلي", "الحضور"],
  },
  {
    value: "delivery",
    label: "مندوب توصيل",
    labelEn: "Delivery",
    icon: Truck,
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
    gradient: "from-orange-500 to-orange-700",
    permissions: ["طلبات التوصيل", "الشات الداخلي", "الحضور"],
  },
  {
    value: "employee",
    label: "موظف",
    labelEn: "Employee",
    icon: Briefcase,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    gradient: "from-emerald-500 to-emerald-700",
    permissions: ["التحويلات البنكية", "طلبات التوظيف", "الشات الداخلي", "الحضور"],
  },
  {
    value: "user",
    label: "متبرع / مستخدم",
    labelEn: "Donor",
    icon: UserCheck,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
    gradient: "from-slate-400 to-slate-600",
    permissions: ["التبرع", "عرض الشهادات", "الملف الشخصي"],
  },
];

const getRoleConfig = (role: string) =>
  ROLES.find((r) => r.value === role) || ROLES[ROLES.length - 1];

const emptyForm = {
  name: "", mobile: "", email: "", password: "", role: "employee", department: "",
};

function UserAvatar({ name, role, size = "md" }: { name: string; role: string; size?: "sm" | "md" | "lg" }) {
  const cfg = getRoleConfig(role);
  const initials = name?.trim().split(" ").slice(0, 2).map((w) => w[0]).join("") || "?";
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  return (
    <div className={`${sizeClass} rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-black shadow-sm shrink-0`}>
      {initials}
    </div>
  );
}

function PermissionMatrix() {
  const features = [
    { label: "لوحة التحكم الرئيسية", admin: true, manager: true, accountant: true, programmer: true, sales: true, delivery: true, employee: true, user: false },
    { label: "إدارة المستخدمين", admin: true, manager: true, accountant: false, programmer: false, sales: false, delivery: false, employee: false, user: false },
    { label: "الإعدادات", admin: true, manager: false, accountant: false, programmer: false, sales: false, delivery: false, employee: false, user: false },
    { label: "التبرعات والمتحصلات", admin: true, manager: true, accountant: true, programmer: false, sales: false, delivery: false, employee: false, user: false },
    { label: "التقارير", admin: true, manager: true, accountant: true, programmer: false, sales: false, delivery: false, employee: false, user: false },
    { label: "التحويلات البنكية", admin: true, manager: true, accountant: true, programmer: false, sales: false, delivery: false, employee: true, user: false },
    { label: "إدارة المحتوى", admin: true, manager: true, accountant: false, programmer: false, sales: true, delivery: false, employee: false, user: false },
    { label: "الحملات والأخبار", admin: true, manager: true, accountant: false, programmer: false, sales: true, delivery: false, employee: false, user: false },
    { label: "المستفيدون", admin: true, manager: true, accountant: false, programmer: false, sales: false, delivery: false, employee: true, user: false },
    { label: "المخزون", admin: true, manager: true, accountant: false, programmer: false, sales: false, delivery: true, employee: false, user: false },
    { label: "التوصيل", admin: true, manager: true, accountant: false, programmer: false, sales: false, delivery: true, employee: false, user: false },
    { label: "الموارد البشرية", admin: true, manager: true, accountant: false, programmer: false, sales: false, delivery: false, employee: false, user: false },
    { label: "الحضور والإجازات", admin: true, manager: true, accountant: true, programmer: true, sales: true, delivery: true, employee: true, user: false },
    { label: "الشات الداخلي", admin: true, manager: true, accountant: true, programmer: true, sales: true, delivery: true, employee: true, user: false },
    { label: "مهام التطوير", admin: true, manager: false, accountant: false, programmer: true, sales: false, delivery: false, employee: false, user: false },
    { label: "منشئ البوسترات", admin: true, manager: true, accountant: false, programmer: false, sales: true, delivery: false, employee: false, user: false },
    { label: "المساعد الذكي", admin: true, manager: true, accountant: true, programmer: true, sales: true, delivery: true, employee: true, user: false },
    { label: "التبرع والشهادات", admin: true, manager: true, accountant: true, programmer: true, sales: true, delivery: true, employee: true, user: true },
  ];

  const roleHeaders = [
    { value: "admin", label: "مدير", icon: Crown, gradient: "from-red-500 to-red-700" },
    { value: "manager", label: "تنفيذي", icon: Shield, gradient: "from-violet-500 to-violet-700" },
    { value: "accountant", label: "محاسب", icon: Calculator, gradient: "from-amber-500 to-amber-700" },
    { value: "programmer", label: "مبرمج", icon: Code2, gradient: "from-blue-500 to-blue-700" },
    { value: "sales", label: "مبيعات", icon: Megaphone, gradient: "from-pink-500 to-pink-700" },
    { value: "delivery", label: "توصيل", icon: Truck, gradient: "from-orange-500 to-orange-700" },
    { value: "employee", label: "موظف", icon: Briefcase, gradient: "from-emerald-500 to-emerald-700" },
    { value: "user", label: "مستخدم", icon: UserCheck, gradient: "from-slate-400 to-slate-600" },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
      <table className="w-full text-xs" dir="rtl">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="text-right py-3 px-4 font-bold text-muted-foreground w-48">الصلاحية / الميزة</th>
            {roleHeaders.map((r) => (
              <th key={r.value} className="py-3 px-2 text-center min-w-[72px]">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${r.gradient} flex items-center justify-center shadow-sm`}>
                    <r.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-[10px] text-muted-foreground">{r.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={f.label} className={`border-b border-border/30 transition-colors hover:bg-muted/20 ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
              <td className="py-2.5 px-4 font-medium text-foreground/80 text-xs">{f.label}</td>
              {roleHeaders.map((r) => (
                <td key={r.value} className="py-2.5 px-2 text-center">
                  {(f as any)[r.value] ? (
                    <div className="flex justify-center">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                        <XCircle className="w-3 h-3 text-red-300" />
                      </div>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"all" | "employees" | "donors">("all");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showResetPwd, setShowResetPwd] = useState<any>(null);
  const [showMatrix, setShowMatrix] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newPassword, setNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const { data: allUsers = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const filtered = useMemo(() => {
    let list = allUsers;
    if (tab === "employees") list = list.filter((u) => u.role && u.role !== "user");
    if (tab === "donors") list = list.filter((u) => !u.role || u.role === "user");
    if (filterRole !== "all") list = list.filter((u) => u.role === filterRole);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.mobile?.includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          getRoleConfig(u.role).label.includes(q)
      );
    }
    return list;
  }, [allUsers, tab, filterRole, search]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allUsers.forEach((u) => { counts[u.role || "user"] = (counts[u.role || "user"] || 0) + 1; });
    return counts;
  }, [allUsers]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/employees", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "فشل الإضافة");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "✓ تم إضافة المستخدم بنجاح" });
      setShowAddDialog(false);
      setForm(emptyForm);
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      if (!res.ok) throw new Error("فشل التحديث");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "✓ تم تحديث المستخدم بنجاح" });
      setEditingUser(null);
    },
    onError: () => toast({ title: "خطأ", description: "فشل التحديث", variant: "destructive" }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/reset-password`, { password });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "فشل إعادة التعيين");
      }
    },
    onSuccess: () => {
      toast({ title: "✓ تم تغيير كلمة المرور" });
      setShowResetPwd(null);
      setNewPassword("");
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`, {});
      if (!res.ok) throw new Error("فشل الحذف");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "✓ تم حذف المستخدم" });
    },
    onError: () => toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, { isActive });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }),
    onError: () => toast({ title: "خطأ", description: "فشل التحديث", variant: "destructive" }),
  });

  const openEdit = (u: any) => {
    setEditForm({
      name: u.name || "",
      email: u.email || "",
      mobile: u.mobile || "",
      role: u.role || "user",
      department: u.department || "",
    });
    setEditingUser(u);
  };

  const staffCount = allUsers.filter((u) => u.role && u.role !== "user").length;
  const donorCount = allUsers.filter((u) => !u.role || u.role === "user").length;
  const activeCount = allUsers.filter((u) => u.isActive !== false).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                <Users className="h-4 w-4 text-white" />
              </div>
              إدارة المستخدمين والصلاحيات
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {allUsers.length} مستخدم إجمالاً — {staffCount} موظف — {donorCount} متبرع
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMatrix(!showMatrix)}
            className="gap-2 text-xs border-primary/20 hover:border-primary"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            {showMatrix ? "إخفاء" : "عرض"} مصفوفة الصلاحيات
          </Button>
          <Button onClick={() => { setForm(emptyForm); setShowAddDialog(true); }} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي المستخدمين", value: allUsers.length, icon: Users, gradient: "from-slate-600 to-slate-800" },
          { label: "الموظفون والإدارة", value: staffCount, icon: Briefcase, gradient: "from-primary to-primary/70" },
          { label: "المتبرعون", value: donorCount, icon: UserCheck, gradient: "from-emerald-500 to-emerald-700" },
          { label: "الحسابات النشطة", value: activeCount, icon: Activity, gradient: "from-blue-500 to-blue-700" },
        ].map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${s.gradient} text-white shadow-md`}>
            <div className="absolute -left-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-black mt-1">{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ROLES.filter((r) => (roleCounts[r.value] || 0) > 0).map((r) => (
          <button
            key={r.value}
            onClick={() => setFilterRole(filterRole === r.value ? "all" : r.value)}
            className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-right ${
              filterRole === r.value
                ? `${r.bg} ${r.border} border-2 shadow-sm`
                : "border-border/40 hover:border-border bg-card hover:bg-muted/30"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${r.gradient} flex items-center justify-center shadow-sm shrink-0`}>
              <r.icon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{r.label}</p>
              <p className="text-lg font-black leading-tight">{roleCounts[r.value] || 0}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Permission Matrix (toggle) */}
      {showMatrix && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-sm">مصفوفة الصلاحيات الكاملة</h2>
            <Badge variant="outline" className="text-[10px]">شاملة لجميع الأدوار</Badge>
          </div>
          <PermissionMatrix />
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-auto">
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs px-3">الكل ({allUsers.length})</TabsTrigger>
            <TabsTrigger value="employees" className="text-xs px-3">الموظفون ({staffCount})</TabsTrigger>
            <TabsTrigger value="donors" className="text-xs px-3">المتبرعون ({donorCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم، الجوال، أو الإيميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 h-9 text-sm"
              data-testid="input-search-users"
            />
          </div>
          {filterRole !== "all" && (
            <Button variant="outline" size="sm" onClick={() => setFilterRole("all")} className="gap-1 text-xs h-9">
              <XCircle className="h-3 w-3" />
              إلغاء الفلتر
            </Button>
          )}
          <Badge variant="outline" className="text-xs shrink-0">
            {filtered.length} نتيجة
          </Badge>
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جاري تحميل المستخدمين...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-16 text-center text-muted-foreground">
            <Users className="h-14 w-14 mx-auto mb-3 opacity-15" />
            <p className="font-bold text-base">لا يوجد مستخدمون</p>
            <p className="text-sm mt-1">جرب تغيير معايير البحث أو الفلتر</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((u: any) => {
            const cfg = getRoleConfig(u.role);
            const uid = u.id || u._id;
            const isActive = u.isActive !== false;
            return (
              <div
                key={uid}
                className={`relative group flex items-center gap-4 p-4 rounded-2xl border bg-card transition-all hover:shadow-md hover:-translate-y-px ${
                  !isActive ? "opacity-60 border-red-200 bg-red-50/30" : "border-border/50 hover:border-primary/20"
                }`}
                data-testid={`row-user-${uid}`}
              >
                {/* Status indicator */}
                <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-400"}`} />

                <UserAvatar name={u.name || "؟"} role={u.role} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm truncate">{u.name || "—"}</p>
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                      <cfg.icon className="w-2.5 h-2.5" />
                      {cfg.label}
                    </div>
                    {!isActive && (
                      <Badge variant="destructive" className="text-[9px] py-0">موقوف</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    {u.mobile && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />{u.mobile}
                      </span>
                    )}
                    {u.email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />{u.email}
                      </span>
                    )}
                    {u.department && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />{u.department}
                      </span>
                    )}
                    {u.totalDonations !== undefined && Number(u.totalDonations) > 0 && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {Number(u.totalDonations).toLocaleString("ar-SA")} ر.س
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Active toggle */}
                  <Switch
                    checked={isActive}
                    onCheckedChange={(val) => toggleActiveMutation.mutate({ id: uid, isActive: val })}
                    className="scale-75"
                    title={isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
                    data-testid={`toggle-active-${uid}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg"
                    onClick={() => openEdit(u)}
                    title="تعديل المستخدم"
                    data-testid={`button-edit-${uid}`}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-amber-50 hover:text-amber-700 rounded-lg"
                    onClick={() => { setShowResetPwd(u); setNewPassword(""); }}
                    title="إعادة تعيين كلمة المرور"
                    data-testid={`button-reset-pwd-${uid}`}
                  >
                    <Key className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600 rounded-lg"
                    onClick={() => {
                      if (confirm(`هل تريد حذف ${u.name} نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
                        deleteMutation.mutate(uid);
                      }
                    }}
                    title="حذف المستخدم"
                    data-testid={`button-delete-${uid}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add User Dialog ── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              إضافة مستخدم جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">الاسم الكامل *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="محمد أحمد" data-testid="input-add-name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">رقم الجوال *</Label>
                <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="05XXXXXXXX" dir="ltr" data-testid="input-add-mobile" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">البريد الإلكتروني</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" dir="ltr" data-testid="input-add-email" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">القسم / الإدارة</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="المالية، التسويق..." data-testid="input-add-department" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">كلمة المرور *</Label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10"
                  data-testid="input-add-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">الدور الوظيفي *</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.filter((r) => r.value !== "user").map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all ${
                      form.role === r.value
                        ? `${r.bg} ${r.border} border-2 shadow-sm`
                        : "border-border/40 hover:border-border"
                    }`}
                    data-testid={`button-role-${r.value}`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${r.gradient} flex items-center justify-center shrink-0`}>
                      <r.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{r.label}</p>
                      <p className="text-[10px] text-muted-foreground">{r.labelEn}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            {/* Permissions preview */}
            {form.role && (
              <div className={`rounded-xl p-3 border ${getRoleConfig(form.role).bg} ${getRoleConfig(form.role).border}`}>
                <p className={`text-xs font-bold mb-2 ${getRoleConfig(form.role).color}`}>صلاحيات هذا الدور:</p>
                <div className="flex flex-wrap gap-1.5">
                  {getRoleConfig(form.role).permissions.map((p) => (
                    <span key={p} className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/70 border ${getRoleConfig(form.role).border} ${getRoleConfig(form.role).color}`}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                className="flex-1"
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.name || !form.mobile || !form.password}
                data-testid="button-add-submit"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Plus className="h-4 w-4 ml-2" />}
                إضافة المستخدم
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Dialog ── */}
      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingUser && <UserAvatar name={editingUser.name || "؟"} role={editingUser.role} size="sm" />}
              تعديل: {editingUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">الاسم</Label>
                <Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} data-testid="input-edit-name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">الجوال</Label>
                <Input value={editForm.mobile || ""} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} dir="ltr" data-testid="input-edit-mobile" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">البريد الإلكتروني</Label>
              <Input value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} dir="ltr" data-testid="input-edit-email" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">القسم</Label>
              <Input value={editForm.department || ""} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} data-testid="input-edit-department" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">الدور الوظيفي</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, role: r.value })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all ${
                      editForm.role === r.value
                        ? `${r.bg} ${r.border} border-2 shadow-sm`
                        : "border-border/40 hover:border-border"
                    }`}
                    data-testid={`button-edit-role-${r.value}`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${r.gradient} flex items-center justify-center shrink-0`}>
                      <r.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{r.label}</p>
                      <p className="text-[10px] text-muted-foreground">{r.labelEn}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {/* Permissions preview */}
            {editForm.role && (
              <div className={`rounded-xl p-3 border ${getRoleConfig(editForm.role).bg} ${getRoleConfig(editForm.role).border}`}>
                <p className={`text-xs font-bold mb-2 ${getRoleConfig(editForm.role).color}`}>صلاحيات هذا الدور:</p>
                <div className="flex flex-wrap gap-1.5">
                  {getRoleConfig(editForm.role).permissions.map((p) => (
                    <span key={p} className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/70 border ${getRoleConfig(editForm.role).border} ${getRoleConfig(editForm.role).color}`}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                className="flex-1"
                onClick={() => updateMutation.mutate({ id: editingUser.id || editingUser._id, data: editForm })}
                disabled={updateMutation.isPending}
                data-testid="button-edit-submit"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <CheckCircle2 className="h-4 w-4 ml-2" />}
                حفظ التعديلات
              </Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Reset Password Dialog ── */}
      <Dialog open={!!showResetPwd} onOpenChange={(o) => !o && setShowResetPwd(null)}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Key className="h-4 w-4 text-amber-700" />
              </div>
              إعادة تعيين كلمة المرور
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
              {showResetPwd && <UserAvatar name={showResetPwd.name || "؟"} role={showResetPwd.role} size="sm" />}
              <div>
                <p className="text-sm font-bold">{showResetPwd?.name}</p>
                <p className="text-xs text-muted-foreground">{showResetPwd?.mobile}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">سيتم تغيير كلمة المرور فوراً. تأكد من إبلاغ المستخدم بالكلمة الجديدة.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  className="pl-10"
                  data-testid="input-new-password"
                />
                <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                onClick={() => resetPasswordMutation.mutate({ id: showResetPwd.id || showResetPwd._id, password: newPassword })}
                disabled={resetPasswordMutation.isPending || newPassword.length < 6}
                data-testid="button-reset-pwd-submit"
              >
                {resetPasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Lock className="h-4 w-4 ml-2" />}
                تغيير كلمة المرور
              </Button>
              <Button variant="outline" onClick={() => setShowResetPwd(null)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
