import type { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ClipboardList,
  Gauge,
  CircleDot,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAnalytics } from "@/lib/queries/analytics";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsCharts } from "@/components/charts/analytics-charts";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireRole(["MANAGER", "ADMIN"]);
  const data = await getAnalytics();
  const m = data.metrics;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="How maintenance is trending across every property. Figures are computed live from your data."
      />

      <div className="grid gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Total Requests" value={m.total} icon={ClipboardList} />
        <StatCard label="Resolved" value={m.resolved} icon={CheckCircle2} tone="success" />
        <StatCard label="Open" value={m.open} icon={CircleDot} tone="primary" />
        <StatCard label="Emergency" value={m.emergency} icon={AlertTriangle} tone="danger" />
        <StatCard
          label="Avg. Resolution"
          value={`${m.avgResolutionDays.toFixed(1)}d`}
          icon={Clock}
        />
        <StatCard label="Resolution Rate" value={`${m.resolutionRate}%`} icon={Gauge} />
      </div>

      <AnalyticsCharts data={data} />
    </div>
  );
}
