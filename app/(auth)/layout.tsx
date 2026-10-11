import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const POINTS = [
  "One queue for every maintenance request",
  "Assign technicians by skill and availability",
  "Tenants track status without calling",
  "Resolution metrics that update themselves",
];

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        <Link
          href="/"
          className="relative inline-flex items-center gap-2 text-sm font-medium opacity-90 transition-opacity hover:opacity-100"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white/15">
            <span className="text-base font-semibold">F</span>
          </span>
          FixFlow
        </Link>

        <div className="relative max-w-sm">
          <h2 className="text-2xl font-semibold leading-snug">
            Maintenance, without the mess.
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            One place to manage property maintenance requests, technicians,
            tenants, and repairs.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary-foreground/90" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          Demo environment · sample data throughout
        </p>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Back to site
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
