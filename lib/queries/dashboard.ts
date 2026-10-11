import "server-only";
import { prisma } from "@/lib/db/prisma";
import { OPEN_STATUSES } from "@/lib/constants";
import type { SessionUser } from "@/lib/auth";
import { requestScope } from "./scope";

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Average resolution time in days for resolved requests in a scope. */
async function avgResolutionDays(where: object) {
  const rows = await prisma.maintenanceRequest.findMany({
    where: { ...where, resolvedAt: { not: null } },
    select: { createdAt: true, resolvedAt: true },
    take: 500,
  });
  if (!rows.length) return null;
  const total = rows.reduce(
    (sum, r) => sum + (r.resolvedAt!.getTime() - r.createdAt.getTime()),
    0,
  );
  return total / rows.length / 86_400_000;
}

export async function getManagerDashboard(user: SessionUser) {
  const scope = requestScope(user);
  const monthStart = startOfMonth();

  const [
    openCount,
    urgentCount,
    inProgressCount,
    resolvedThisMonth,
    avgDays,
    recent,
    urgentList,
    properties,
    activity,
    statusGroups,
  ] = await Promise.all([
    prisma.maintenanceRequest.count({
      where: { ...scope, status: { in: OPEN_STATUSES } },
    }),
    prisma.maintenanceRequest.count({
      where: {
        ...scope,
        priority: "EMERGENCY",
        status: { in: OPEN_STATUSES },
      },
    }),
    prisma.maintenanceRequest.count({
      where: { ...scope, status: "IN_PROGRESS" },
    }),
    prisma.maintenanceRequest.count({
      where: {
        ...scope,
        status: { in: ["RESOLVED", "CLOSED"] },
        resolvedAt: { gte: monthStart },
      },
    }),
    avgResolutionDays(scope),
    prisma.maintenanceRequest.findMany({
      where: scope,
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        property: { select: { name: true } },
        unit: { select: { label: true } },
        tenant: { select: { name: true } },
        technician: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.maintenanceRequest.findMany({
      where: {
        ...scope,
        priority: { in: ["EMERGENCY", "HIGH"] },
        status: { in: OPEN_STATUSES },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: 5,
      include: {
        property: { select: { name: true } },
        unit: { select: { label: true } },
      },
    }),
    prisma.property.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        _count: {
          select: {
            requests: { where: { status: { in: OPEN_STATUSES } } },
            units: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.activityLog.findMany({
      where: { entity: "MaintenanceRequest" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true } } },
    }),
    prisma.maintenanceRequest.groupBy({
      by: ["status"],
      where: scope,
      _count: { _all: true },
    }),
  ]);

  return {
    stats: {
      open: openCount,
      urgent: urgentCount,
      inProgress: inProgressCount,
      resolvedThisMonth,
      avgResolutionDays: avgDays,
    },
    recent,
    urgentList,
    properties,
    activity,
    statusGroups,
  };
}

export async function getTechnicianDashboard(user: SessionUser) {
  const base = { technicianId: user.id };
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [assigned, urgent, todays, completed, jobs] = await Promise.all([
    prisma.maintenanceRequest.count({
      where: { ...base, status: { in: OPEN_STATUSES } },
    }),
    prisma.maintenanceRequest.count({
      where: { ...base, priority: "EMERGENCY", status: { in: OPEN_STATUSES } },
    }),
    prisma.maintenanceRequest.count({
      where: {
        ...base,
        status: { in: OPEN_STATUSES },
        scheduledFor: { lte: todayEnd },
      },
    }),
    prisma.maintenanceRequest.count({
      where: { ...base, status: { in: ["RESOLVED", "CLOSED"] } },
    }),
    prisma.maintenanceRequest.findMany({
      where: { ...base, status: { in: OPEN_STATUSES } },
      orderBy: [{ priority: "desc" }, { scheduledFor: "asc" }, { createdAt: "asc" }],
      include: {
        property: { select: { name: true, addressLine: true, city: true } },
        unit: { select: { label: true } },
        tenant: { select: { name: true, phone: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  return {
    stats: { assigned, urgent, todays, completed },
    jobs,
  };
}

export async function getTenantDashboard(user: SessionUser) {
  const base = { tenantId: user.id };
  const [openCount, resolvedCount, requests, updates] = await Promise.all([
    prisma.maintenanceRequest.count({
      where: { ...base, status: { in: OPEN_STATUSES } },
    }),
    prisma.maintenanceRequest.count({
      where: { ...base, status: { in: ["RESOLVED", "CLOSED"] } },
    }),
    prisma.maintenanceRequest.findMany({
      where: base,
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { name: true } },
        unit: { select: { label: true } },
        technician: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.requestComment.findMany({
      where: { request: base, system: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { request: { select: { id: true, reference: true, title: true } } },
    }),
  ]);

  return {
    stats: { open: openCount, resolved: resolvedCount, total: requests.length },
    requests,
    updates,
  };
}
