import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth";
import { getTenantDetail } from "@/lib/queries/people";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { formatDate, initials } from "@/lib/utils";
import { OPEN_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const u = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  return { title: u?.name ?? "Tenant" };
}

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["MANAGER", "ADMIN"]);
  const { id } = await params;
  const data = await getTenantDetail(id);
  if (!data) notFound();
  const { tenant, requests } = data;

  const open = requests.filter((r) => OPEN_STATUSES.includes(r.status));
  const history = requests.filter((r) => !OPEN_STATUSES.includes(r.status));

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/tenants"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All tenants
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-16">
          {tenant.avatarUrl && <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />}
          <AvatarFallback className="text-lg">{initials(tenant.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{tenant.name}</h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Mail className="size-3.5" /> {tenant.email}
            </span>
            {tenant.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" /> {tenant.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4" /> Residence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-sm">
            {tenant.unit ? (
              <dl className="space-y-2">
                <Row label="Property">
                  <Link
                    href={`/dashboard/properties/${tenant.unit.property.id}`}
                    className="font-medium hover:underline"
                  >
                    {tenant.unit.property.name}
                  </Link>
                </Row>
                <Row label="Unit">{tenant.unit.label}</Row>
                <Row label="Floor">{tenant.unit.floor}</Row>
                <Row label="Address">
                  {tenant.unit.property.addressLine}, {tenant.unit.property.city}
                </Row>
                <Row label="Member since">{formatDate(tenant.createdAt)}</Row>
              </dl>
            ) : (
              <p className="text-muted-foreground">No unit assigned.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Active requests ({open.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {open.length === 0 ? (
                <EmptyState className="border-0 py-8" title="No active requests." />
              ) : (
                <RequestList items={open} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Request history</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <EmptyState className="border-0 py-8" title="No past requests." />
              ) : (
                <RequestList items={history} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function RequestList({
  items,
}: {
  items: {
    id: string;
    reference: string;
    title: string;
    status: import("@prisma/client").RequestStatus;
    priority: import("@prisma/client").RequestPriority;
    createdAt: Date;
    property: { name: string };
    category: { name: string };
  }[];
}) {
  return (
    <ul className="divide-y">
      {items.map((r) => (
        <li key={r.id}>
          <Link
            href={`/dashboard/requests/${r.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{r.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {r.reference} · {r.category.name} · {formatDate(r.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <PriorityBadge priority={r.priority} />
              <StatusBadge status={r.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
