import { z } from "zod";

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"] as const;
export const STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "RESOLVED",
  "CLOSED",
] as const;

export const createRequestSchema = z.object({
  title: z
    .string()
    .min(6, "Give the issue a short, clear title")
    .max(120, "Keep the title under 120 characters"),
  description: z
    .string()
    .min(20, "Describe the issue in a little more detail")
    .max(2000),
  categoryId: z.string().min(1, "Choose a category"),
  priority: z.enum(PRIORITIES),
  propertyId: z.string().min(1, "Choose a property"),
  unitId: z.string().min(1, "Choose a unit").optional().or(z.literal("")),
  preferredAccess: z.string().max(160).optional().or(z.literal("")),
  attachments: z
    .array(z.string().url())
    .max(6, "Up to 6 photos")
    .optional()
    .default([]),
});
export type CreateRequestInput = z.infer<typeof createRequestSchema>;

export const commentSchema = z.object({
  requestId: z.string().min(1),
  body: z.string().min(1, "Write a comment").max(2000),
  internal: z.boolean().optional().default(false),
});
export type CommentInput = z.infer<typeof commentSchema>;

export const assignSchema = z.object({
  requestId: z.string().min(1),
  technicianId: z.string().min(1, "Choose a technician"),
});

export const statusSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(STATUSES),
  note: z.string().max(500).optional(),
});

export const prioritySchema = z.object({
  requestId: z.string().min(1),
  priority: z.enum(PRIORITIES),
});

export const scheduleSchema = z.object({
  requestId: z.string().min(1),
  scheduledFor: z.string().min(1, "Pick a date and time"),
});
