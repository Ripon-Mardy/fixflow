import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireRole("ADMIN", { redirectTo: "/dashboard" });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { requests: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Categories"
        description="The issue categories tenants choose from when reporting a problem."
      />
      <CategoriesManager
        rows={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          enabled: c.enabled,
          requestCount: c._count.requests,
        }))}
      />
    </div>
  );
}
