import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Loader2, Users, Plus, Edit, Trash2, Search, Shield,
  User, Phone, Mail, CheckCircle2, XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ROLES = [
  { value: "user",     label: "مستخدم",        color: "outline" },
  { value: "employee", label: "موظف",            color: "secondary" },
  { value: "delivery", label: "مندوب توصيل",    color: "default" },
  { value: "accountant",label: "محاسب",          color: "secondary" },
  { value: "manager",  label: "مدير",            color: "default" },
  { value: "admin",    label: "مدير عام",        color: "destructive" },
];

const getRoleLabel = (role: string) => ROLES.find((r) => r.value === role)?.label || role;
const getRoleColor = (role: string): any => {
  const map: any = { admin: "destructive", manager: "default", employee: "secondary", delivery: "default", user: "outline", accountant: "secondary" };
  return map[role] || "outline";
};

const emptyForm = { name: "", mobile: "", email: "", password: "", role: "employee" };

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: employees, isLoading } = useQuery<any[]>({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const res = await fetch("/api/employees", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const { data: allUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/employees", data);
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "✓ تم إضافة المستخدم بنجاح" });
      setShowDialog(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "خطأ", description: "فشل إضافة المستخدم", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await apiRequest("PATCH", `/api/employees/${id}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "✓ تم تحديث الصلاحية" });
      setEditingUser(null);
    },
    onError: () => toast({ title: "خطأ", description: "فشل التحديث", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/employees/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "✓ تم حذف المستخدم" });
    },
    onError: () => toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" }),
  });

  const filtered = (employees || []).filter(
    (u) =>
      u.name?.includes(search) ||
      u.mobile?.includes(search) ||
      u.email?.includes(search) ||
      getRoleLabel(u.role).includes(search)
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-xl font-black">إدارة المستخدمين</h1>
              <p className="text-xs text-muted-foreground">إدارة الموظفين والصلاحيات</p>
            </div>
          </div>
        </div>
        <Button onClick={() => { setForm(emptyForm); setShowDialog(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مستخدم
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الجوال..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {filtered.length} مستخدم
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold">لا يوجد مستخدمون</p>
                <p className="text-sm mt-1">أضف مستخدماً جديداً باستخدام الزر أعلاه</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((u: any) => (
              <Card key={u.id || u._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {u.name?.[0] || "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{u.name}</p>
                          <Badge variant={getRoleColor(u.role)} className="text-[10px]">
                            {getRoleLabel(u.role)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {u.mobile && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {u.mobile}
                            </span>
                          )}
                          {u.email && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {u.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setEditingUser({ ...u, newRole: u.role })}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        تعديل الدور
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`هل تريد حذف ${u.name}؟`)) {
                            deleteMutation.mutate(u.id || u._id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم الكامل</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="محمد أحمد" />
            </div>
            <div className="space-y-2">
              <Label>رقم الجوال</Label>
              <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="05XXXXXXXX" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني (اختياري)</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>الدور الوظيفي</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.filter((r) => r.value !== "user").map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                إضافة
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تعديل دور: {editingUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={editingUser?.newRole || editingUser?.role} onValueChange={(v) => setEditingUser({ ...editingUser, newRole: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => updateMutation.mutate({ id: editingUser.id || editingUser._id, role: editingUser.newRole })} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                حفظ
              </Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
