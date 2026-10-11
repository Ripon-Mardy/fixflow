import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Mail, Phone, Star } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth";
import { getTechnicianDetail } from "@/lib/queries/people";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { formatDate, initials, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const u = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  return { title: u?.name ?? "Technician" };
}

export default async function TechnicianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["MANAGER", "ADMIN"]);
  const { id } = await params;
  const data = await getTechnicianDetail(id);
  if (!data) notFound();
  const { tech, active, completed, completedCount, activity } = data;
  const p = tech.technicianProfile;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/technicians"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All technicians
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-16">
          {tech.avatarUrl && <AvatarImage src={tech.avatarUrl} alt={tech.name} />}
          <AvatarFallback className="text-lg">{initials(tech.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{tech.name}</h1>
          <p className="text-sm text-muted-foreground">
            {p?.specialization ?? "Technician"}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Mail className="size-3.5" /> {tech.email}
            </span>
            {tech.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" /> {tech.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {p?.bio && <p className="text-sm text-muted-foreground">{p.bio}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active jobs" value={active.length} />
        <StatCard label="Completed jobs" value={completedCount} tone="success" />
        <StatCard
          label="Avg. resolution"
          value={p ? `${Math.round(p.avgResolutionHours)}h` : "—"}
          icon={Clock}
        />
        <StatCard
          label="Rating"
          value={p?.rating.toFixed(1) ?? "—"}
          icon={Star}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Assigned jobs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {active.length === 0 ? (
              <EmptyState className="border-0 py-8" title="No active jobs." />
            ) : (
              <ul className="divide-y">
                {active.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/dashboard/requests/${r.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {r.property.name}
                          {r.unit ? ` · ${r.unit.label}` : ""} · {r.reference}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <PriorityBadge priority={r.priority} />
                        <StatusBadge status={r.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Recently completed</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {completed.length === 0 ? (
              <EmptyState className="border-0 py-8" title="Nothing completed yet." />
            ) : (
              <ul className="divide-y">
                {completed.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/dashboard/requests/${r.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {r.property.name} · {r.category.name} ·{" "}
                          {r.resolvedAt ? formatDate(r.resolvedAt) : "—"}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activity.length === 0 ? (
            <EmptyState className="border-0 py-8" title="No activity yet." />
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
