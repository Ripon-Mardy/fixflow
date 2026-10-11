import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { SessionUser } from "@/lib/auth";

export async function getNewRequestFormData(user: SessionUser) {
  const categories = await prisma.category.findMany({
    where: { enabled: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  if (user.role === "TENANT") {
    return {
      categories,
      properties: user.unit
        ? [
            {
              id: user.unit.property.id,
              name: user.unit.property.name,
              units: [{ id: user.unit.id, label: user.unit.label }],
            },
          ]
        : [],
      fixedProperty: user.unit?.property.id ?? null,
      fixedUnit: user.unit?.id ?? null,
    };
  }

  const properties = await prisma.property.findMany({
    select: {
      id: true,
      name: true,
      units: {
        select: { id: true, label: true },
        orderBy: { label: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return { categories, properties, fixedProperty: null, fixedUnit: null };
}
