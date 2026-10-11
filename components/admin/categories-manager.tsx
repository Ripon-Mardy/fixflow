"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import {
  createCategory,
  deleteCategory,
  toggleCategory,
  updateCategory,
} from "@/lib/actions/admin";

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  enabled: boolean;
  requestCount: number;
};

export function CategoriesManager({ rows }: { rows: AdminCategoryRow[] }) {
  const router = useRouter();
  const [dialog, setDialog] = React.useState<
    { mode: "create" } | { mode: "edit"; row: AdminCategoryRow } | null
  >(null);
  const [confirmDelete, setConfirmDelete] = React.useState<AdminCategoryRow | null>(
    null,
  );
  const [busy, setBusy] = React.useState(false);
  const editing = dialog?.mode === "edit" ? dialog.row : null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = editing ? await updateCategory(fd) : await createCategory(fd);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(editing ? "Category updated." : "Category created.");
    setDialog(null);
    router.refresh();
  }

  async function onToggle(row: AdminCategoryRow) {
    const res = await toggleCategory(row.id);
    if (!res.ok) return toast.error(res.error);
    toast.success(row.enabled ? "Category disabled." : "Category enabled.");
    router.refresh();
  }

  async function doDelete() {
    if (!confirmDelete) return;
    setBusy(true);
    const res = await deleteCategory(confirmDelete.id);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Category deleted.");
    setConfirmDelete(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialog({ mode: "create" })}>
          <Plus className="size-4" /> Create category
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="p-0">
                  <EmptyState className="border-0" icon={Tags} title="No categories." />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {c.slug}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {c.requestCount}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={c.enabled}
                      onCheckedChange={() => onToggle(c)}
                      aria-label={`Toggle ${c.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setDialog({ mode: "edit", row: c })}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => setConfirmDelete(c)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!dialog} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "Create category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Name</Label>
              <Input
                id="c-name"
                name="name"
                defaultValue={editing?.name}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-icon">Lucide icon name</Label>
              <Input
                id="c-icon"
                name="icon"
                defaultValue={editing?.icon ?? "wrench"}
                placeholder="wrench"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="enabled"
                value="true"
                defaultChecked={editing ? editing.enabled : true}
                className="size-4 rounded border-input"
              />
              Enabled (tenants can pick this category)
            </label>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {editing ? "Save changes" : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remove{" "}
            <span className="font-medium text-foreground">
              {confirmDelete?.name}
            </span>
            ? Categories used by existing requests can&apos;t be deleted — disable
            them instead.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={doDelete} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
