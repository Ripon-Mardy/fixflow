import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Phone,
  Siren,
} from "lucide-react";
import type { getTechnicianDashboard } from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/empty-state";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/utils";

type Data = Awaited<ReturnType<typeof getTechnicianDashboard>>;

export function TechnicianDashboard({
  firstName,
  data,
}: {
  firstName: string;
  data: Data;
}) {
  const { stats, jobs } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Your jobs, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything assigned to you, most urgent first.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned to me" value={stats.assigned} icon={ClipboardList} />
        <StatCard label="Urgent jobs" value={stats.urgent} icon={Siren} tone="danger" />
        <StatCard label="Today's jobs" value={stats.todays} icon={CalendarClock} tone="primary" />
        <StatCard label="Completed jobs" value={stats.completed} icon={CheckCircle2} tone="success" />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Assigned to me</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <EmptyState
              className="border-0"
              icon={CheckCircle2}
              title="Your team has no assigned jobs."
              description="When a manager assigns you a request, it will appear here with everything you need."
            />
          ) : (
            <ul className="divide-y">
              {jobs.map((j) => (
                <li key={j.id}>
                  <Link
                    href={`/dashboard/requests/${j.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={j.priority} />
                      <StatusBadge status={j.status} />
                      <span className="text-xs text-muted-foreground">
                        {j.reference} · {j.category.name}
                      </span>
                    </div>
                    <p className="mt-1.5 font-medium">{j.title}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" />
                        {j.property.name}
                        {j.unit ? `, ${j.unit.label}` : ""} · {j.property.city}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3" />
                        {j.tenant.name}
                        {j.tenant.phone ? ` · ${j.tenant.phone}` : ""}
                      </span>
                      {j.scheduledFor && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="size-3" />
                          {formatDateTime(j.scheduledFor)}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
