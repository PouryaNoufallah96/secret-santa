"use client";

import { cn } from "@/lib/utils";

interface SnowflakeSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function SnowflakeSpinner({ className, size = "md" }: SnowflakeSpinnerProps) {
  return (
    <svg
      className={cn("animate-spin text-christmas-red dark:text-christmas-gold", sizeClasses[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Snowflake shape */}
      <g fill="currentColor">
        {/* Vertical line */}
        <rect x="11" y="1" width="2" height="22" rx="1" />
        {/* Horizontal line */}
        <rect x="1" y="11" width="22" height="2" rx="1" />
        {/* Diagonal line 1 */}
        <rect x="11" y="1" width="2" height="22" rx="1" transform="rotate(45 12 12)" />
        {/* Diagonal line 2 */}
        <rect x="11" y="1" width="2" height="22" rx="1" transform="rotate(-45 12 12)" />
        {/* Center circle */}
        <circle cx="12" cy="12" r="2" />
        {/* Top branch */}
        <polygon points="12,3 10,6 14,6" />
        {/* Bottom branch */}
        <polygon points="12,21 10,18 14,18" />
        {/* Left branch */}
        <polygon points="3,12 6,10 6,14" />
        {/* Right branch */}
        <polygon points="21,12 18,10 18,14" />
      </g>
    </svg>
  );
}

export function SnowflakeLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <SnowflakeSpinner size="lg" />
      <p className="text-muted-foreground font-medium">{text}</p>
    </div>
  );
}
