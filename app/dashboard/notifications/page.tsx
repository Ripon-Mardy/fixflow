import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { NotificationsList } from "@/components/dashboard/notifications-list";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { request: { select: { id: true, reference: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Everything that's happened on your requests and across your team."
      />
      <NotificationsList initial={items} />
    </div>
  );
}
