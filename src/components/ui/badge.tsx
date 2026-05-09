import { cn } from "@/lib/utils";
import type { Status } from "@/types/inspectra";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Status | "critical" | "info";
};

export function Badge({ className, tone = "idle", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-medium",
        tone === "success" && "border-green/35 bg-green/10 text-green",
        tone === "warning" && "border-amber/35 bg-amber/10 text-amber",
        (tone === "error" || tone === "critical") &&
          "border-red/35 bg-red/10 text-red",
        tone === "running" && "border-cyan/35 bg-cyan/10 text-cyan",
        tone === "info" && "border-blue/35 bg-blue/10 text-blue",
        tone === "idle" && "border-white/10 bg-white/[0.04] text-muted",
        className,
      )}
      {...props}
    />
  );
}
