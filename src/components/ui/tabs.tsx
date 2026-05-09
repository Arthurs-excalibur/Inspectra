"use client";

import { cn } from "@/lib/utils";

export function TabButton({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "min-h-9 rounded-lg border px-3 text-sm font-medium transition",
        active
          ? "border-cyan/40 bg-cyan/10 text-cyan"
          : "border-transparent text-muted hover:border-white/10 hover:bg-white/[0.06] hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
