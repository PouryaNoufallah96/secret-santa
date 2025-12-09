"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-christmas-red dark:bg-night-sky transition-bg overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `pointer-events-none absolute -inset-[10px] opacity-50 blur-[10px] invert filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--christmas-red)_10%,var(--berry-red)_15%,var(--christmas-gold)_20%,var(--berry-red)_25%,var(--christmas-red)_30%)] [--dark-aurora:repeating-linear-gradient(100deg,var(--night-sky)_10%,var(--pine-dark)_15%,var(--christmas-gold)_20%,var(--pine-dark)_25%,var(--night-sky)_30%)] [background-image:var(--aurora)] [background-position:50%_50%,50%_50%] [background-size:300%,200%] after:absolute after:inset-0 after:animate-aurora after:mix-blend-difference after:content-[''] after:[background-attachment:fixed] after:[background-image:var(--aurora)] after:[background-size:200%,100%] dark:invert-0 dark:[background-image:var(--dark-aurora)] after:dark:[background-image:var(--dark-aurora)]`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
          )}
        />
      </div>
      {children}
    </div>
  );
}
