"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/services/activity";

const schema = z.object({
  name: z.string().min(2, "Enter your name").max(80),
  phone: z.string().max(40).optional().or(z.literal("")),
});

export type ProfileResult = { ok: boolean; error?: string };

export async function updateProfile(
  _prev: ProfileResult,
  formData: FormData,
): Promise<ProfileResult> {
  const user = await requireUser();
  const parsed = schema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name.trim(), phone: parsed.data.phone || null },
  });
  await logActivity({
    actorId: user.id,
    action: "user.profile_updated",
    summary: `${parsed.data.name} updated their profile`,
    entity: "User",
    entityId: user.id,
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
