import { cn } from "@/lib/utils";

export function EmptyState({
  icon: IconCmp,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-14 text-center",
        className,
      )}
    >
      {IconCmp && (
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <IconCmp className="size-5" />
        </span>
      )}
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
