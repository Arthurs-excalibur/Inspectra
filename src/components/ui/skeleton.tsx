import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-white/[0.05] via-cyan/10 to-white/[0.05]",
        className,
      )}
      {...props}
    />
  );
}
