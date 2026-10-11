"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { RequestPriority, RequestStatus } from "@prisma/client";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";
import { PRIORITY_META } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { scheduleRequest } from "@/lib/actions/requests";

export type CalendarJob = {
  id: string;
  reference: string;
  title: string;
  scheduledFor: string;
  status: RequestStatus;
  priority: RequestPriority;
  property: string;
  unit: string | null;
  technician: string | null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MaintenanceCalendar({
  jobs,
  canReschedule,
}: {
  jobs: CalendarJob[];
  canReschedule: boolean;
}) {
  const router = useRouter();
  const [view, setView] = React.useState<"month" | "week" | "day">("month");
  const [cursor, setCursor] = React.useState(() => new Date());
  const [reschedule, setReschedule] = React.useState<CalendarJob | null>(null);
  const [when, setWhen] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const byDay = React.useMemo(() => {
    const map = new Map<string, CalendarJob[]>();
    for (const j of jobs) {
      const key = new Date(j.scheduledFor).toDateString();
      map.set(key, [...(map.get(key) ?? []), j]);
    }
    return map;
  }, [jobs]);

  function shift(dir: number) {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCursor(d);
  }

  async function submitReschedule() {
    if (!reschedule || !when) return;
    setPending(true);
    const fd = new FormData();
    fd.set("requestId", reschedule.id);
    fd.set("scheduledFor", when);
    const res = await scheduleRequest(fd);
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Job rescheduled.");
    setReschedule(null);
    setWhen("");
    router.refresh();
  }

  const title =
    view === "month"
      ? cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : view === "week"
        ? `Week of ${weekStart(cursor).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`
        : cursor.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <p className="ml-2 font-medium">{title}</p>
        </div>
        <div className="inline-flex rounded-lg border p-0.5">
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors",
                view === v
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" && (
        <MonthGrid
          cursor={cursor}
          byDay={byDay}
          onJob={(j) => router.push(`/dashboard/requests/${j.id}`)}
          onReschedule={canReschedule ? (j) => setReschedule(j) : undefined}
        />
      )}
      {view === "week" && (
        <DayList
          days={weekDays(cursor)}
          byDay={byDay}
          onJob={(j) => router.push(`/dashboard/requests/${j.id}`)}
          onReschedule={canReschedule ? (j) => setReschedule(j) : undefined}
        />
      )}
      {view === "day" && (
        <DayList
          days={[new Date(cursor)]}
          byDay={byDay}
          onJob={(j) => router.push(`/dashboard/requests/${j.id}`)}
          onReschedule={canReschedule ? (j) => setReschedule(j) : undefined}
        />
      )}

      <Dialog
        open={!!reschedule}
        onOpenChange={(v) => {
          if (!v) setReschedule(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule visit</DialogTitle>
          </DialogHeader>
          {reschedule && (
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-medium">{reschedule.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {reschedule.reference} · currently{" "}
                  {formatDateTime(reschedule.scheduledFor)}
                </span>
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="resched">New date &amp; time</Label>
                <Input
                  id="resched"
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReschedule(null)}>
              Cancel
            </Button>
            <Button onClick={submitReschedule} disabled={pending || !when}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function weekStart(d: Date) {
  const s = new Date(d);
  s.setDate(s.getDate() - s.getDay());
  s.setHours(0, 0, 0, 0);
  return s;
}
function weekDays(d: Date) {
  const s = weekStart(d);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(s);
    day.setDate(s.getDate() + i);
    return day;
  });
}

function MonthGrid({
  cursor,
  byDay,
  onJob,
  onReschedule,
}: {
  cursor: Date;
  byDay: Map<string, CalendarJob[]>;
  onJob: (j: CalendarJob) => void;
  onReschedule?: (j: CalendarJob) => void;
}) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const today = new Date().toDateString();

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const jobs = byDay.get(d.toDateString()) ?? [];
          return (
            <div
              key={i}
              className={cn(
                "min-h-[92px] border-b border-r p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                !inMonth && "bg-muted/30 text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs",
                  d.toDateString() === today &&
                    "bg-primary font-semibold text-primary-foreground",
                )}
              >
                {d.getDate()}
              </div>
              <div className="space-y-1">
                {jobs.slice(0, 3).map((j) => (
                  <button
                    key={j.id}
                    onClick={() => onJob(j)}
                    onContextMenu={(e) => {
                      if (onReschedule) {
                        e.preventDefault();
                        onReschedule(j);
                      }
                    }}
                    className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium"
                    style={{
                      background: `color-mix(in oklch, ${
                        PRIORITY_META[j.priority].dot.includes("red")
                          ? "red"
                          : PRIORITY_META[j.priority].dot.includes("amber")
                            ? "orange"
                            : PRIORITY_META[j.priority].dot.includes("sky")
                              ? "dodgerblue"
                              : "gray"
                      } 14%, transparent)`,
                    }}
                    title={`${j.title} · ${j.reference}`}
                  >
                    {new Date(j.scheduledFor).toLocaleTimeString("en-US", {
                      hour: "numeric",
                    })}{" "}
                    {j.title}
                  </button>
                ))}
                {jobs.length > 3 && (
                  <span className="block px-1.5 text-[10px] text-muted-foreground">
                    +{jobs.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayList({
  days,
  byDay,
  onJob,
  onReschedule,
}: {
  days: Date[];
  byDay: Map<string, CalendarJob[]>;
  onJob: (j: CalendarJob) => void;
  onReschedule?: (j: CalendarJob) => void;
}) {
  return (
    <div className="space-y-4">
      {days.map((d) => {
        const jobs = (byDay.get(d.toDateString()) ?? []).sort(
          (a, b) =>
            new Date(a.scheduledFor).getTime() -
            new Date(b.scheduledFor).getTime(),
        );
        return (
          <div key={d.toISOString()} className="rounded-xl border">
            <div className="border-b bg-muted/30 px-4 py-2 text-sm font-medium">
              {d.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
            {jobs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No scheduled maintenance.
              </p>
            ) : (
              <ul className="divide-y">
                {jobs.map((j) => (
                  <li
                    key={j.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <button
                      onClick={() => onJob(j)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium tabular-nums">
                          {new Date(j.scheduledFor).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="truncate text-sm">{j.title}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {j.reference} · {j.property}
                        {j.unit ? ` · ${j.unit}` : ""}
                        {j.technician ? ` · ${j.technician}` : ""}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <PriorityBadge priority={j.priority} />
                      <StatusBadge status={j.status} />
                      {onReschedule && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReschedule(j)}
                        >
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
