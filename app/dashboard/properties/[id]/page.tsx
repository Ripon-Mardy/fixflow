import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Clock,
  MapPin,
  Users,
  Wrench,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth";
import { getPropertyDetail } from "@/lib/queries/properties";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { SmartImage } from "@/components/smart-image";
import { EmptyState } from "@/components/empty-state";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await prisma.property.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: p?.name ?? "Property" };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["MANAGER", "ADMIN"]);
  const { id } = await params;
  const data = await getPropertyDetail(id);
  if (!data) notFound();
  const { property, requests, stats } = data;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/properties"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All properties
      </Link>

      <div className="overflow-hidden rounded-xl border">
        <div className="relative aspect-[21/9] bg-muted">
          <SmartImage
            src={property.imageUrl ?? ""}
            alt={property.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {property.name}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {property.addressLine}, {property.city}, {property.state}{" "}
              {property.postalCode}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Managed by{" "}
            <span className="font-medium text-foreground">
              {property.manager?.name ?? "Unassigned"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Units" value={property.units.length} icon={Building2} />
        <StatCard label="Tenants" value={stats.tenantCount} icon={Users} />
        <StatCard label="Open requests" value={stats.openCount} icon={Wrench} tone="primary" />
        <StatCard label="Total requests" value={stats.totalRequests} icon={Wrench} />
        <StatCard
          label="Avg. resolution"
          value={
            stats.avgResolutionDays != null
              ? `${stats.avgResolutionDays.toFixed(1)}d`
              : "—"
          }
          icon={Clock}
        />
      </div>

      <Tabs defaultValue="units">
        <TabsList>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="requests">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="units">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Units &amp; tenants</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {property.units.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{u.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.bedrooms} bd · {u.bathrooms} ba · floor {u.floor}
                      </p>
                    </div>
                    <div className="text-right">
                      {u.tenants.length > 0 ? (
                        u.tenants.map((t) => (
                          <Link
                            key={t.id}
                            href={`/dashboard/tenants/${t.id}`}
                            className="block text-sm hover:underline"
                          >
                            {t.name}
                          </Link>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Vacant
                        </span>
                      )}
                      {u._count.requests > 0 && (
                        <span className="text-xs text-primary">
                          {u._count.requests} open
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Recent maintenance requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {requests.length === 0 ? (
                <EmptyState
                  className="border-0"
                  title="No maintenance requests yet."
                />
              ) : (
                <ul className="divide-y">
                  {requests.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/dashboard/requests/${r.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {r.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.reference} · {r.unit?.label ?? "—"} ·{" "}
                            {r.tenant.name} · {formatDate(r.createdAt)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
