import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Code2, CheckCircle2, Clock, AlertCircle, Play, Loader2, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "عالية", color: "bg-red-100 text-red-700 border-red-200" },
  medium: { label: "متوسطة", color: "bg-amber-100 text-amber-700 border-amber-200" },
  low: { label: "منخفضة", color: "bg-blue-100 text-blue-700 border-blue-200" },
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "قيد الانتظار", color: "bg-gray-100 text-gray-700", icon: Clock },
  in_progress: { label: "جارٍ العمل", color: "bg-blue-100 text-blue-700", icon: Play },
  done: { label: "مكتملة", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  blocked: { label: "معلقة", color: "bg-red-100 text-red-700", icon: AlertCircle },
};

export default function ProgrammerDashboard() {
  const { user } = useAuth() as any;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: tasks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/system-tasks"],
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/system-tasks/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-tasks"] });
      toast({ title: "✓ تم تحديث حالة المهمة" });
    },
  });

  const filtered = (tasks as any[]).filter(t => filter === "all" || t.status === filter);
  const counts = {
    all: tasks.length,
    pending: (tasks as any[]).filter(t => t.status === "pending").length,
    in_progress: (tasks as any[]).filter(t => t.status === "in_progress").length,
    done: (tasks as any[]).filter(t => t.status === "done").length,
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <Code2 className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-xl font-black">لوحة المبرمج</h1>
          <p className="text-xs text-muted-foreground">مهام التطوير والتعديلات البرمجية</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "all", label: "الكل", count: counts.all, color: "text-gray-600 bg-gray-50" },
          { key: "pending", label: "قيد الانتظار", count: counts.pending, color: "text-amber-600 bg-amber-50" },
          { key: "in_progress", label: "جارٍ العمل", count: counts.in_progress, color: "text-blue-600 bg-blue-50" },
          { key: "done", label: "مكتملة", count: counts.done, color: "text-green-600 bg-green-50" },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`rounded-xl p-4 text-right transition-all border-2 ${filter === s.key ? "border-primary bg-primary/5" : "border-transparent " + s.color}`}
          >
            <p className="text-2xl font-black">{s.count}</p>
            <p className="text-xs font-bold mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Terminal className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">لا توجد مهام في هذا التصنيف</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((task: any) => {
            const st = statusConfig[task.status] || statusConfig.pending;
            const pr = priorityConfig[task.priority] || priorityConfig.medium;
            const StatusIcon = st.icon;
            return (
              <Card key={task.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Code2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-black text-sm">{task.title}</h3>
                        <div className="flex gap-2 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${pr.color}`}>{pr.label}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${st.color}`}>
                            <StatusIcon className="h-3 w-3 inline ml-1" />{st.label}
                          </span>
                        </div>
                      </div>
                      {task.description && <p className="text-xs text-muted-foreground mb-3">{task.description}</p>}
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground">بواسطة: {task.createdBy}</p>
                        <div className="flex gap-2">
                          {task.status === "pending" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-blue-600 border-blue-200"
                              onClick={() => statusMutation.mutate({ id: task.id, status: "in_progress" })}
                              disabled={statusMutation.isPending}
                            >
                              <Play className="h-3 w-3" /> ابدأ العمل
                            </Button>
                          )}
                          {task.status === "in_progress" && (
                            <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700"
                              onClick={() => statusMutation.mutate({ id: task.id, status: "done" })}
                              disabled={statusMutation.isPending}
                            >
                              <CheckCircle2 className="h-3 w-3" /> أنجزت المهمة
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
