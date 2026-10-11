import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import type { RequestPriority, RequestStatus } from "@prisma/client";

export type CompactRequest = {
  id: string;
  reference: string;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: Date;
  property: { name: string };
  unit: { label: string } | null;
  technician?: { name: string } | null;
};

/** A single request as a tappable row — used in dashboards and mobile lists. */
export function RequestRowLink({ request }: { request: CompactRequest }) {
  return (
    <Link
      href={`/dashboard/requests/${request.id}`}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-accent/50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{request.title}</p>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {request.reference} · {request.property.name}
          {request.unit ? ` · ${request.unit.label}` : ""}
          {request.technician ? ` · ${request.technician.name}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusBadge status={request.status} />
        <span className="flex items-center gap-2">
          <PriorityBadge priority={request.priority} />
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {formatDate(request.createdAt)}
          </span>
        </span>
      </div>
    </Link>
  );
}
