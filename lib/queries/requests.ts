import "server-only";
import type { Prisma, RequestPriority, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { PAGE_SIZE } from "@/lib/constants";
import type { SessionUser } from "@/lib/auth";
import { requestScope } from "./scope";

export type RequestListParams = {
  q?: string;
  status?: RequestStatus | "ALL";
  priority?: RequestPriority | "ALL";
  propertyId?: string;
  technicianId?: string;
  categoryId?: string;
  sort?: "newest" | "oldest" | "priority";
  page?: number;
};

export async function listRequests(user: SessionUser, params: RequestListParams) {
  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.MaintenanceRequestWhereInput = { AND: [requestScope(user)] };
  const and = where.AND as Prisma.MaintenanceRequestWhereInput[];

  if (params.q && params.q.trim().length > 0) {
    const q = params.q.trim();
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { reference: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tenant: { name: { contains: q, mode: "insensitive" } } },
      ],
    });
  }
  if (params.status && params.status !== "ALL") and.push({ status: params.status });
  if (params.priority && params.priority !== "ALL")
    and.push({ priority: params.priority });
  if (params.propertyId) and.push({ propertyId: params.propertyId });
  if (params.technicianId) {
    and.push(
      params.technicianId === "UNASSIGNED"
        ? { technicianId: null }
        : { technicianId: params.technicianId },
    );
  }
  if (params.categoryId) and.push({ categoryId: params.categoryId });

  const orderBy: Prisma.MaintenanceRequestOrderByWithRelationInput[] =
    params.sort === "oldest"
      ? [{ createdAt: "asc" }]
      : params.sort === "priority"
        ? [{ priority: "desc" }, { createdAt: "desc" }]
        : [{ createdAt: "desc" }];

  const [total, items] = await Promise.all([
    prisma.maintenanceRequest.count({ where }),
    prisma.maintenanceRequest.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { label: true } },
        tenant: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Options for the filter selects. */
export async function getRequestFilterOptions(user: SessionUser) {
  const [properties, technicians, categories] = await Promise.all([
    user.role === "MANAGER" || user.role === "ADMIN"
      ? prisma.property.findMany({
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    user.role === "MANAGER" || user.role === "ADMIN"
      ? prisma.user.findMany({
          where: { role: "TECHNICIAN" },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    prisma.category.findMany({
      where: { enabled: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { properties, technicians, categories };
}

export async function getRequestDetail(user: SessionUser, id: string) {
  const request = await prisma.maintenanceRequest.findFirst({
    where: { AND: [{ id }, requestScope(user)] },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          addressLine: true,
          city: true,
          state: true,
          managerId: true,
          manager: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
      unit: { select: { id: true, label: true, floor: true } },
      category: { select: { id: true, name: true } },
      tenant: {
        select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
      },
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          technicianProfile: { select: { specialization: true, rating: true } },
        },
      },
      attachments: { orderBy: { createdAt: "asc" } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, role: true, avatarUrl: true } },
        },
      },
    },
  });

  return request;
}
