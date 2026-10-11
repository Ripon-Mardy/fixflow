import "server-only";
import { prisma } from "@/lib/db/prisma";
import { OPEN_STATUSES } from "@/lib/constants";

export async function listProperties() {
  const properties = await prisma.property.findMany({
    orderBy: { name: "asc" },
    include: {
      manager: { select: { id: true, name: true } },
      _count: {
        select: {
          units: true,
          requests: { where: { status: { in: OPEN_STATUSES } } },
        },
      },
      units: { select: { _count: { select: { tenants: true } } } },
    },
  });

  return properties.map((p) => {
    const occupied = p.units.filter((u) => u._count.tenants > 0).length;
    return {
      id: p.id,
      name: p.name,
      addressLine: p.addressLine,
      city: p.city,
      state: p.state,
      imageUrl: p.imageUrl,
      manager: p.manager,
      unitCount: p._count.units,
      openRequests: p._count.requests,
      occupancy: p._count.units ? Math.round((occupied / p._count.units) * 100) : 0,
    };
  });
}

export async function getPropertyDetail(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      manager: { select: { id: true, name: true, email: true } },
      units: {
        orderBy: { label: "asc" },
        include: {
          tenants: { select: { id: true, name: true, email: true } },
          _count: {
            select: {
              requests: { where: { status: { in: OPEN_STATUSES } } },
            },
          },
        },
      },
    },
  });
  if (!property) return null;

  const [requests, resolvedAgg, totalRequests] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where: { propertyId: id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        unit: { select: { label: true } },
        tenant: { select: { name: true } },
        technician: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.maintenanceRequest.findMany({
      where: { propertyId: id, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    }),
    prisma.maintenanceRequest.count({ where: { propertyId: id } }),
  ]);

  const avgDays =
    resolvedAgg.length > 0
      ? resolvedAgg.reduce(
          (s, r) => s + (r.resolvedAt!.getTime() - r.createdAt.getTime()),
          0,
        ) /
        resolvedAgg.length /
        86_400_000
      : null;

  const openCount = await prisma.maintenanceRequest.count({
    where: { propertyId: id, status: { in: OPEN_STATUSES } },
  });

  return {
    property,
    requests,
    stats: {
      totalRequests,
      openCount,
      resolvedCount: resolvedAgg.length,
      avgResolutionDays: avgDays,
      tenantCount: property.units.reduce((s, u) => s + u.tenants.length, 0),
    },
  };
}
