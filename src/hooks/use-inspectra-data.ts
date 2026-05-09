import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inspectraApi } from "@/services/inspectra-api";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => inspectraApi.dashboard(),
    refetchInterval: 5000,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => inspectraApi.projects(),
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => inspectraApi.reports(),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => inspectraApi.getReport(id),
    enabled: !!id,
  });
}

export function useLiveSession(id: string) {
  return useQuery({
    queryKey: ["session", id],
    queryFn: () => inspectraApi.liveSession(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 2000;
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, prompt }: { projectId: string; prompt: string }) =>
      inspectraApi.createSession(projectId, prompt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
