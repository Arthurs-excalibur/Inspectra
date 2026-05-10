import { useAuthStore } from "@/stores/use-auth-store";

const API_BASE = "http://localhost:4000";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || "API Error");
  }

  return response.json();
}

export const inspectraApi = {
  auth: {
    login: async (dto: any) => {
      const data = await fetchApi<{ user: any; accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(dto),
      });
      return { user: data.user, token: data.accessToken };
    },
    register: async (dto: any) => {
      const data = await fetchApi<{ user: any; accessToken: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(dto),
      });
      return { user: data.user, token: data.accessToken };
    },
    me: () => fetchApi("/auth/me"),
  },
  dashboard: () => fetchApi("/dashboard"),
  diagnostics: () => fetchApi("/health/diagnostics"),
  projects: () => fetchApi("/projects"),
  createProject: (dto: any) => fetchApi("/projects", {
    method: "POST",
    body: JSON.stringify(dto),
  }),
  liveSession: (sessionId: string) => fetchApi(`/sessions/${sessionId}`),
  reports: () => fetchApi("/reports"),
  getReport: (id: string) => fetchApi(`/reports/${id}`),
  createSession: (projectId: string, prompt: string) => 
    fetchApi("/sessions/start", {
      method: "POST",
      body: JSON.stringify({ projectId, prompt }),
    }),
};
