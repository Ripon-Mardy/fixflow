"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import type { RequestPriority, RequestStatus } from "@prisma/client";
import { cn, formatDate } from "@/lib/utils";
import { STATUS_META, PRIORITY_META, STATUS_ORDER, PRIORITY_ORDER } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

type Row = {
  id: string;
  reference: string;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: string | Date;
  property: { id: string; name: string };
  unit: { label: string } | null;
  tenant: { id: string; name: string };
  technician: { id: string; name: string } | null;
  category: { name: string };
};

type Options = {
  properties: { id: string; name: string }[];
  technicians: { id: string; name: string }[];
  categories: { id: string; name: string }[];
};

const ALL = "ALL";

export function RequestsTable({
  rows,
  total,
  page,
  pageCount,
  options,
  showColumns = {
    property: true,
    tenant: true,
    technician: true,
  },
}: {
  rows: Row[];
  total: number;
  page: number;
  pageCount: number;
  options: Options;
  showColumns?: { property?: boolean; tenant?: boolean; technician?: boolean };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = React.useTransition();

  const setParam = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === ALL) params.delete(key);
        else params.set(key, value);
      }
      if (!("page" in updates)) params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  // Debounced search
  React.useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (search === current) return;
    const t = setTimeout(() => setParam({ q: search || null }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const status = searchParams.get("status") ?? ALL;
  const priority = searchParams.get("priority") ?? ALL;
  const propertyId = searchParams.get("propertyId") ?? ALL;
  const technicianId = searchParams.get("technicianId") ?? ALL;
  const categoryId = searchParams.get("categoryId") ?? ALL;
  const sort = searchParams.get("sort") ?? "newest";

  const hasFilters =
    !!searchParams.get("q") ||
    status !== ALL ||
    priority !== ALL ||
    propertyId !== ALL ||
    technicianId !== ALL ||
    categoryId !== ALL;

  const cols = 3 + (showColumns.property ? 1 : 0) + (showColumns.tenant ? 1 : 0) + (showColumns.technician ? 1 : 0) + 1;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by issue, ID or tenant…"
            className="pl-9"
            aria-label="Search requests"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Status"
            value={status}
            onValueChange={(v) => setParam({ status: v })}
            options={[
              { value: ALL, label: "All statuses" },
              ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label })),
            ]}
          />
          <FilterSelect
            label="Priority"
            value={priority}
            onValueChange={(v) => setParam({ priority: v })}
            options={[
              { value: ALL, label: "All priorities" },
              ...PRIORITY_ORDER.map((p) => ({
                value: p,
                label: PRIORITY_META[p].label,
              })),
            ]}
          />
          {options.properties.length > 0 && (
            <FilterSelect
              label="Property"
              value={propertyId}
              onValueChange={(v) => setParam({ propertyId: v })}
              options={[
                { value: ALL, label: "All properties" },
                ...options.properties.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          )}
          {options.technicians.length > 0 && (
            <FilterSelect
              label="Technician"
              value={technicianId}
              onValueChange={(v) => setParam({ technicianId: v })}
              options={[
                { value: ALL, label: "Any technician" },
                { value: "UNASSIGNED", label: "Unassigned" },
                ...options.technicians.map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setParam({
                sort: sort === "newest" ? "oldest" : sort === "oldest" ? "priority" : "newest",
              })
            }
          >
            <ArrowUpDown className="size-3.5" />
            {sort === "newest" ? "Newest" : sort === "oldest" ? "Oldest" : "Priority"}
          </Button>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                startTransition(() =>
                  router.replace(pathname, { scroll: false }),
                );
              }}
            >
              <X className="size-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={cn("rounded-xl border", isPending && "opacity-60")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              {showColumns.property && (
                <TableHead className="hidden md:table-cell">Property</TableHead>
              )}
              {showColumns.tenant && (
                <TableHead className="hidden lg:table-cell">Tenant</TableHead>
              )}
              <TableHead>Priority</TableHead>
              {showColumns.technician && (
                <TableHead className="hidden lg:table-cell">Technician</TableHead>
              )}
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={cols} className="p-0">
                  <EmptyState
                    className="border-0"
                    icon={Search}
                    title="No requests match these filters."
                    description="Try clearing a filter or widening your search."
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="max-w-[260px]">
                    <Link href={`/dashboard/requests/${r.id}`} className="block">
                      <span className="block truncate font-medium">{r.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {r.reference} · {r.category.name}
                      </span>
                    </Link>
                  </TableCell>
                  {showColumns.property && (
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">{r.property.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {r.unit?.label ?? "—"}
                      </span>
                    </TableCell>
                  )}
                  {showColumns.tenant && (
                    <TableCell className="hidden lg:table-cell text-sm">
                      {r.tenant.name}
                    </TableCell>
                  )}
                  <TableCell>
                    <PriorityBadge priority={r.priority} />
                  </TableCell>
                  {showColumns.technician && (
                    <TableCell className="hidden lg:table-cell text-sm">
                      {r.technician?.name ?? (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {total === 0
            ? "No results"
            : `${(page - 1) * 10 + 1}–${Math.min(page * 10, total)} of ${total}`}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setParam({ page: String(page - 1) })}
          >
            <ChevronLeft className="size-4" /> Prev
          </Button>
          <span className="px-2 tabular-nums">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setParam({ page: String(page + 1) })}
          >
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 w-auto min-w-[130px] gap-1.5" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
