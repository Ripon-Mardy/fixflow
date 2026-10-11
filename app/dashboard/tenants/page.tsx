import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listTenants } from "@/lib/queries/people";
import { PageHeader } from "@/components/dashboard/page-header";
import { ToolbarSearch } from "@/components/dashboard/toolbar-search";
import { EmptyState } from "@/components/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Tenants" };
export const dynamic = "force-dynamic";

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["MANAGER", "ADMIN"]);
  const { q } = await searchParams;
  const tenants = await listTenants(q);

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Everyone renting across your properties, with their active requests."
      />
      <div className="pb-4">
        <ToolbarSearch placeholder="Search tenants by name or email…" />
      </div>

      {tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants found."
          description={q ? `Nothing matches "${q}".` : "Tenants will appear here once added."}
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead className="hidden md:table-cell">Property</TableHead>
                <TableHead className="hidden lg:table-cell">Contact</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/tenants/${t.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="size-8">
                        {t.avatarUrl && <AvatarImage src={t.avatarUrl} alt={t.name} />}
                        <AvatarFallback>{initials(t.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="block text-sm font-medium">{t.name}</span>
                        <span className="block text-xs text-muted-foreground md:hidden">
                          {t.unit?.property.name ?? "No unit"}
                        </span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {t.unit ? (
                      <>
                        {t.unit.property.name}
                        <span className="block text-xs text-muted-foreground">
                          {t.unit.label}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No unit</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" /> {t.email}
                    </span>
                    {t.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="size-3" /> {t.phone}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="tabular-nums text-sm">
                      {t._count.requestsCreated}
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
