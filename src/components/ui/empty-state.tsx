import { Gift, Snowflake, TreePine, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "festive";
}

export function EmptyState({
  icon: Icon = Gift,
  title,
  description,
  children,
  className,
  variant = "default",
}: EmptyStateProps) {
  if (variant === "festive") {
    return (
      <div
        className={cn(
          "text-center py-12 px-4 border border-dashed rounded-lg bg-gradient-to-b from-cream/50 to-transparent dark:from-pine-dark/30 dark:to-transparent",
          className
        )}
      >
        {/* Festive decoration */}
        <div className="flex justify-center items-end gap-2 mb-4">
          <TreePine className="h-8 w-8 text-christmas-green opacity-70" />
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-christmas-red/10 dark:bg-christmas-red/20">
            <Icon className="h-8 w-8 text-christmas-red dark:text-christmas-gold" />
          </div>
          <TreePine className="h-8 w-8 text-christmas-green opacity-70" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold font-nunito mb-2 text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>

        {children}

        {/* Decorative snowflakes */}
        <div className="mt-8 flex justify-center gap-3 opacity-20">
          <Snowflake className="h-3 w-3 text-christmas-red" />
          <Snowflake className="h-4 w-4 text-christmas-gold" />
          <Snowflake className="h-3 w-3 text-christmas-green" />
          <Snowflake className="h-4 w-4 text-christmas-gold" />
          <Snowflake className="h-3 w-3 text-christmas-red" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "text-center py-12 px-4 border border-dashed rounded-lg",
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      {children}
    </div>
  );
}
