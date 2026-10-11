import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listProperties } from "@/lib/queries/properties";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { SmartImage } from "@/components/smart-image";
import { EmptyState } from "@/components/empty-state";
import { pluralize } from "@/lib/utils";

export const metadata: Metadata = { title: "Properties" };
export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  await requireRole(["MANAGER", "ADMIN"]);
  const properties = await listProperties();

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Every building you manage, with occupancy and open work at a glance."
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties found."
          description="Properties added in the admin panel will appear here."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => (
            <Link key={p.id} href={`/dashboard/properties/${p.id}`}>
              <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <SmartImage
                    src={p.imageUrl ?? ""}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  {p.openRequests > 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
                      {pluralize(p.openRequests, "open request")}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {p.addressLine}, {p.city}, {p.state}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="size-3.5" />
                      {pluralize(p.unitCount, "unit")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {p.occupancy}% occupied
                    </span>
                    <span>{p.manager?.name ?? "Unassigned"}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
