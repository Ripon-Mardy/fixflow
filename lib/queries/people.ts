import "server-only";
import { prisma } from "@/lib/db/prisma";
import { OPEN_STATUSES } from "@/lib/constants";

export async function listTenants(q?: string) {
  const where = {
    role: "TENANT" as const,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const tenants = await prisma.user.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      unit: { select: { label: true, property: { select: { id: true, name: true } } } },
      _count: {
        select: {
          requestsCreated: { where: { status: { in: OPEN_STATUSES } } },
        },
      },
    },
  });

  return tenants;
}

export async function getTenantDetail(id: string) {
  const tenant = await prisma.user.findFirst({
    where: { id, role: "TENANT" },
    include: {
      unit: {
        select: {
          label: true,
          floor: true,
          property: { select: { id: true, name: true, addressLine: true, city: true } },
        },
      },
    },
  });
  if (!tenant) return null;

  const requests = await prisma.maintenanceRequest.findMany({
    where: { tenantId: id },
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { name: true } },
      technician: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  return { tenant, requests };
}

export async function listTechnicians(q?: string) {
  const technicians = await prisma.user.findMany({
    where: {
      role: "TECHNICIAN",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    include: {
      technicianProfile: true,
      _count: {
        select: {
          requestsAssigned: { where: { status: { in: OPEN_STATUSES } } },
        },
      },
    },
  });

  return technicians;
}

export async function getTechnicianDetail(id: string) {
  const tech = await prisma.user.findFirst({
    where: { id, role: "TECHNICIAN" },
    include: { technicianProfile: true },
  });
  if (!tech) return null;

  const [active, completed, activity] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where: { technicianId: id, status: { in: OPEN_STATUSES } },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      include: {
        property: { select: { name: true } },
        unit: { select: { label: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.maintenanceRequest.findMany({
      where: { technicianId: id, status: { in: ["RESOLVED", "CLOSED"] } },
      orderBy: { resolvedAt: "desc" },
      take: 10,
      include: {
        property: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.activityLog.findMany({
      where: { actorId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const completedCount = await prisma.maintenanceRequest.count({
    where: { technicianId: id, status: { in: ["RESOLVED", "CLOSED"] } },
  });

  return { tech, active, completed, completedCount, activity };
}
