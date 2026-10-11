import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Prisma, Role, User } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSessionUserId } from "./session";

export type SessionUser = Prisma.UserGetPayload<{
  include: {
    technicianProfile: true;
    unit: { include: { property: true } };
  };
}>;

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      technicianProfile: true,
      unit: { include: { property: true } },
    },
  });
  if (!user || user.status === "DISABLED") return null;
  return user;
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(
  roles: Role | Role[],
  { redirectTo = "/dashboard" }: { redirectTo?: string } = {},
): Promise<SessionUser> {
  const user = await requireUser();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) redirect(redirectTo);
  return user;
}

export function isManagerLike(user: Pick<User, "role">) {
  return user.role === "ADMIN" || user.role === "MANAGER";
}

export function can(user: Pick<User, "role">, action: Capability): boolean {
  return CAPABILITIES[action].includes(user.role);
}

type Capability =
  | "request.create"
  | "request.assign"
  | "request.changeStatus"
  | "request.changePriority"
  | "request.internalNote"
  | "request.resolve"
  | "property.manage"
  | "tenant.manage"
  | "technician.manage"
  | "admin.access";

const CAPABILITIES: Record<Capability, Role[]> = {
  "request.create": ["TENANT", "MANAGER", "ADMIN"],
  "request.assign": ["MANAGER", "ADMIN"],
  "request.changeStatus": ["MANAGER", "ADMIN", "TECHNICIAN"],
  "request.changePriority": ["MANAGER", "ADMIN"],
  "request.internalNote": ["MANAGER", "ADMIN", "TECHNICIAN"],
  "request.resolve": ["MANAGER", "ADMIN", "TECHNICIAN"],
  "property.manage": ["MANAGER", "ADMIN"],
  "tenant.manage": ["MANAGER", "ADMIN"],
  "technician.manage": ["MANAGER", "ADMIN"],
  "admin.access": ["ADMIN"],
};
