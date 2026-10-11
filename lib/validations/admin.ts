import { z } from "zod";

export const ROLES = ["ADMIN", "MANAGER", "TECHNICIAN", "TENANT"] as const;

export const userSchema = z.object({
  name: z.string().min(2, "Enter a name").max(80),
  email: z.string().email("Enter a valid email"),
  role: z.enum(ROLES),
  phone: z.string().max(40).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "DISABLED"]).default("ACTIVE"),
});
export type UserInput = z.infer<typeof userSchema>;

export const propertySchema = z.object({
  name: z.string().min(2, "Enter a property name").max(120),
  addressLine: z.string().min(4, "Enter the street address").max(160),
  city: z.string().min(2, "Enter a city").max(80),
  state: z.string().min(2, "Enter a state").max(40),
  postalCode: z.string().min(3, "Enter a postal code").max(16),
  managerId: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().max(600).optional().or(z.literal("")),
  yearBuilt: z
    .preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce.number().int().min(1850).max(2100).optional(),
    )
    .optional(),
});
export type PropertyInput = z.infer<typeof propertySchema>;

export const unitSchema = z.object({
  propertyId: z.string().min(1),
  label: z.string().min(1, "Enter a unit label").max(40),
  bedrooms: z.coerce.number().int().min(0).max(10).default(1),
  bathrooms: z.coerce.number().int().min(1).max(10).default(1),
  floor: z.coerce.number().int().min(0).max(80).default(1),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Enter a category name").max(60),
  icon: z.string().min(1).max(40).default("wrench"),
  enabled: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;
