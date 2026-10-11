import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth";
import { getRequestDetail } from "@/lib/queries/requests";
import { RequestDetail } from "@/components/dashboard/request-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const req = await prisma.maintenanceRequest.findUnique({
    where: { id },
    select: { reference: true, title: true },
  });
  return { title: req ? `${req.reference} · ${req.title}` : "Request" };
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const request = await getRequestDetail(user, id);
  if (!request) notFound();

  const technicians =
    user.role === "MANAGER" || user.role === "ADMIN"
      ? (
          await prisma.user.findMany({
            where: { role: "TECHNICIAN", status: "ACTIVE" },
            select: {
              id: true,
              name: true,
              technicianProfile: { select: { specialization: true } },
            },
            orderBy: { name: "asc" },
          })
        ).map((t) => ({
          id: t.id,
          name: t.name,
          specialization: t.technicianProfile?.specialization ?? null,
        }))
      : [];

  return <RequestDetail request={request} viewer={user} technicians={technicians} />;
}
