"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "icon";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "border-cyan/60 bg-gradient-to-r from-cyan to-green text-[#061017] shadow-[0_0_32px_rgba(90,215,255,0.22)] hover:brightness-110",
          variant === "secondary" &&
            "border-white/10 bg-white/[0.06] text-foreground hover:border-cyan/40 hover:bg-cyan/10",
          variant === "ghost" &&
            "border-transparent bg-transparent text-muted hover:border-white/10 hover:bg-white/[0.06] hover:text-foreground",
          variant === "danger" &&
            "border-red/40 bg-red/10 text-red hover:bg-red/15",
          variant === "icon" &&
            "size-10 border-white/10 bg-white/[0.06] p-0 text-muted hover:border-cyan/40 hover:text-cyan",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
