import type { Metadata } from "next";
import { Database, Mail, ShieldCheck, Upload } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/constants";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireRole("ADMIN", { redirectTo: "/dashboard" });

  const [users, properties, units, requests, comments, notifications] =
    await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.unit.count(),
      prisma.maintenanceRequest.count(),
      prisma.requestComment.count(),
      prisma.notification.count(),
    ]);

  const INTEGRATIONS = [
    {
      icon: Mail,
      name: "Email & SMS delivery",
      status: "Demo — logs only",
      detail: "lib/services/notifications.ts · connect SendGrid / Twilio",
    },
    {
      icon: Upload,
      name: "File uploads",
      status: "Demo — sample images",
      detail: "lib/services/storage.ts · connect S3 / R2 / UploadThing",
    },
    {
      icon: ShieldCheck,
      name: "Authentication",
      status: "Demo session cookie",
      detail: "lib/auth/session.ts · swap for Auth.js / Clerk",
    },
    {
      icon: Database,
      name: "Database",
      status: "PostgreSQL via Prisma",
      detail: "prisma/schema.prisma",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Account configuration and the state of external integrations."
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Data snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 pt-5 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Users", users],
            ["Properties", properties],
            ["Units", units],
            ["Requests", requests],
            ["Comments", comments],
            ["Notifications", notifications],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-xl font-semibold tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {INTEGRATIONS.map((i) => (
              <li key={i.name} className="flex items-center gap-4 px-4 py-3.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <i.icon className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {i.detail}
                  </p>
                </div>
                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                  {i.status}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Demo accounts</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground">
            Every account below uses the password{" "}
            <code className="rounded bg-muted px-1 font-mono">{DEMO_PASSWORD}</code>.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((a) => (
              <li
                key={a.email}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <span className="font-medium">{a.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {a.email}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
