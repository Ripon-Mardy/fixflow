"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth";
import { hashPassword } from "@/lib/auth/password";
import { DEMO_PASSWORD } from "@/lib/constants";
import { logActivity } from "@/lib/services/activity";
import { categorySchema, propertySchema, userSchema } from "@/lib/validations/admin";

export type AdminResult = { ok: boolean; error?: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* --------------------------------- users --------------------------------- */
export async function createUser(formData: FormData): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    phone: formData.get("phone"),
    status: formData.get("status") || "ACTIVE",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const email = parsed.data.email.toLowerCase().trim();
  if (await prisma.user.findUnique({ where: { email } })) {
    return { ok: false, error: "A user with that email already exists." };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      role: parsed.data.role,
      phone: parsed.data.phone || null,
      status: parsed.data.status,
      passwordHash: await hashPassword(DEMO_PASSWORD),
      ...(parsed.data.role === "TECHNICIAN"
        ? {
            technicianProfile: {
              create: { specialization: "General repairs" },
            },
          }
        : {}),
    },
  });

  await logActivity({
    actorId: admin.id,
    action: "user.created",
    summary: `Admin created ${parsed.data.role.toLowerCase()} account for ${user.name}`,
    entity: "User",
    entityId: user.id,
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUser(formData: FormData): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const id = String(formData.get("id"));
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    phone: formData.get("phone"),
    status: formData.get("status") || "ACTIVE",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "User not found." };

  const email = parsed.data.email.toLowerCase().trim();
  const clash = await prisma.user.findFirst({
    where: { email, id: { not: id } },
  });
  if (clash) return { ok: false, error: "That email is already in use." };

  await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name.trim(),
      email,
      role: parsed.data.role,
      phone: parsed.data.phone || null,
      status: parsed.data.status,
      ...(parsed.data.role === "TECHNICIAN"
        ? {
            technicianProfile: {
              upsert: {
                create: { specialization: "General repairs" },
                update: {},
              },
            },
          }
        : {}),
    },
  });

  await logActivity({
    actorId: admin.id,
    action: "user.updated",
    summary: `Admin updated account for ${parsed.data.name}`,
    entity: "User",
    entityId: id,
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserStatus(
  id: string,
  status: "ACTIVE" | "DISABLED",
): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  if (id === admin.id) {
    return { ok: false, error: "You can't disable your own account." };
  }
  const user = await prisma.user.update({ where: { id }, data: { status } });
  await logActivity({
    actorId: admin.id,
    action: status === "DISABLED" ? "user.disabled" : "user.enabled",
    summary: `Admin ${status === "DISABLED" ? "disabled" : "re-enabled"} ${user.name}`,
    entity: "User",
    entityId: id,
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(id: string): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  if (id === admin.id) {
    return { ok: false, error: "You can't delete your own account." };
  }
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { requestsCreated: true, requestsAssigned: true } },
    },
  });
  if (!user) return { ok: false, error: "User not found." };
  if (user._count.requestsCreated > 0 || user._count.requestsAssigned > 0) {
    return {
      ok: false,
      error:
        "This user has maintenance history. Disable the account instead of deleting it.",
    };
  }
  await prisma.user.delete({ where: { id } });
  await logActivity({
    actorId: admin.id,
    action: "user.deleted",
    summary: `Admin deleted account for ${user.name}`,
    entity: "User",
    entityId: id,
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

/* ------------------------------- properties ------------------------------ */
export async function createProperty(formData: FormData): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const parsed = propertySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const p = parsed.data;
  const property = await prisma.property.create({
    data: {
      name: p.name,
      addressLine: p.addressLine,
      city: p.city,
      state: p.state,
      postalCode: p.postalCode,
      managerId: p.managerId && p.managerId !== "none" ? p.managerId : null,
      imageUrl: p.imageUrl || null,
      description: p.description || null,
      yearBuilt: p.yearBuilt ?? null,
    },
  });
  await logActivity({
    actorId: admin.id,
    action: "property.created",
    summary: `Admin added property ${property.name}`,
    entity: "Property",
    entityId: property.id,
  });
  revalidatePath("/admin/properties");
  revalidatePath("/dashboard/properties");
  return { ok: true };
}

export async function updateProperty(formData: FormData): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const id = String(formData.get("id"));
  const parsed = propertySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const p = parsed.data;
  await prisma.property.update({
    where: { id },
    data: {
      name: p.name,
      addressLine: p.addressLine,
      city: p.city,
      state: p.state,
      postalCode: p.postalCode,
      managerId: p.managerId && p.managerId !== "none" ? p.managerId : null,
      imageUrl: p.imageUrl || null,
      description: p.description || null,
      yearBuilt: p.yearBuilt ?? null,
    },
  });
  await logActivity({
    actorId: admin.id,
    action: "property.updated",
    summary: `Admin updated property ${p.name}`,
    entity: "Property",
    entityId: id,
  });
  revalidatePath("/admin/properties");
  revalidatePath("/dashboard/properties");
  return { ok: true };
}

export async function deleteProperty(id: string): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const property = await prisma.property.findUnique({
    where: { id },
    include: { _count: { select: { requests: true } } },
  });
  if (!property) return { ok: false, error: "Property not found." };
  if (property._count.requests > 0) {
    return {
      ok: false,
      error:
        "This property has maintenance requests. Reassign or archive them before deleting.",
    };
  }
  await prisma.property.delete({ where: { id } });
  await logActivity({
    actorId: admin.id,
    action: "property.deleted",
    summary: `Admin deleted property ${property.name}`,
    entity: "Property",
    entityId: id,
  });
  revalidatePath("/admin/properties");
  revalidatePath("/dashboard/properties");
  return { ok: true };
}

export async function addUnit(formData: FormData): Promise<AdminResult> {
  await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const propertyId = String(formData.get("propertyId"));
  const label = String(formData.get("label")).trim();
  if (!label) return { ok: false, error: "Enter a unit label." };
  const exists = await prisma.unit.findFirst({ where: { propertyId, label } });
  if (exists) return { ok: false, error: "That unit already exists." };
  await prisma.unit.create({
    data: {
      propertyId,
      label,
      bedrooms: Number(formData.get("bedrooms") ?? 1),
      bathrooms: Number(formData.get("bathrooms") ?? 1),
      floor: Number(formData.get("floor") ?? 1),
    },
  });
  revalidatePath("/admin/properties");
  return { ok: true };
}

/* ------------------------------- categories ----------------------------- */
export async function createCategory(formData: FormData): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    icon: formData.get("icon") || "wrench",
    enabled: formData.get("enabled") === "true" || formData.get("enabled") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const slug = slugify(parsed.data.name);
  if (await prisma.category.findFirst({ where: { OR: [{ slug }, { name: parsed.data.name }] } })) {
    return { ok: false, error: "That category already exists." };
  }
  const cat = await prisma.category.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      icon: parsed.data.icon,
      enabled: parsed.data.enabled,
    },
  });
  await logActivity({
    actorId: admin.id,
    action: "category.created",
    summary: `Admin created category "${cat.name}"`,
    entity: "Category",
    entityId: cat.id,
  });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function updateCategory(formData: FormData): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const id = String(formData.get("id"));
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    icon: formData.get("icon") || "wrench",
    enabled: formData.get("enabled") === "true" || formData.get("enabled") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name.trim(),
      icon: parsed.data.icon,
      enabled: parsed.data.enabled,
    },
  });
  await logActivity({
    actorId: admin.id,
    action: "category.updated",
    summary: `Admin updated category "${parsed.data.name}"`,
    entity: "Category",
    entityId: id,
  });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function toggleCategory(id: string): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) return { ok: false, error: "Category not found." };
  await prisma.category.update({
    where: { id },
    data: { enabled: !cat.enabled },
  });
  await logActivity({
    actorId: admin.id,
    action: "category.toggled",
    summary: `Admin ${cat.enabled ? "disabled" : "enabled"} category "${cat.name}"`,
    entity: "Category",
    entityId: id,
  });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<AdminResult> {
  const admin = await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { requests: true } } },
  });
  if (!cat) return { ok: false, error: "Category not found." };
  if (cat._count.requests > 0) {
    return {
      ok: false,
      error: "This category is used by existing requests. Disable it instead.",
    };
  }
  await prisma.category.delete({ where: { id } });
  await logActivity({
    actorId: admin.id,
    action: "category.deleted",
    summary: `Admin deleted category "${cat.name}"`,
    entity: "Category",
    entityId: id,
  });
  revalidatePath("/admin/categories");
  return { ok: true };
}
