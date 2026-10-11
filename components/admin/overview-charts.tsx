"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getAdminOverview } from "@/lib/queries/admin";

type Data = Awaited<ReturnType<typeof getAdminOverview>>;
const axis = { tickLine: false, axisLine: false, tick: { fontSize: 11 } };
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
  "var(--chart-2)",
];

export function OverviewCharts({ data }: { data: Data }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-sm">User growth</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.userGrowth} margin={{ left: -16, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" {...axis} />
              <YAxis {...axis} width={32} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="users"
                name="Total users"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#ug)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-sm">Requests over time</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.requestsOverTime} margin={{ left: -16, right: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" {...axis} />
              <YAxis {...axis} width={32} />
              <Tooltip cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="requests" name="Requests" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-sm">Requests by status</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data.byStatus}
              layout="vertical"
              margin={{ left: 40, right: 12 }}
            >
              <CartesianGrid stroke="var(--border)" horizontal={false} />
              <XAxis type="number" {...axis} />
              <YAxis type="category" dataKey="name" {...axis} width={100} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="value" name="Requests" radius={[0, 4, 4, 0]}>
                {data.byStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-sm">Requests by category</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.byCategory} margin={{ left: -16, right: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" {...axis} interval={0} angle={-20} dy={10} height={44} tick={{ fontSize: 10 }} />
              <YAxis {...axis} width={32} />
              <Tooltip cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="value" name="Requests" radius={[4, 4, 0, 0]}>
                {data.byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
