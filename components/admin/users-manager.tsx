"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { toast } from "sonner";
import { cn, formatDate, initials } from "@/lib/utils";
import { ROLE_META } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { RoleBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import {
  createUser,
  deleteUser,
  setUserStatus,
  updateUser,
} from "@/lib/actions/admin";

const ROLES: Role[] = ["ADMIN", "MANAGER", "TECHNICIAN", "TENANT"];

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "DISABLED";
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  unit: { label: string; property: { name: string } } | null;
  _count: { requestsCreated: number; requestsAssigned: number };
};

export function UsersManager({
  rows,
  total,
  page,
  pageCount,
  currentUserId,
}: {
  rows: AdminUserRow[];
  total: number;
  page: number;
  pageCount: number;
  currentUserId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");
  const [dialog, setDialog] = React.useState<
    { mode: "create" } | { mode: "edit"; row: AdminUserRow } | null
  >(null);
  const [confirmDelete, setConfirmDelete] = React.useState<AdminUserRow | null>(null);
  const [busy, setBusy] = React.useState(false);

  const setParam = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (!v || v === "ALL") params.delete(k);
        else params.set(k, v);
      }
      if (!("page" in updates)) params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  React.useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (search === current) return;
    const t = setTimeout(() => setParam({ q: search || null }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const roleFilter = searchParams.get("role") ?? "ALL";

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res =
      dialog?.mode === "edit"
        ? await updateUser(fd)
        : await createUser(fd);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(
      dialog?.mode === "edit" ? "User updated successfully." : "User created successfully.",
    );
    setDialog(null);
    router.refresh();
  }

  async function toggleStatus(row: AdminUserRow) {
    const res = await setUserStatus(
      row.id,
      row.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
    );
    if (!res.ok) return toast.error(res.error);
    toast.success(row.status === "ACTIVE" ? "User disabled." : "User re-enabled.");
    router.refresh();
  }

  async function doDelete() {
    if (!confirmDelete) return;
    setBusy(true);
    const res = await deleteUser(confirmDelete.id);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("User deleted.");
    setConfirmDelete(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => setParam({ role: v })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_META[r].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <Plus className="size-4" /> Create user
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    className="border-0"
                    icon={Search}
                    title="No users match."
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.name} />}
                        <AvatarFallback>{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="block text-sm font-medium">
                          {u.name}
                          {u.id === currentUserId && (
                            <span className="ml-1.5 text-xs text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-muted-foreground md:hidden">
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={u.role} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                        u.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          u.status === "ACTIVE" ? "bg-emerald-500" : "bg-muted-foreground",
                        )}
                      />
                      {u.status === "ACTIVE" ? "Active" : "Disabled"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDialog({ mode: "edit", row: u })}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        {u.id !== currentUserId && (
                          <DropdownMenuItem onClick={() => toggleStatus(u)}>
                            {u.status === "ACTIVE" ? (
                              <>
                                <Ban /> Disable
                              </>
                            ) : (
                              <>
                                <UserCheck /> Enable
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={u.id === currentUserId}
                          onClick={() => setConfirmDelete(u)}
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>{total} users</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setParam({ page: String(page - 1) })}
          >
            Prev
          </Button>
          <span className="tabular-nums">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setParam({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={!!dialog} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "edit" ? "Edit user" : "Create user"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.mode === "edit"
                ? "Update this account's details and role."
                : "New accounts get the demo password so you can sign in as them."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitForm} className="space-y-4">
            {dialog?.mode === "edit" && (
              <input type="hidden" name="id" value={dialog.row.id} />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="u-name">Name</Label>
                <Input
                  id="u-name"
                  name="name"
                  defaultValue={dialog?.mode === "edit" ? dialog.row.name : ""}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="u-email">Email</Label>
                <Input
                  id="u-email"
                  name="email"
                  type="email"
                  defaultValue={dialog?.mode === "edit" ? dialog.row.email : ""}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  name="role"
                  defaultValue={dialog?.mode === "edit" ? dialog.row.role : "TENANT"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_META[r].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  name="status"
                  defaultValue={dialog?.mode === "edit" ? dialog.row.status : "ACTIVE"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DISABLED">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-phone">Phone (optional)</Label>
              <Input
                id="u-phone"
                name="phone"
                defaultValue={
                  dialog?.mode === "edit" ? (dialog.row.phone ?? "") : ""
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {dialog?.mode === "edit" ? "Save changes" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-foreground">
                {confirmDelete?.name}
              </span>
              . Accounts with maintenance history can&apos;t be deleted — disable
              them instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={doDelete} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              <CheckCircle2 className="size-4" /> Delete user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
