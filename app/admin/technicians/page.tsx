import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listTechnicians } from "@/lib/queries/people";
import { PageHeader } from "@/components/dashboard/page-header";
import { ToolbarSearch } from "@/components/dashboard/toolbar-search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Technicians" };
export const dynamic = "force-dynamic";

const AVAIL: Record<string, string> = {
  AVAILABLE: "Available",
  BUSY: "Busy",
  OFF_DUTY: "Off duty",
};

export default async function AdminTechniciansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("ADMIN", { redirectTo: "/dashboard" });
  const { q } = await searchParams;
  const technicians = await listTechnicians(q);

  return (
    <div>
      <PageHeader
        title="Technicians"
        description="Your maintenance workforce, workload and ratings. Edit accounts from the Users page."
      />
      <div className="pb-4">
        <ToolbarSearch placeholder="Search technicians…" />
      </div>

      {technicians.length === 0 ? (
        <EmptyState title="No technicians found." />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Specialization</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="hidden lg:table-cell">Completed</TableHead>
                <TableHead className="hidden lg:table-cell">Avg hrs</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/technicians/${t.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="size-8">
                        {t.avatarUrl && <AvatarImage src={t.avatarUrl} alt={t.name} />}
                        <AvatarFallback>{initials(t.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{t.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {t.technicianProfile?.specialization ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {t._count.requestsAssigned}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm tabular-nums">
                    {t.technicianProfile?.completedJobs ?? 0}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm tabular-nums">
                    {t.technicianProfile
                      ? Math.round(t.technicianProfile.avgResolutionHours)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {AVAIL[t.technicianProfile?.availability ?? "OFF_DUTY"]}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {t.technicianProfile?.rating.toFixed(1) ?? "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
