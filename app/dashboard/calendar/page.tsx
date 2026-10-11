import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requestScope } from "@/lib/queries/scope";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  MaintenanceCalendar,
  type CalendarJob,
} from "@/components/dashboard/maintenance-calendar";

export const metadata: Metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await requireRole(["MANAGER", "ADMIN", "TECHNICIAN"]);

  const requests = await prisma.maintenanceRequest.findMany({
    where: { AND: [requestScope(user), { scheduledFor: { not: null } }] },
    orderBy: { scheduledFor: "asc" },
    include: {
      property: { select: { name: true } },
      unit: { select: { label: true } },
      technician: { select: { name: true } },
    },
  });

  const jobs: CalendarJob[] = requests.map((r) => ({
    id: r.id,
    reference: r.reference,
    title: r.title,
    scheduledFor: r.scheduledFor!.toISOString(),
    status: r.status,
    priority: r.priority,
    property: r.property.name,
    unit: r.unit?.label ?? null,
    technician: r.technician?.name ?? null,
  }));

  return (
    <div>
      <PageHeader
        title="Maintenance calendar"
        description="Scheduled visits across your properties. Click a job to open it; right-click (or use Reschedule) to move it."
      />
      <MaintenanceCalendar
        jobs={jobs}
        canReschedule={user.role === "MANAGER" || user.role === "ADMIN"}
      />
    </div>
  );
}
