import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Bell,
  Building2,
  CalendarClock,
  Filter,
  Flag,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Search,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/marketing/reveal";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Maintenance request management, property and tenant tracking, technician assignment, analytics and role-based dashboards.",
};

const GROUPS = [
  {
    title: "Capture & triage",
    items: [
      { icon: Inbox, title: "Maintenance request management", body: "A guided intake form collects category, priority, unit, access time and photos. Everything lands in one prioritised queue." },
      { icon: Flag, title: "Priority tracking", body: "Low, medium, high and emergency — with emergencies surfaced across every dashboard and notification channel." },
      { icon: Activity, title: "Status tracking", body: "Seven stages: submitted, under review, assigned, in progress, waiting for parts, resolved and closed." },
      { icon: Search, title: "Search & filtering", body: "Filter the queue by status, priority, property or technician, and jump to anything with ⌘K global search." },
    ],
  },
  {
    title: "Assign & resolve",
    items: [
      { icon: Wrench, title: "Technician assignment", body: "Assign by specialization and availability. Technicians get a focused view of just their jobs." },
      { icon: CalendarClock, title: "Activity timeline", body: "Every status change, comment and assignment is timestamped and preserved on the request." },
      { icon: ImageIcon, title: "Image attachments", body: "Tenants attach photos of the issue; technicians attach completion photos when the job is done." },
      { icon: Bell, title: "Notifications", body: "Managers, technicians and tenants are each notified of the changes that concern them." },
    ],
  },
  {
    title: "Manage & measure",
    items: [
      { icon: Building2, title: "Property management", body: "Buildings, units, occupancy and open work per property, with performance stats." },
      { icon: Users, title: "Tenant management", body: "Tenant profiles with unit, active requests, full history and contact details." },
      { icon: LayoutDashboard, title: "Analytics", body: "Resolution rate, average time-to-fix, requests by category and technician performance." },
      { icon: Filter, title: "Role-based dashboards", body: "Admin, manager, technician and tenant each get an interface built around their job." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Section className="pb-8">
        <SectionHeading
          eyebrow="Features"
          title="Built around how property maintenance actually works"
          description="Every feature maps to a step in the journey from a tenant's report to a resolved repair."
        />
      </Section>

      {GROUPS.map((group, gi) => (
        <Section
          key={group.title}
          className={gi % 2 === 0 ? "border-t bg-muted/20 py-14" : "py-14"}
        >
          <Reveal>
            <h2 className="text-xl font-semibold tracking-tight">{group.title}</h2>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {group.items.map((item, i) => (
              <Reveal key={item.title} delay={(i % 2) * 0.05}>
                <div className="flex h-full gap-4 rounded-xl border bg-card p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      ))}

      <Section className="border-t">
        <SectionHeading
          eyebrow="See it in context"
          title="The manager dashboard"
          description="This is the screen your team lives in — recreated here with sample data."
        />
        <Reveal className="mt-10">
          <DashboardPreview />
        </Reveal>
        <div className="mt-8 flex justify-center">
          <Button size="lg" asChild>
            <Link href="/register">Open the demo</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
