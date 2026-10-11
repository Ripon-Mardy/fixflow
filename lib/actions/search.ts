"use server";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth";
import { requestScope } from "@/lib/queries/scope";

export type SearchResult = {
  type: "request" | "property" | "tenant" | "technician";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const user = await requireUser();
  const q = query.trim();
  if (q.length < 2) return [];

  const contains = { contains: q, mode: "insensitive" as const };
  const results: SearchResult[] = [];

  const requests = await prisma.maintenanceRequest.findMany({
    where: {
      AND: [
        requestScope(user),
        { OR: [{ title: contains }, { reference: contains }, { description: contains }] },
      ],
    },
    select: {
      id: true,
      reference: true,
      title: true,
      property: { select: { name: true } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
  for (const r of requests) {
    results.push({
      type: "request",
      id: r.id,
      title: r.title,
      subtitle: `${r.reference} · ${r.property.name}`,
      href: `/dashboard/requests/${r.id}`,
    });
  }

  if (user.role === "MANAGER" || user.role === "ADMIN") {
    const [properties, tenants, technicians] = await Promise.all([
      prisma.property.findMany({
        where: { OR: [{ name: contains }, { city: contains }, { addressLine: contains }] },
        select: { id: true, name: true, city: true, state: true },
        take: 4,
      }),
      prisma.user.findMany({
        where: { role: "TENANT", OR: [{ name: contains }, { email: contains }] },
        select: {
          id: true,
          name: true,
          unit: { select: { label: true, property: { select: { name: true } } } },
        },
        take: 4,
      }),
      prisma.user.findMany({
        where: { role: "TECHNICIAN", OR: [{ name: contains }, { email: contains }] },
        select: {
          id: true,
          name: true,
          technicianProfile: { select: { specialization: true } },
        },
        take: 4,
      }),
    ]);

    for (const p of properties) {
      results.push({
        type: "property",
        id: p.id,
        title: p.name,
        subtitle: `${p.city}, ${p.state}`,
        href: `/dashboard/properties/${p.id}`,
      });
    }
    for (const t of tenants) {
      results.push({
        type: "tenant",
        id: t.id,
        title: t.name,
        subtitle: t.unit
          ? `${t.unit.property.name} · ${t.unit.label}`
          : "No unit assigned",
        href: `/dashboard/tenants/${t.id}`,
      });
    }
    for (const t of technicians) {
      results.push({
        type: "technician",
        id: t.id,
        title: t.name,
        subtitle: t.technicianProfile?.specialization ?? "Technician",
        href: `/dashboard/technicians/${t.id}`,
      });
    }
  }

  return results;
}
