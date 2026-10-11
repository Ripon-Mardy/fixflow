"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import {
  addUnit,
  createProperty,
  deleteProperty,
  updateProperty,
} from "@/lib/actions/admin";

export type AdminPropertyRow = {
  id: string;
  name: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  imageUrl: string | null;
  description: string | null;
  yearBuilt: number | null;
  managerId: string | null;
  managerName: string | null;
  unitCount: number;
  requestCount: number;
  createdAt: string;
};

export function PropertiesManager({
  rows,
  managers,
}: {
  rows: AdminPropertyRow[];
  managers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [dialog, setDialog] = React.useState<
    | { mode: "create" }
    | { mode: "edit"; row: AdminPropertyRow }
    | { mode: "units"; row: AdminPropertyRow }
    | null
  >(null);
  const [confirmDelete, setConfirmDelete] = React.useState<AdminPropertyRow | null>(
    null,
  );
  const [busy, setBusy] = React.useState(false);

  async function submitProperty(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res =
      dialog?.mode === "edit" ? await updateProperty(fd) : await createProperty(fd);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(
      dialog?.mode === "edit"
        ? "Property updated successfully."
        : "Property created successfully.",
    );
    setDialog(null);
    router.refresh();
  }

  async function submitUnit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (dialog?.mode !== "units") return;
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    fd.set("propertyId", dialog.row.id);
    const res = await addUnit(fd);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Unit added.");
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  async function doDelete() {
    if (!confirmDelete) return;
    setBusy(true);
    const res = await deleteProperty(confirmDelete.id);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Property deleted.");
    setConfirmDelete(null);
    router.refresh();
  }

  const editing = dialog?.mode === "edit" ? dialog.row : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialog({ mode: "create" })}>
          <Plus className="size-4" /> Create property
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead className="hidden md:table-cell">Manager</TableHead>
              <TableHead>Units</TableHead>
              <TableHead className="hidden lg:table-cell">Requests</TableHead>
              <TableHead className="hidden lg:table-cell">Added</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    className="border-0"
                    icon={Building2}
                    title="No properties yet."
                    action={
                      <Button onClick={() => setDialog({ mode: "create" })}>
                        <Plus className="size-4" /> Create property
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="block text-sm font-medium">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {p.addressLine}, {p.city}, {p.state}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {p.managerName ?? (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">{p.unitCount}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm tabular-nums">
                    {p.requestCount}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/properties/${p.id}`}>
                            <ExternalLink /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDialog({ mode: "edit", row: p })}
                        >
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDialog({ mode: "units", row: p })}
                        >
                          <Building2 /> Manage units
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setConfirmDelete(p)}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / edit */}
      <Dialog
        open={dialog?.mode === "create" || dialog?.mode === "edit"}
        onOpenChange={(v) => !v && setDialog(null)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit property" : "Create property"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitProperty} className="space-y-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" name="name" defaultValue={editing?.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-address">Street address</Label>
              <Input
                id="p-address"
                name="addressLine"
                defaultValue={editing?.addressLine}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-city">City</Label>
                <Input id="p-city" name="city" defaultValue={editing?.city} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-state">State</Label>
                <Input
                  id="p-state"
                  name="state"
                  defaultValue={editing?.state}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-zip">Postal code</Label>
                <Input
                  id="p-zip"
                  name="postalCode"
                  defaultValue={editing?.postalCode}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Property manager</Label>
                <Select
                  name="managerId"
                  defaultValue={editing?.managerId ?? "none"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-year">Year built</Label>
                <Input
                  id="p-year"
                  name="yearBuilt"
                  type="number"
                  defaultValue={editing?.yearBuilt ?? ""}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-image">Image URL (Unsplash)</Label>
              <Input
                id="p-image"
                name="imageUrl"
                defaultValue={editing?.imageUrl ?? ""}
                placeholder="https://images.unsplash.com/…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                name="description"
                rows={2}
                defaultValue={editing?.description ?? ""}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {editing ? "Save changes" : "Create property"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Units */}
      <Dialog
        open={dialog?.mode === "units"}
        onOpenChange={(v) => !v && setDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add a unit{dialog?.mode === "units" ? ` · ${dialog.row.name}` : ""}
            </DialogTitle>
            <DialogDescription>
              {dialog?.mode === "units"
                ? `${dialog.row.unitCount} units currently.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitUnit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="u-label">Unit label</Label>
              <Input id="u-label" name="label" placeholder="e.g. Unit 5C" required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="u-bd">Bedrooms</Label>
                <Input id="u-bd" name="bedrooms" type="number" defaultValue={1} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="u-ba">Bathrooms</Label>
                <Input id="u-ba" name="bathrooms" type="number" defaultValue={1} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="u-fl">Floor</Label>
                <Input id="u-fl" name="floor" type="number" defaultValue={1} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
                Close
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Add unit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete property</DialogTitle>
            <DialogDescription>
              Permanently removes{" "}
              <span className="font-medium text-foreground">
                {confirmDelete?.name}
              </span>{" "}
              and its units. Properties with maintenance requests can&apos;t be
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={doDelete} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              Delete property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
