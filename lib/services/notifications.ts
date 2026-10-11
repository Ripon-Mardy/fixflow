import "server-only";
import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/**
 * Notification service.
 *
 * Today this only writes rows to the database (surfaced in the in-app
 * notification center). The `dispatchExternal` hook is where email / SMS /
 * push providers (SendGrid, Twilio, web-push) would be wired in later — the
 * rest of the app never needs to know which channel was used.
 */
type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  requestId?: string | null;
};

export async function notify(input: NotifyInput | NotifyInput[]) {
  const items = Array.isArray(input) ? input : [input];
  if (items.length === 0) return;

  await prisma.notification.createMany({
    data: items.map((i) => ({
      userId: i.userId,
      type: i.type,
      title: i.title,
      body: i.body,
      requestId: i.requestId ?? null,
    })),
  });

  await Promise.allSettled(items.map(dispatchExternal));
}

/** Placeholder for real delivery channels. No-op in demo mode. */
async function dispatchExternal(_input: NotifyInput) {
  if (process.env.NOTIFICATIONS_PROVIDER === "console") {
    console.info("[notification]", _input.type, "→", _input.userId);
  }
  return Promise.resolve();
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
