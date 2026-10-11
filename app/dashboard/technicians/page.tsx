import type { Metadata } from "next";
import Link from "next/link";
import { Star, Wrench } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listTechnicians } from "@/lib/queries/people";
import { PageHeader } from "@/components/dashboard/page-header";
import { ToolbarSearch } from "@/components/dashboard/toolbar-search";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Technicians" };
export const dynamic = "force-dynamic";

const AVAIL: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  BUSY: { label: "Busy", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  OFF_DUTY: { label: "Off duty", className: "bg-muted text-muted-foreground" },
};

export default async function TechniciansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["MANAGER", "ADMIN"]);
  const { q } = await searchParams;
  const technicians = await listTechnicians(q);

  return (
    <div>
      <PageHeader
        title="Technicians"
        description="Your maintenance team, their workload and performance."
      />
      <div className="pb-4">
        <ToolbarSearch placeholder="Search technicians…" />
      </div>

      {technicians.length === 0 ? (
        <EmptyState icon={Wrench} title="No technicians found." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {technicians.map((t) => {
            const avail = AVAIL[t.technicianProfile?.availability ?? "OFF_DUTY"];
            return (
              <Link key={t.id} href={`/dashboard/technicians/${t.id}`}>
                <Card className="h-full p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11">
                      {t.avatarUrl && <AvatarImage src={t.avatarUrl} alt={t.name} />}
                      <AvatarFallback>{initials(t.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.technicianProfile?.specialization ?? "Technician"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className={cn("border-transparent", avail.className)}
                    >
                      {avail.label}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {t.technicianProfile?.rating.toFixed(1) ?? "—"}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
                    <Stat label="Active" value={t._count.requestsAssigned} />
                    <Stat
                      label="Completed"
                      value={t.technicianProfile?.completedJobs ?? 0}
                    />
                    <Stat
                      label="Avg hrs"
                      value={
                        t.technicianProfile
                          ? Math.round(t.technicianProfile.avgResolutionHours)
                          : "—"
                      }
                    />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
