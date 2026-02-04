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
      if (!res.ok) throw new Error("Failed to fetch donations");
      return api.donations.list.responses[200].parse(await res.json());
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: InsertDonation) => {
      const res = await fetch(api.donations.create.path, {
        method: api.donations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Please login to donate");
        throw new Error("Failed to initiate donation");
      }

      return api.donations.create.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Redirect to payment gateway (or simulation page)
      window.location.href = data.redirectUrl;
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
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
