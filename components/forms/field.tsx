import { cn } from "@/lib/utils";

/** Inline validation message. Renders nothing when there is no error. */
export function FieldError({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p className={cn("text-xs font-medium text-destructive", className)}>
      {children}
    </p>
  );
}
