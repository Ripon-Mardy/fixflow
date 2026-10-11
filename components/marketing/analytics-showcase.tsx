"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const RESOLUTION_TREND = [
  { month: "Apr", resolved: 28, opened: 33 },
  { month: "May", resolved: 34, opened: 31 },
  { month: "Jun", resolved: 39, opened: 40 },
  { month: "Jul", resolved: 44, opened: 38 },
  { month: "Aug", resolved: 41, opened: 36 },
  { month: "Sep", resolved: 42, opened: 29 },
];

const BY_CATEGORY = [
  { name: "Plumbing", value: 38 },
  { name: "Electrical", value: 21 },
  { name: "HVAC", value: 27 },
  { name: "Appliance", value: 18 },
  { name: "Structural", value: 11 },
  { name: "Other", value: 9 },
];

const PIE = [
  { name: "Resolved", value: 124 },
  { name: "In progress", value: 9 },
  { name: "Open", value: 18 },
];

const PIE_COLORS = ["var(--chart-3)", "var(--chart-1)", "var(--chart-4)"];

const KPIS = [
  { label: "Requests resolved", value: "124" },
  { label: "Open requests", value: "18" },
  { label: "Resolution rate", value: "91%" },
  { label: "Avg. resolution time", value: "2.4 days" },
];

export function AnalyticsShowcase() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="grid grid-cols-2 gap-4 lg:col-span-1 lg:grid-cols-1">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-5">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {k.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Requests over time</p>
          <span className="text-xs text-muted-foreground">Example data</span>
        </div>
        <div className="mt-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={RESOLUTION_TREND} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="g-resolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                cursor={{ stroke: "var(--border)" }}
              />
              <Area
                type="monotone"
                dataKey="opened"
                stroke="var(--chart-4)"
                strokeWidth={2}
                fill="transparent"
                name="Opened"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#g-resolved)"
                name="Resolved"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm font-medium">Requests by category</p>
        <div className="mt-4 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BY_CATEGORY} margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 lg:col-span-2">
        <p className="text-sm font-medium">Lifetime resolution split</p>
        <div className="mt-4 flex items-center gap-6">
          <div className="h-[200px] w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE}
                  dataKey="value"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="var(--card)"
                >
                  {PIE.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 text-sm">
            {PIE.map((p, i) => (
              <li key={p.name} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: PIE_COLORS[i] }}
                />
                <span className="text-muted-foreground">{p.name}</span>
                <span className="font-medium tabular-nums">{p.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
