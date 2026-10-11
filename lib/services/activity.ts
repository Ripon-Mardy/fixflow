import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/**
 * Audit-style activity log. Every meaningful mutation calls this so the
 * admin activity feed and per-request timeline stay in sync.
 */
export async function logActivity(input: {
  actorId?: string | null;
  action: string;
  summary: string;
  entity: string;
  entityId?: string | null;
  requestId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
}) {
  return prisma.activityLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      summary: input.summary,
      entity: input.entity,
      entityId: input.entityId ?? null,
      requestId: input.requestId ?? null,
      metadata: input.metadata,
      ipAddress: input.ipAddress ?? "127.0.0.1",
    },
  });
}
