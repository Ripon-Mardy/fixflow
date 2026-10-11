import type {
  MaintenanceRequest,
  Notification,
  Property,
  RequestPriority,
  RequestStatus,
  Role,
  User,
} from "@prisma/client";

export type { Role, RequestStatus, RequestPriority };

/** Result shape returned by every mutating server action. */
export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** A maintenance request joined with the relations the UI needs in lists. */
export type RequestWithRelations = MaintenanceRequest & {
  property: Pick<Property, "id" | "name">;
  unit: { label: string } | null;
  tenant: Pick<User, "id" | "name">;
  technician: Pick<User, "id" | "name"> | null;
  category: { name: string };
};

export type NotificationWithRequest = Notification & {
  request: { id: string; reference: string } | null;
};

export type DashboardStats = {
  open: number;
  urgent: number;
  inProgress: number;
  resolvedThisMonth: number;
  avgResolutionDays: number | null;
};
