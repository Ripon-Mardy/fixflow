"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getAnalytics } from "@/lib/queries/analytics";

type Data = Awaited<ReturnType<typeof getAnalytics>>;

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
];
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "var(--chart-3)",
  MEDIUM: "var(--chart-2)",
  HIGH: "var(--chart-4)",
  EMERGENCY: "var(--chart-5)",
};

const axis = { tickLine: false, axisLine: false, tick: { fontSize: 11 } };

export function AnalyticsCharts({ data }: { data: Data }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Requests over time" span>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.overTime} margin={{ left: -16, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="a-opened" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="a-resolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" {...axis} />
            <YAxis {...axis} width={32} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="opened"
              name="Opened"
              stroke="var(--chart-4)"
              strokeWidth={2}
              fill="url(#a-opened)"
            />
            <Area
              type="monotone"
              dataKey="resolved"
              name="Resolved"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#a-resolved)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Requests by category">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.byCategory} margin={{ left: -16, right: 8 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" {...axis} interval={0} angle={-20} dy={10} height={44} />
            <YAxis {...axis} width={32} />
            <Tooltip cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="value" name="Requests" radius={[4, 4, 0, 0]}>
              {data.byCategory.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Requests by priority">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data.byPriority}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              stroke="var(--card)"
            >
              {data.byPriority.map((d, i) => (
                <Cell key={i} fill={PRIORITY_COLORS[d.name] ?? COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Technician performance">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data.technicians}
            layout="vertical"
            margin={{ left: 24, right: 12 }}
          >
            <CartesianGrid stroke="var(--border)" horizontal={false} />
            <XAxis type="number" {...axis} />
            <YAxis
              type="category"
              dataKey="name"
              {...axis}
              width={90}
              tick={{ fontSize: 10 }}
            />
            <Tooltip cursor={{ fill: "var(--muted)" }} />
            <Bar
              dataKey="completed"
              name="Completed jobs"
              fill="var(--chart-1)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Average resolution time (hrs by technician)">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.technicians} margin={{ left: -16, right: 8 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" {...axis} tick={{ fontSize: 10 }} interval={0} angle={-20} dy={10} height={44} />
            <YAxis {...axis} width={32} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="avgHours"
              name="Avg hours"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Requests by property">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.properties} margin={{ left: -16, right: 8 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" {...axis} tick={{ fontSize: 10 }} interval={0} angle={-20} dy={10} height={54} />
            <YAxis {...axis} width={32} />
            <Tooltip cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="requests" name="Requests" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  span,
  children,
}: {
  title: string;
  span?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={span ? "lg:col-span-2" : undefined}>
      <CardHeader className="border-b">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
