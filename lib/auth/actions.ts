"use server";

import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { logActivity } from "@/lib/services/activity";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

export type AuthState = { error?: string; ok?: boolean };

const DEMO_EMAILS: Record<string, string> = {
  ADMIN: "admin@fixflow.demo",
  MANAGER: "manager@fixflow.demo",
  TECHNICIAN: "technician@fixflow.demo",
  TENANT: "tenant@fixflow.demo",
};

function destinationFor(role: Role) {
  return role === "ADMIN" ? "/admin" : "/dashboard";
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });
  if (!user || user.status === "DISABLED") {
    return { error: "No active account matches those details." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "That password doesn't match our records." };
  }

  await createSession(user.id);
  await logActivity({
    actorId: user.id,
    action: "auth.login",
    summary: `${user.name} signed in`,
    entity: "User",
    entityId: user.id,
  });
  redirect(destinationFor(user.role));
}

export async function demoLoginAction(role: Role): Promise<void> {
  const email = DEMO_EMAILS[role];
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(
      "Demo accounts are missing — run `npm run db:seed` to create them.",
    );
  }
  await createSession(user.id);
  await logActivity({
    actorId: user.id,
    action: "auth.demo_login",
    summary: `${user.name} signed in via demo shortcut`,
    entity: "User",
    entityId: user.id,
  });
  redirect(destinationFor(user.role));
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      error: "An account with that email already exists. Try logging in.",
    };
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name.trim(),
      role: "MANAGER",
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  await createSession(user.id);
  await logActivity({
    actorId: user.id,
    action: "auth.register",
    summary: `${user.name} created a manager account`,
    entity: "User",
    entityId: user.id,
    metadata: parsed.data.company
      ? { company: parsed.data.company }
      : undefined,
  });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
