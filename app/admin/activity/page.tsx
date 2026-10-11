import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { listActivity } from "@/lib/queries/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { ActivityLogTable } from "@/components/admin/activity-log";

export const metadata: Metadata = { title: "Activity Logs" };
export const dynamic = "force-dynamic";

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; entity?: string; page?: string }>;
}) {
  await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const sp = await searchParams;
  const data = await listActivity({
    q: sp.q,
    entity: sp.entity,
    page: Number(sp.page ?? 1),
  });

  return (
    <div>
      <PageHeader
        title="Activity logs"
        description="An audit-style trail of every meaningful change across the account."
      />
      <ActivityLogTable
        rows={data.items.map((a) => ({
          id: a.id,
          action: a.action,
          summary: a.summary,
          entity: a.entity,
          ipAddress: a.ipAddress,
          createdAt: a.createdAt.toISOString(),
          actor: a.actor ? { name: a.actor.name, role: a.actor.role } : null,
        }))}
        total={data.total}
        page={data.page}
        pageCount={data.pageCount}
      />
    </div>
  );
}
