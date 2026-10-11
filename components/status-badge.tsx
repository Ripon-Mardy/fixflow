import type { RequestPriority, RequestStatus, Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { PRIORITY_META, ROLE_META, STATUS_META } from "@/lib/constants";

const base =
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function StatusBadge({
  status,
  className,
}: {
  status: RequestStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return <span className={cn(base, meta.className, className)}>{meta.label}</span>;
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: RequestPriority;
  className?: string;
}) {
  const meta = PRIORITY_META[priority];
  return (
    <span className={cn(base, meta.className, className)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function RoleBadge({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  const meta = ROLE_META[role];
  return <span className={cn(base, meta.className, className)}>{meta.label}</span>;
}
