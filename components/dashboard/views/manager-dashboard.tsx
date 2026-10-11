import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  CircleDot,
  Siren,
  Wrench,
} from "lucide-react";
import type { getManagerDashboard } from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, timeAgo } from "@/lib/utils";

type Data = Awaited<ReturnType<typeof getManagerDashboard>>;

export function ManagerDashboard({
  firstName,
  data,
}: {
  firstName: string;
  data: Data;
}) {
  const { stats, recent, urgentList, properties, activity } = data;
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your properties.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Open Requests" value={stats.open} icon={CircleDot} />
        <StatCard
          label="Urgent"
          value={stats.urgent}
          icon={Siren}
          tone="danger"
          hint="emergencies open"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Wrench}
          tone="primary"
        />
        <StatCard
          label="Resolved This Month"
          value={stats.resolvedThisMonth}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Average Resolution"
          value={
            stats.avgResolutionDays != null
              ? `${stats.avgResolutionDays.toFixed(1)} days`
              : "—"
          }
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent requests */}
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b">
            <CardTitle>Recent requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/requests">
                View all <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <EmptyState
                className="border-0"
                icon={CircleDot}
                title="No maintenance requests yet."
                description="New requests from tenants will show up here."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead className="hidden md:table-cell">Property</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer">
                      <TableCell className="max-w-[220px]">
                        <Link
                          href={`/dashboard/requests/${r.id}`}
                          className="block"
                        >
                          <span className="block truncate font-medium">
                            {r.title}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {r.reference}
                            {r.technician ? ` · ${r.technician.name}` : ""}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{r.property.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {r.unit?.label ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={r.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Siren className="size-4" /> Needs attention
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {urgentList.length === 0 ? (
                <EmptyState
                  className="border-0 py-10"
                  icon={CheckCircle2}
                  title="Nothing urgent right now."
                />
              ) : (
                <ul className="divide-y">
                  {urgentList.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/dashboard/requests/${r.id}`}
                        className="block px-4 py-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">
                            {r.title}
                          </p>
                          <PriorityBadge priority={r.priority} />
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {r.property.name}
                          {r.unit ? ` · ${r.unit.label}` : ""} ·{" "}
                          {timeAgo(r.createdAt)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4" /> Property status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {properties.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <Link
                      href={`/dashboard/properties/${p.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {p.name}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {p.city} · {p._count.units} units
                      </span>
                    </Link>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {p._count.requests} open
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activity.length === 0 ? (
            <EmptyState className="border-0 py-10" title="No activity yet." />
          ) : (
            <ul className="divide-y">
              {activity.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
                  <span className="flex-1 truncate">{a.summary}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
