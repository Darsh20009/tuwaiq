import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type LoginRequest } from "@shared/routes";
import { type InsertUser, type User as SchemaUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export type User = SchemaUser & { role: string };

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
    staleTime: Infinity, // User session rarely changes unexpectedly
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          const error = await res.json();
          throw new Error(error.message || "بيانات الدخول غير صحيحة");
        }
        throw new Error("حدث خطأ أثناء تسجيل الدخول");
      }

      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك، ${data.name}`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "بيانات التسجيل غير صالحة");
        }
        throw new Error("حدث خطأ أثناء إنشاء الحساب");
      }

      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Auto login after register usually, or redirect to login.
      // Assuming auto-login behavior or just setting user state if backend logs in on register.
      // If backend doesn't auto-login, we might need to call login separately or ask user to login.
      // For now, let's assume we ask user to login or redirect.
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "يمكنك الآن تسجيل الدخول",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في التسجيل",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, {
        method: api.auth.logout.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      toast({
        title: "تم تسجيل الخروج",
      });
    },
  });

  const togglePrivacyMutation = useMutation({
    mutationFn: async (isPublicDonor: boolean) => {
      const res = await fetch(api.users.togglePrivacy.path, {
        method: api.users.togglePrivacy.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublicDonor }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update privacy settings");
      return api.users.togglePrivacy.responses[200].parse(await res.json());
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData([api.auth.me.path], updatedUser);
      toast({
        title: "تم تحديث الخصوصية",
        description: updatedUser.isPublicDonor 
          ? "سيظهر اسمك في قائمة الشرف" 
          : "تم إخفاء اسمك من قائمة الشرف",
      });
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    togglePrivacy: togglePrivacyMutation.mutateAsync,
    isPending: loginMutation.isPending || registerMutation.isPending,
  };
}
