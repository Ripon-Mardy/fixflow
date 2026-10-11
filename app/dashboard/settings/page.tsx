import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { RoleBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { DEMO_PASSWORD } from "@/lib/constants";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and preferences."
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            Profile
            <RoleBadge role={user.role} />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <ProfileForm
            defaultName={user.name}
            defaultPhone={user.phone ?? ""}
            email={user.email}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <Alert variant="info">
            <Info />
            <AlertTitle>Demo authentication</AlertTitle>
            <AlertDescription>
              This environment uses a simplified auth layer. Every seeded account
              shares the password{" "}
              <code className="rounded bg-background px-1 font-mono">
                {DEMO_PASSWORD}
              </code>
              . Password changes and 2FA are stubbed for the demo and would be
              wired to a real provider (Auth.js, Clerk) in production.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="pt-5 text-sm text-muted-foreground">
          <p>
            In-app notifications are always on. Email and SMS delivery are
            available behind{" "}
            <code className="rounded bg-muted px-1 font-mono">
              lib/services/notifications.ts
            </code>{" "}
            and can be connected to SendGrid / Twilio without changing the rest
            of the app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
