import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { listUsers } from "@/lib/queries/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { UsersManager } from "@/components/admin/users-manager";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const sp = await searchParams;
  const data = await listUsers({
    q: sp.q,
    role: sp.role,
    page: Number(sp.page ?? 1),
  });

  return (
    <div>
      <PageHeader
        title="Users"
        description="Create, edit, disable or remove accounts across every role."
      />
      <UsersManager
        rows={data.items.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          phone: u.phone,
          avatarUrl: u.avatarUrl,
          createdAt: u.createdAt.toISOString(),
          unit: u.unit
            ? { label: u.unit.label, property: { name: u.unit.property.name } }
            : null,
          _count: u._count,
        }))}
        total={data.total}
        page={data.page}
        pageCount={data.pageCount}
        currentUserId={admin.id}
      />
    </div>
  );
}
