import {
  ArrowUpRight,
  Building2,
  CircleDot,
  Clock,
  LayoutDashboard,
  Siren,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  { label: "Open requests", value: "18", icon: CircleDot, tone: "text-foreground" },
  { label: "Urgent", value: "4", icon: Siren, tone: "text-red-600 dark:text-red-400" },
  { label: "In progress", value: "9", icon: Wrench, tone: "text-indigo-600 dark:text-indigo-400" },
  { label: "Resolved / mo", value: "42", icon: Clock, tone: "text-emerald-600 dark:text-emerald-400" },
];

const ROWS = [
  {
    id: "FX-2026-1048",
    issue: "Burst pipe under kitchen sink",
    property: "Riverside Apartments · 4B",
    priority: "Emergency",
    tone: "bg-red-500/10 text-red-700 dark:text-red-300",
    tech: "Mike Johnson",
    status: "In progress",
    statusTone: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  {
    id: "FX-2026-1046",
    issue: "AC not cooling unit",
    property: "Parkview Towers · 12A",
    priority: "High",
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    tech: "Priya Nair",
    status: "Assigned",
    statusTone: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  {
    id: "FX-2026-1045",
    issue: "Front building door not locking",
    property: "Greenwood Residences · Lobby",
    priority: "High",
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    tech: "Tom Callahan",
    status: "Under review",
    statusTone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    id: "FX-2026-1043",
    issue: "Dishwasher not draining",
    property: "Oak Street Homes · 310",
    priority: "Medium",
    tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    tech: "Elena Petrova",
    status: "Resolved",
    statusTone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
];

const ACTIVITY = [
  { time: "11:02", text: "Assigned FX-2026-1048 to Mike Johnson" },
  { time: "10:15", text: "Reviewed emergency request at Riverside" },
  { time: "09:42", text: "New request submitted by tenant, unit 4B" },
];

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-2xl shadow-black/5 ring-1 ring-black/5",
        className,
      )}
      aria-hidden
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <div className="ml-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <LayoutDashboard className="size-3.5" />
          app.fixflow.demo/dashboard
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Good morning, Alex</p>
            <p className="text-xs text-muted-foreground">
              Here&apos;s what&apos;s happening across your properties.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-lg border bg-background p-3">
                <div className="flex items-center justify-between">
                  <s.icon className={cn("size-4", s.tone)} />
                </div>
                <p className="mt-2 text-lg font-semibold tabular-nums">{s.value}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-[1.6fr_1fr_0.8fr] gap-2 border-b bg-muted/40 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>Request</span>
              <span className="hidden sm:block">Technician</span>
              <span>Status</span>
            </div>
            {ROWS.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1.6fr_1fr_0.8fr] items-center gap-2 border-b px-3 py-2.5 text-xs last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.issue}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {r.id} · {r.property}
                  </p>
                </div>
                <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {r.tech}
                </div>
                <span
                  className={cn(
                    "w-fit rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                    r.statusTone,
                  )}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-red-500/[0.04] p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-300">
              <Siren className="size-3.5" /> Urgent · needs attention
            </div>
            <p className="mt-1.5 text-xs font-medium">
              Burst pipe under kitchen sink
            </p>
            <p className="text-[11px] text-muted-foreground">
              Riverside Apartments · Unit 4B · reported 9:42 AM
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              Open request <ArrowUpRight className="size-3" />
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-xs font-semibold">Property status</p>
            <ul className="mt-2 space-y-2">
              {[
                { name: "Riverside Apartments", open: 6 },
                { name: "Parkview Towers", open: 5 },
                { name: "Greenwood Residences", open: 4 },
                { name: "Oak Street Homes", open: 3 },
              ].map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="size-3" />
                    {p.name}
                  </span>
                  <span className="font-medium tabular-nums">{p.open} open</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-xs font-semibold">Recent activity</p>
            <ul className="mt-2 space-y-2">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="flex gap-2 text-[11px]">
                  <span className="tabular-nums text-muted-foreground">
                    {a.time}
                  </span>
                  <span className="text-muted-foreground">{a.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
