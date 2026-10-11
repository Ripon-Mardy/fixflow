import { Building2, ClipboardList, Users, Wrench } from "lucide-react";
import { getAdminOverview } from "@/lib/queries/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewCharts } from "@/components/admin/overview-charts";
import { RoleBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const data = await getAdminOverview();

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Account-wide health across users, properties and maintenance."
      />

      <div className="grid gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={data.totals.users} icon={Users} />
        <StatCard label="Total Properties" value={data.totals.properties} icon={Building2} />
        <StatCard label="Total Requests" value={data.totals.requests} icon={ClipboardList} />
        <StatCard
          label="Active Technicians"
          value={data.totals.activeTechnicians}
          icon={Wrench}
          tone="primary"
        />
      </div>

      <OverviewCharts data={data} />

      <Card className="mt-6">
        <CardHeader className="border-b">
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.activity.length === 0 ? (
            <EmptyState className="border-0 py-8" title="No activity yet." />
          ) : (
            <ul className="divide-y">
              {data.activity.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
                  <span className="min-w-0 flex-1 truncate">{a.summary}</span>
                  {a.actor && <RoleBadge role={a.actor.role} />}
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
