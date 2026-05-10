import { create } from "zustand";
import type { ScreenId } from "@/types/inspectra";

type Toast = {
  id: string;
  type: "success" | "warning" | "critical" | "intervention" | "crash";
  title: string;
  detail: string;
};

type InspectraStore = {
  activeScreen: ScreenId;
  command: string;
  selectedReportId: string;
  selectedViewport: "desktop" | "tablet" | "mobile";
  sessionPaused: boolean;
  reasoningCursor: number;
  liveFrame: string | null;
  selectedSessionId: string | null;
  selectedProjectId: string | null;
  toasts: Toast[];
  setActiveScreen: (screen: ScreenId) => void;
  setCommand: (command: string) => void;
  setSelectedReportId: (id: string) => void;
  setSelectedViewport: (viewport: "desktop" | "tablet" | "mobile") => void;
  setSessionPaused: (paused: boolean) => void;
  setLiveFrame: (frame: string | null) => void;
  setSelectedSessionId: (id: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
  advanceReasoning: () => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

export const useInspectraStore = create<InspectraStore>((set) => ({
  activeScreen: "dashboard",
  command: "Test checkout flow and report mobile UI issues",
  selectedReportId: "checkout-mobile-regression",
  selectedViewport: "desktop",
  sessionPaused: false,
  reasoningCursor: 0,
  liveFrame: null,
  selectedSessionId: null,
  selectedProjectId: null,
  toasts: [],
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setCommand: (command) => set({ command }),
  setSelectedReportId: (id) => set({ selectedReportId: id }),
  setSelectedViewport: (viewport) => set({ selectedViewport: viewport }),
  setSessionPaused: (paused) => set({ sessionPaused: paused }),
  setLiveFrame: (frame) => set({ liveFrame: frame }),
  setSelectedSessionId: (id) => set({ selectedSessionId: id }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  advanceReasoning: () =>
    set((state) => ({ reasoningCursor: state.reasoningCursor + 1 })),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: crypto.randomUUID(),
        },
      ].slice(-4),
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
