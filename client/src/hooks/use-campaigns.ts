import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Campaign, type InsertCampaign } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useCampaigns() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: campaigns, isLoading, error } = useQuery<Campaign[]>({
    queryKey: [api.campaigns.list.path],
    queryFn: async () => {
      const res = await fetch(api.campaigns.list.path);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.campaigns || data.data || []);
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: InsertCampaign) => {
      const res = await apiRequest(api.campaigns.create.method, api.campaigns.create.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      toast({ title: "Success", description: "Campaign created successfully" });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCampaign> }) => {
      const res = await apiRequest(
        api.campaigns.update.method,
        buildUrl(api.campaigns.update.path, { id }),
        data
      );
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      queryClient.invalidateQueries({ queryKey: [buildUrl(api.campaigns.get.path, { id: variables.id })] });
      toast({ title: "Success", description: "Campaign updated successfully" });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(api.campaigns.delete.method, buildUrl(api.campaigns.delete.path, { id }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      toast({ title: "Success", description: "Campaign deleted successfully" });
    },
  });

  return {
    campaigns,
    isLoading,
    error,
    createCampaign: createCampaignMutation.mutateAsync,
    updateCampaign: updateCampaignMutation.mutateAsync,
    deleteCampaign: deleteCampaignMutation.mutateAsync,
    isPending: createCampaignMutation.isPending || updateCampaignMutation.isPending || deleteCampaignMutation.isPending,
  };
}

export function useCampaign(id: string | undefined) {
  return useQuery<Campaign>({
    queryKey: [id ? buildUrl(api.campaigns.get.path, { id }) : null],
    enabled: !!id,
  });
}
