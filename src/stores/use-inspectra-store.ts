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
  toasts: Toast[];
  setActiveScreen: (screen: ScreenId) => void;
  setCommand: (command: string) => void;
  setSelectedReportId: (id: string) => void;
  setSelectedViewport: (viewport: "desktop" | "tablet" | "mobile") => void;
  setSessionPaused: (paused: boolean) => void;
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
  toasts: [],
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setCommand: (command) => set({ command }),
  setSelectedReportId: (id) => set({ selectedReportId: id }),
  setSelectedViewport: (viewport) => set({ selectedViewport: viewport }),
  setSessionPaused: (paused) => set({ sessionPaused: paused }),
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
