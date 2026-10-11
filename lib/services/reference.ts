import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Generate the next human-friendly request reference, e.g. "FX-2026-1048".
 * Sequence restarts each calendar year and is derived from the current
 * max reference so it stays stable even if rows are deleted.
 */
export async function nextRequestReference(now = new Date()): Promise<string> {
  const year = now.getFullYear();
  const prefix = `FX-${year}-`;

  const latest = await prisma.maintenanceRequest.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });

  const lastSeq = latest ? parseInt(latest.reference.slice(prefix.length), 10) : 1000;
  return `${prefix}${lastSeq + 1}`;
}
