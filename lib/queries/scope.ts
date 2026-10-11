import "server-only";
import type { Prisma } from "@prisma/client";
import type { SessionUser } from "@/lib/auth";

/**
 * Returns the `where` fragment that limits maintenance requests to what a
 * given user is allowed to see:
 *  - ADMIN / MANAGER: everything (managers see all properties in this demo)
 *  - TECHNICIAN: only requests assigned to them
 *  - TENANT: only requests they created
 */
export function requestScope(user: SessionUser): Prisma.MaintenanceRequestWhereInput {
  switch (user.role) {
    case "ADMIN":
    case "MANAGER":
      return {};
    case "TECHNICIAN":
      return { technicianId: user.id };
    case "TENANT":
      return { tenantId: user.id };
    default:
      return { id: "__none__" };
  }
}

export function canSeeInternalNotes(user: SessionUser) {
  return user.role !== "TENANT";
}
