import type {
  NotificationType,
  RequestPriority,
  RequestStatus,
  Role,
} from "@prisma/client";

export const APP_NAME = "FixFlow";
export const APP_TAGLINE = "Maintenance, without the mess.";
export const APP_DESCRIPTION =
  "One place to manage property maintenance requests, technicians, tenants, and repairs.";

export const DEMO_PASSWORD = "Demo123!";

export const DEMO_ACCOUNTS: { role: Role; email: string; label: string }[] = [
  { role: "ADMIN", email: "admin@fixflow.demo", label: "Admin" },
  { role: "MANAGER", email: "manager@fixflow.demo", label: "Manager" },
  { role: "TECHNICIAN", email: "technician@fixflow.demo", label: "Technician" },
  { role: "TENANT", email: "tenant@fixflow.demo", label: "Tenant" },
];

export const REQUEST_CATEGORIES = [
  { name: "Plumbing", slug: "plumbing", icon: "droplets" },
  { name: "Electrical", slug: "electrical", icon: "zap" },
  { name: "HVAC", slug: "hvac", icon: "wind" },
  { name: "Appliance", slug: "appliance", icon: "washing-machine" },
  { name: "Structural", slug: "structural", icon: "hammer" },
  { name: "Cleaning", slug: "cleaning", icon: "sparkles" },
  { name: "Security", slug: "security", icon: "shield" },
  { name: "Other", slug: "other", icon: "wrench" },
] as const;

export const PRIORITY_ORDER: RequestPriority[] = [
  "EMERGENCY",
  "HIGH",
  "MEDIUM",
  "LOW",
];

export const PRIORITY_META: Record<
  RequestPriority,
  { label: string; className: string; dot: string }
> = {
  LOW: {
    label: "Low",
    className: "border-transparent bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  MEDIUM: {
    label: "Medium",
    className:
      "border-transparent bg-sky-500/10 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  HIGH: {
    label: "High",
    className:
      "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  EMERGENCY: {
    label: "Emergency",
    className:
      "border-transparent bg-red-500/10 text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
};

export const STATUS_ORDER: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "RESOLVED",
  "CLOSED",
];

export const STATUS_META: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    className: "border-transparent bg-slate-500/10 text-slate-700 dark:text-slate-300",
  },
  UNDER_REVIEW: {
    label: "Under review",
    className: "border-transparent bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  ASSIGNED: {
    label: "Assigned",
    className: "border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  IN_PROGRESS: {
    label: "In progress",
    className: "border-transparent bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  WAITING_FOR_PARTS: {
    label: "Waiting for parts",
    className: "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  RESOLVED: {
    label: "Resolved",
    className: "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  CLOSED: {
    label: "Closed",
    className: "border-transparent bg-muted text-muted-foreground",
  },
};

export const OPEN_STATUSES: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
];

export const ROLE_META: Record<Role, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: "border-transparent bg-red-500/10 text-red-700 dark:text-red-300",
  },
  MANAGER: {
    label: "Manager",
    className: "border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  TECHNICIAN: {
    label: "Technician",
    className: "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  TENANT: {
    label: "Tenant",
    className: "border-transparent bg-muted text-muted-foreground",
  },
};

export const NOTIFICATION_ICON: Record<NotificationType, string> = {
  REQUEST_CREATED: "inbox",
  REQUEST_ASSIGNED: "user-check",
  STATUS_CHANGED: "activity",
  PRIORITY_CHANGED: "flag",
  COMMENT_ADDED: "message-square",
  REQUEST_RESOLVED: "check-circle-2",
  UPDATE_REQUESTED: "bell-ring",
  EMERGENCY: "siren",
};

export const PAGE_SIZE = 10;
