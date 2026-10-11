import Link from "next/link";
import { Building2, CircleDot, CheckCircle2, Plus, Home } from "lucide-react";
import type { getTenantDashboard } from "@/lib/queries/dashboard";
import type { SessionUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/empty-state";
import { RequestRowLink } from "@/components/dashboard/request-row-link";
import { timeAgo } from "@/lib/utils";

type Data = Awaited<ReturnType<typeof getTenantDashboard>>;

export function TenantDashboard({
  user,
  data,
}: {
  user: SessionUser;
  data: Data;
}) {
  const { stats, requests, updates } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your maintenance requests and their status.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/requests/new">
            <Plus className="size-4" /> New request
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open requests" value={stats.open} icon={CircleDot} />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="success" />
        <StatCard label="Total submitted" value={stats.total} icon={Home} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>My maintenance requests</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {requests.length === 0 ? (
              <EmptyState
                className="border-0"
                icon={CircleDot}
                title="No maintenance requests yet."
                description="Report an issue in your unit and follow it here from submitted to resolved."
                action={
                  <Button asChild>
                    <Link href="/dashboard/requests/new">
                      <Plus className="size-4" /> Create your first request
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <RequestRowLink key={r.id} request={r} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4" /> Your home
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {user.unit ? (
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Property</dt>
                    <dd className="font-medium">{user.unit.property.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Unit</dt>
                    <dd className="font-medium">{user.unit.label}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Address</dt>
                    <dd className="text-right font-medium">
                      {user.unit.property.addressLine}
                      <br />
                      {user.unit.property.city}, {user.unit.property.state}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-muted-foreground">
                  No unit is linked to your account yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Recent updates</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {updates.length === 0 ? (
                <EmptyState className="border-0 py-10" title="No updates yet." />
              ) : (
                <ul className="divide-y">
                  {updates.map((u) => (
                    <li key={u.id} className="px-4 py-3">
                      <Link
                        href={`/dashboard/requests/${u.request.id}`}
                        className="text-sm hover:underline"
                      >
                        {u.body}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {u.request.reference} · {timeAgo(u.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
