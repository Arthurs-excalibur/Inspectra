"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle2, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useInspectraStore } from "@/stores/use-inspectra-store";

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
  intervention: Bell,
  crash: XCircle,
};

export function ToastStack() {
  const toasts = useInspectraStore((state) => state.toasts);
  const dismissToast = useInspectraStore((state) => state.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 4200),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [dismissToast, toasts]);

  return (
    <div className="fixed bottom-5 right-5 z-50 grid w-[min(360px,calc(100vw-40px))] gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="rounded-lg border border-cyan/30 bg-[var(--panel-strong)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl"
              role="status"
            >
              <div className="flex gap-3">
                <Icon className="mt-0.5 size-5 text-cyan" />
                <div>
                  <strong className="block text-sm">{toast.title}</strong>
                  <span className="text-sm text-muted">{toast.detail}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
