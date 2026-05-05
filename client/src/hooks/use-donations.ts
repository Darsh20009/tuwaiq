import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertDonation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useDonations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: donations, isLoading } = useQuery({
    queryKey: [api.donations.list.path],
    queryFn: async () => {
      const res = await fetch(api.donations.list.path, { credentials: "include" });
      if (res.status === 401) return [];
      if (!res.ok) throw new Error("Failed to fetch donations");
      return api.donations.list.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: InsertDonation & { gateway?: string; donorName?: string }) => {
      const res = await fetch(api.donations.create.path, {
        method: api.donations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("يرجى تسجيل الدخول للتبرع");
        const body = await res.json().catch(() => ({}));
        const err: any = new Error(body?.message || "حدث خطأ أثناء إنشاء التبرع");
        err.code = body?.code;
        err.hint = body?.hint;
        throw err;
      }

      return await res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.donations.list.path] });

      if (data.simulation && data.redirectUrl) {
        const successUrl = data.redirectUrl;
        const failUrl = data.redirectUrl.replace("Response=A", "Response=D");
        const params = new URLSearchParams({
          successUrl,
          failUrl,
          amount: String(Math.round(Number((variables as any).amount || 0) * 100)),
          donorName: (variables as any).donorName || "فاعل خير",
        });
        window.location.href = `/payment-simulation?${params.toString()}`;
        return;
      }

      if (data.redirectUrl) {
        // Full-page redirect — the most reliable and professional approach
        window.location.href = data.redirectUrl;
      }
    },
    onError: (error: any) => {
      const isDisabled = error?.code === "METHOD_DISABLED";
      toast({
        title: isDisabled ? "طريقة الدفع غير متاحة" : "خطأ",
        description: error?.hint || (error as Error).message,
        variant: "destructive",
      });
    },
  });

  return {
    donations,
    isLoading,
    donate: createDonationMutation.mutateAsync,
    isDonating: createDonationMutation.isPending,
  };
}
