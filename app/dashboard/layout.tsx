import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DASHBOARD_NAV, navForRole } from "@/lib/nav";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const unread = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return (
    <DashboardShell
      nav={navForRole(DASHBOARD_NAV, user.role)}
      unread={unread}
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }}
    >
      {children}
    </DashboardShell>
  );
}
