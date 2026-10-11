import "server-only";
import { prisma } from "@/lib/db/prisma";
import { STATUS_META } from "@/lib/constants";

function monthKey(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export async function getAdminOverview() {
  const [
    totalUsers,
    totalProperties,
    totalRequests,
    activeTechnicians,
    users,
    requests,
    categories,
    activity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.maintenanceRequest.count(),
    prisma.user.count({
      where: { role: "TECHNICIAN", status: "ACTIVE" },
    }),
    prisma.user.findMany({ select: { createdAt: true, role: true } }),
    prisma.maintenanceRequest.findMany({
      select: { createdAt: true, status: true, categoryId: true },
    }),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { actor: { select: { name: true, role: true } } },
    }),
  ]);

  // 8-month windows
  const months: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    months.push(monthKey(d));
  }
  const idx = Object.fromEntries(months.map((m, i) => [m, i]));

  const userGrowth = months.map((m) => ({ month: m, users: 0 }));
  let cumulative = 0;
  const perMonthUsers = new Array(months.length).fill(0);
  for (const u of users) {
    const k = monthKey(u.createdAt);
    if (k in idx) perMonthUsers[idx[k]]++;
  }
  // account for users created before the window
  const before = users.filter((u) => !(monthKey(u.createdAt) in idx)).length;
  cumulative = before;
  for (let i = 0; i < months.length; i++) {
    cumulative += perMonthUsers[i];
    userGrowth[i].users = cumulative;
  }

  const requestsOverTime = months.map((m) => ({ month: m, requests: 0 }));
  for (const r of requests) {
    const k = monthKey(r.createdAt);
    if (k in idx) requestsOverTime[idx[k]].requests++;
  }

  const byStatus = Object.keys(STATUS_META).map((s) => ({
    name: STATUS_META[s as keyof typeof STATUS_META].label,
    value: requests.filter((r) => r.status === s).length,
  }));

  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const byCategory = categories
    .map((c) => ({
      name: catName[c.id],
      value: requests.filter((r) => r.categoryId === c.id).length,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    totals: {
      users: totalUsers,
      properties: totalProperties,
      requests: totalRequests,
      activeTechnicians,
    },
    userGrowth,
    requestsOverTime,
    byStatus,
    byCategory,
    activity,
  };
}

export async function listUsers(params: {
  q?: string;
  role?: string;
  page?: number;
}) {
  const PAGE = 12;
  const page = Math.max(1, params.page ?? 1);
  const where: import("@prisma/client").Prisma.UserWhereInput = {};
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.role && params.role !== "ALL") {
    where.role = params.role as import("@prisma/client").Role;
  }

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      include: {
        unit: { select: { label: true, property: { select: { name: true } } } },
        _count: {
          select: { requestsCreated: true, requestsAssigned: true },
        },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE)),
  };
}

export async function listActivity(params: {
  entity?: string;
  q?: string;
  page?: number;
}) {
  const PAGE = 20;
  const page = Math.max(1, params.page ?? 1);
  const where: import("@prisma/client").Prisma.ActivityLogWhereInput = {};

  if (params.entity && params.entity !== "ALL") where.entity = params.entity;
  if (params.q) {
    where.OR = [
      { summary: { contains: params.q, mode: "insensitive" } },
      { action: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      include: { actor: { select: { name: true, role: true } } },
    }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE)),
  };
}
