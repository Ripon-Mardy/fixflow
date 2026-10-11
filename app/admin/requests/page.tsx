import type { Metadata } from "next";
import type { RequestPriority, RequestStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { getRequestFilterOptions, listRequests } from "@/lib/queries/requests";
import { PageHeader } from "@/components/dashboard/page-header";
import { RequestsTable } from "@/components/dashboard/requests-table";

export const metadata: Metadata = { title: "Requests" };
export const dynamic = "force-dynamic";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const [data, options] = await Promise.all([
    listRequests(user, {
      q: str(sp.q),
      status: (str(sp.status) as RequestStatus) || "ALL",
      priority: (str(sp.priority) as RequestPriority) || "ALL",
      propertyId: str(sp.propertyId),
      technicianId: str(sp.technicianId),
      categoryId: str(sp.categoryId),
      sort: (str(sp.sort) as "newest" | "oldest" | "priority") || "newest",
      page: Number(str(sp.page) ?? 1),
    }),
    getRequestFilterOptions(user),
  ]);

  return (
    <div>
      <PageHeader
        title="All requests"
        description="Every maintenance request in the account, across every property and team."
      />
      <RequestsTable
        rows={data.items.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
        total={data.total}
        page={data.page}
        pageCount={data.pageCount}
        options={options}
      />
    </div>
  );
}
