"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ChevronDown,
  Flag,
  Loader2,
  UserPlus,
} from "lucide-react";
import type { RequestPriority, RequestStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from "@/lib/constants";
import {
  assignTechnician,
  changePriority,
  changeStatus,
  scheduleRequest,
  type ActionResult,
} from "@/lib/actions/requests";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Technician = { id: string; name: string; specialization?: string | null };

export function RequestActions({
  requestId,
  status,
  priority,
  technicianId,
  technicians,
  canAssign,
  canPriority,
  canStatus,
}: {
  requestId: string;
  status: RequestStatus;
  priority: RequestPriority;
  technicianId: string | null;
  technicians: Technician[];
  canAssign: boolean;
  canPriority: boolean;
  canStatus: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState<null | "assign" | "status" | "priority" | "schedule">(
    null,
  );
  const [pending, setPending] = React.useState(false);

  // local field state
  const [tech, setTech] = React.useState(technicianId ?? "");
  const [nextStatus, setNextStatus] = React.useState<RequestStatus>(status);
  const [nextPriority, setNextPriority] = React.useState<RequestPriority>(priority);
  const [note, setNote] = React.useState("");
  const [when, setWhen] = React.useState("");

  async function run(fn: () => Promise<ActionResult>, successMsg: string) {
    setPending(true);
    const res = await fn();
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(successMsg);
    setOpen(null);
    setNote("");
    router.refresh();
  }

  const fd = (obj: Record<string, string>) => {
    const f = new FormData();
    Object.entries(obj).forEach(([k, v]) => f.set(k, v));
    return f;
  };

  return (
    <div className="space-y-2">
      {canAssign && (
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setOpen("assign")}
        >
          <UserPlus className="size-4" />
          {technicianId ? "Reassign technician" : "Assign technician"}
        </Button>
      )}
      {canStatus && (
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setOpen("status")}
        >
          <ChevronDown className="size-4" /> Change status
        </Button>
      )}
      {canPriority && (
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setOpen("priority")}
        >
          <Flag className="size-4" /> Change priority
        </Button>
      )}
      {canAssign && (
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setOpen("schedule")}
        >
          <CalendarClock className="size-4" /> Schedule visit
        </Button>
      )}

      {/* Assign */}
      <Dialog open={open === "assign"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign a technician</DialogTitle>
            <DialogDescription>
              They&apos;ll be notified with the property, unit and issue details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Technician</Label>
            <Select value={tech} onValueChange={setTech}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                    {t.specialization ? ` · ${t.specialization}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(null)}>
              Cancel
            </Button>
            <Button
              disabled={pending || !tech}
              onClick={() =>
                run(
                  () => assignTechnician(fd({ requestId, technicianId: tech })),
                  "Request assigned successfully.",
                )
              }
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status */}
      <Dialog open={open === "status"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update status</DialogTitle>
            <DialogDescription>
              The tenant and manager are notified of the change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={nextStatus}
                onValueChange={(v) => setNextStatus(v as RequestStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-note">Note (optional)</Label>
              <Input
                id="status-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Waiting on a replacement valve"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(null)}>
              Cancel
            </Button>
            <Button
              disabled={pending || nextStatus === status}
              onClick={() =>
                run(
                  () =>
                    changeStatus(
                      fd({ requestId, status: nextStatus, note }),
                    ),
                  "Request status updated.",
                )
              }
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Save status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Priority */}
      <Dialog open={open === "priority"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change priority</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={nextPriority}
              onValueChange={(v) => setNextPriority(v as RequestPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_ORDER.slice()
                  .reverse()
                  .map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(null)}>
              Cancel
            </Button>
            <Button
              disabled={pending || nextPriority === priority}
              onClick={() =>
                run(
                  () =>
                    changePriority(fd({ requestId, priority: nextPriority })),
                  "Priority updated.",
                )
              }
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Save priority
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule */}
      <Dialog open={open === "schedule"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a visit</DialogTitle>
            <DialogDescription>
              Adds the job to the maintenance calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="sched">Date &amp; time</Label>
            <Input
              id="sched"
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(null)}>
              Cancel
            </Button>
            <Button
              disabled={pending || !when}
              onClick={() =>
                run(
                  () =>
                    scheduleRequest(fd({ requestId, scheduledFor: when })),
                  "Visit scheduled.",
                )
              }
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
