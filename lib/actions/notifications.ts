"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notifications";

export async function fetchNotifications(limit = 8) {
  const user = await requireUser();
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { request: { select: { id: true, reference: true } } },
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);
  return { items, unread };
}

export async function markRead(id: string) {
  const user = await requireUser();
  await markNotificationRead(id, user.id);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

export async function markAllRead() {
  const user = await requireUser();
  await markAllNotificationsRead(user.id);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}
