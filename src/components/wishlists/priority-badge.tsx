"use client";

import { Star, StarHalf, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Priority = "low" | "medium" | "high";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
  showLabel?: boolean;
}

const priorityConfig: Record<
  Priority,
  { label: string; className: string; icon: typeof Star }
> = {
  high: {
    label: "High Priority",
    className: "bg-christmas-red/10 text-christmas-red border-christmas-red/30",
    icon: Star,
  },
  medium: {
    label: "Medium",
    className: "bg-christmas-gold/10 text-christmas-gold border-christmas-gold/30",
    icon: StarHalf,
  },
  low: {
    label: "Low Priority",
    className: "bg-muted text-muted-foreground border-muted",
    icon: Circle,
  },
};

export function PriorityBadge({
  priority,
  className,
  showLabel = true,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      <Icon className="h-3 w-3 mr-1" />
      {showLabel && config.label}
    </Badge>
  );
}

export function PrioritySelector({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (priority: Priority) => void;
}) {
  return (
    <div className="flex gap-2">
      {(["low", "medium", "high"] as const).map((priority) => {
        const config = priorityConfig[priority];
        const Icon = config.icon;
        const isSelected = value === priority;

        return (
          <button
            key={priority}
            type="button"
            onClick={() => onChange(priority)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm transition-colors",
              isSelected
                ? config.className
                : "border-input hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
