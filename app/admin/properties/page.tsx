import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertiesManager } from "@/components/admin/properties-manager";

export const metadata: Metadata = { title: "Properties" };
export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  await requireRole("ADMIN", { redirectTo: "/dashboard" });

  const [properties, managers] = await Promise.all([
    prisma.property.findMany({
      orderBy: { name: "asc" },
      include: {
        manager: { select: { id: true, name: true } },
        _count: { select: { units: true, requests: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "MANAGER", status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Create and edit properties, manage units and assign managers."
      />
      <PropertiesManager
        managers={managers}
        rows={properties.map((p) => ({
          id: p.id,
          name: p.name,
          addressLine: p.addressLine,
          city: p.city,
          state: p.state,
          postalCode: p.postalCode,
          imageUrl: p.imageUrl,
          description: p.description,
          yearBuilt: p.yearBuilt,
          managerId: p.managerId,
          managerName: p.manager?.name ?? null,
          unitCount: p._count.units,
          requestCount: p._count.requests,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
