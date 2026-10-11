import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon: IconCmp,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { value: string; direction: "up" | "down"; good?: boolean };
  icon?: React.ElementType;
  tone?: "default" | "primary" | "danger" | "success";
}) {
  const toneClass = {
    default: "text-muted-foreground",
    primary: "text-primary",
    danger: "text-red-600 dark:text-red-400",
    success: "text-emerald-600 dark:text-emerald-400",
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {IconCmp && <IconCmp className={cn("size-4", toneClass)} />}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend.good ?? trend.direction === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {trend.value}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
