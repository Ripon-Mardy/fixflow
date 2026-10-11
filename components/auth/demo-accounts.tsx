"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { Shield, UserCog, Wrench, Home, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DEMO_PASSWORD } from "@/lib/constants";
import { demoLoginAction } from "@/lib/auth/actions";

const ACCOUNTS: {
  role: Role;
  label: string;
  email: string;
  icon: React.ElementType;
  desc: string;
}[] = [
  { role: "ADMIN", label: "Admin", email: "admin@fixflow.demo", icon: Shield, desc: "Full account & user management" },
  { role: "MANAGER", label: "Manager", email: "manager@fixflow.demo", icon: UserCog, desc: "The main product experience" },
  { role: "TECHNICIAN", label: "Technician", email: "technician@fixflow.demo", icon: Wrench, desc: "Focused field-work view" },
  { role: "TENANT", label: "Tenant", email: "tenant@fixflow.demo", icon: Home, desc: "Report & track a request" },
];

export function DemoAccounts() {
  const router = useRouter();
  const [pending, setPending] = React.useState<Role | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function signInAs(role: Role) {
    setPending(role);
    try {
      await demoLoginAction(role);
    } catch (err) {
      // redirect() throws NEXT_REDIRECT on success — let it bubble.
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        router.refresh();
        return;
      }
      setPending(null);
      toast.error("Could not sign in", {
        description:
          err instanceof Error ? err.message : "Try again in a moment.",
      });
    }
  }

  function copyPassword() {
    navigator.clipboard.writeText(DEMO_PASSWORD).then(() => {
      setCopied(true);
      toast.success("Demo password copied");
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Demo accounts</p>
        <button
          type="button"
          onClick={copyPassword}
          className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-accent"
        >
          {copied ? (
            <Check className="size-3 text-primary" />
          ) : (
            <Copy className="size-3" />
          )}
          <span className="font-mono">{DEMO_PASSWORD}</span>
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        One-click sign in. Every account uses the password above.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {ACCOUNTS.map((a) => (
          <button
            key={a.role}
            type="button"
            disabled={!!pending}
            onClick={() => signInAs(a.role)}
            className={cn(
              "group flex items-start gap-2.5 rounded-lg border bg-background p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-60",
              pending === a.role && "border-primary/50",
            )}
          >
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <a.icon className="size-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold">
                {pending === a.role ? "Signing in…" : a.label}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {a.email}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
