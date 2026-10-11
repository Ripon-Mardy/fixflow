import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { RequestPriority, RequestStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/auth";
import {
  getRequestFilterOptions,
  listRequests,
} from "@/lib/queries/requests";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { RequestsTable } from "@/components/dashboard/requests-table";

export const metadata: Metadata = { title: "Requests" };
export const dynamic = "force-dynamic";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

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

  const isTenant = user.role === "TENANT";
  const isTech = user.role === "TECHNICIAN";

  return (
    <div>
      <PageHeader
        title={isTech ? "Assigned requests" : "Requests"}
        description={
          isTenant
            ? "Every request you've submitted, with its current status."
            : isTech
              ? "All maintenance requests assigned to you."
              : "Every maintenance request across your properties."
        }
      >
        {can(user, "request.create") && (
          <Button asChild>
            <Link href="/dashboard/requests/new">
              <Plus className="size-4" /> New request
            </Link>
          </Button>
        )}
      </PageHeader>

      <RequestsTable
        rows={data.items.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        total={data.total}
        page={data.page}
        pageCount={data.pageCount}
        options={options}
        showColumns={{
          property: !isTenant,
          tenant: !isTenant,
          technician: !isTech,
        }}
      />
    </div>
  );
}
