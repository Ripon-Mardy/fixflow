import "server-only";
import { prisma } from "@/lib/db/prisma";
import { OPEN_STATUSES, STATUS_META } from "@/lib/constants";

function monthKey(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export async function getAnalytics() {
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);

  const [all, resolved, byCategory, byPriority, technicians, properties] =
    await Promise.all([
      prisma.maintenanceRequest.findMany({
        select: { id: true, createdAt: true, status: true, priority: true },
      }),
      prisma.maintenanceRequest.findMany({
        where: { resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.maintenanceRequest.groupBy({
        by: ["categoryId"],
        _count: { _all: true },
      }),
      prisma.maintenanceRequest.groupBy({
        by: ["priority"],
        _count: { _all: true },
      }),
      prisma.user.findMany({
        where: { role: "TECHNICIAN" },
        select: {
          id: true,
          name: true,
          technicianProfile: { select: { avgResolutionHours: true } },
          _count: {
            select: {
              requestsAssigned: {
                where: { status: { in: ["RESOLVED", "CLOSED"] } },
              },
            },
          },
        },
      }),
      prisma.property.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              requests: true,
            },
          },
        },
      }),
    ]);

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  // requests over time (6 months, opened vs resolved)
  const months: { key: string; opened: number; resolved: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    months.push({ key: monthKey(d), opened: 0, resolved: 0 });
  }
  const idxByKey = Object.fromEntries(months.map((m, i) => [m.key, i]));
  for (const r of all) {
    const k = monthKey(r.createdAt);
    if (k in idxByKey) months[idxByKey[k]].opened++;
  }
  for (const r of resolved) {
    const k = monthKey(r.resolvedAt!);
    if (k in idxByKey) months[idxByKey[k]].resolved++;
  }

  const totalResolved = all.filter(
    (r) => r.status === "RESOLVED" || r.status === "CLOSED",
  ).length;
  const openCount = all.filter((r) => OPEN_STATUSES.includes(r.status)).length;
  const emergencyCount = all.filter((r) => r.priority === "EMERGENCY").length;

  const avgResolutionDays =
    resolved.length > 0
      ? resolved.reduce(
          (s, r) => s + (r.resolvedAt!.getTime() - r.createdAt.getTime()),
          0,
        ) /
        resolved.length /
        86_400_000
      : 0;

  return {
    metrics: {
      total: all.length,
      resolved: totalResolved,
      open: openCount,
      emergency: emergencyCount,
      avgResolutionDays,
      resolutionRate: all.length
        ? Math.round((totalResolved / all.length) * 100)
        : 0,
    },
    overTime: months.map((m) => ({
      month: m.key,
      opened: m.opened,
      resolved: m.resolved,
    })),
    byCategory: byCategory
      .map((c) => ({ name: catName[c.categoryId] ?? "Other", value: c._count._all }))
      .sort((a, b) => b.value - a.value),
    byPriority: byPriority.map((p) => ({
      name: p.priority,
      value: p._count._all,
    })),
    byStatus: Object.keys(STATUS_META).map((s) => ({
      name: STATUS_META[s as keyof typeof STATUS_META].label,
      value: all.filter((r) => r.status === s).length,
    })),
    technicians: technicians
      .map((t) => ({
        name: t.name,
        completed: t._count.requestsAssigned,
        avgHours: t.technicianProfile
          ? Math.round(t.technicianProfile.avgResolutionHours)
          : 0,
      }))
      .sort((a, b) => b.completed - a.completed),
    properties: properties
      .map((p) => ({ name: p.name, requests: p._count.requests }))
      .sort((a, b) => b.requests - a.requests),
  };
}
