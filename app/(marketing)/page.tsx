import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Building2,
  CalendarClock,
  Filter,
  Flag,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  MailX,
  MessageCircleQuestion,
  PackageSearch,
  Search,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/marketing/hero";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/marketing/reveal";
import { WorkflowSteps } from "@/components/marketing/workflow-steps";
import { AnalyticsShowcase } from "@/components/marketing/analytics-showcase";
import { Testimonials } from "@/components/marketing/testimonials";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";

const PROBLEMS = [
  {
    icon: MailX,
    title: "Requests get lost",
    body: "A leak reported over WhatsApp at 9pm is buried by morning. Spreadsheets go stale. Nobody is sure what is still open.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Tenants keep asking for updates",
    body: "Without visibility, tenants call and email repeatedly. Your team spends the day giving status updates instead of fixing things.",
  },
  {
    icon: PackageSearch,
    title: "Managers don't know what's happening",
    body: "No single view of what's urgent, who's assigned, or which properties are falling behind. Reporting means rebuilding it by hand.",
  },
];

const FEATURES = [
  { icon: Inbox, title: "Maintenance request management", body: "One queue for every request, with full context attached." },
  { icon: Building2, title: "Property management", body: "Track buildings, units, occupancy and open work in one place." },
  { icon: Users, title: "Tenant management", body: "Tenant profiles, unit history and contact details at hand." },
  { icon: Wrench, title: "Technician assignment", body: "Match jobs to the right person by skill and availability." },
  { icon: Flag, title: "Priority tracking", body: "From low to emergency — the urgent work stays visible." },
  { icon: Activity, title: "Status tracking", body: "Seven clear stages from submitted to closed." },
  { icon: ImageIcon, title: "Image attachments", body: "Photos from tenants and completion shots from technicians." },
  { icon: CalendarClock, title: "Activity timeline", body: "Every action on a request, timestamped and preserved." },
  { icon: Bell, title: "Notifications", body: "The right people told the moment something changes." },
  { icon: LayoutDashboard, title: "Analytics", body: "Resolution rate, time-to-fix and category trends." },
  { icon: Search, title: "Search & filtering", body: "Find any request, property or person in seconds." },
  { icon: Filter, title: "Role-based dashboards", body: "Managers, technicians and tenants each see what matters." },
];

export default function LandingPage() {
  return (
    <>
      <Hero />

      {/* 1 — Problem */}
      <Section className="border-t bg-muted/20">
        <SectionHeading
          eyebrow="The problem"
          title="Maintenance shouldn't live in your inbox."
          description="Requests arrive by phone, text, email and hallway conversation. Here's what that costs a property team every week."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="h-full rounded-xl border bg-card p-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                  <p.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 2 — Solution / workflow */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              align="left"
              eyebrow="The solution"
              title="One clear workflow, start to finish."
              description="FixFlow turns a messy stream of messages into a predictable process everyone can follow."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/how-it-works">
                  Walk through it <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">Try the demo</Link>
              </Button>
            </div>
          </div>
          <WorkflowSteps />
        </div>
      </Section>

      {/* 3 — Features */}
      <Section className="border-t bg-muted/20">
        <SectionHeading
          eyebrow="Features"
          title="Everything a property team needs to stay ahead"
          description="Focused tools for the people doing the work — nothing you'll never touch."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.05}>
              <div className="group h-full rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 4 — Dashboard preview */}
      <Section>
        <SectionHeading
          eyebrow="The manager dashboard"
          title="Your whole operation on one screen"
          description="Stats, the live request queue, urgent work, property status and recent activity — the view your team opens every morning."
        />
        <Reveal className="mt-12">
          <DashboardPreview />
        </Reveal>
      </Section>

      {/* 5 — Analytics */}
      <Section className="border-t bg-muted/20">
        <SectionHeading
          eyebrow="Analytics"
          title="Know how your properties are really performing"
          description="Example figures from a demo account — 124 requests resolved, 18 open, a 91% resolution rate and 2.4 days average time to fix."
        />
        <Reveal className="mt-12">
          <AnalyticsShowcase />
        </Reveal>
      </Section>

      {/* 6 — Testimonials */}
      <Section>
        <SectionHeading
          eyebrow="Demo testimonials"
          title="What a team using FixFlow would say"
          description="Illustrative quotes with fictional names — shown here as sample content for this demo."
        />
        <Reveal className="mt-12">
          <Testimonials />
        </Reveal>
      </Section>

      {/* 7 — Pricing */}
      <Section id="pricing" className="border-t bg-muted/20">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans that scale with your portfolio"
          description="Three demo plans — no real payment processing is connected."
        />
        <div className="mt-12">
          <PricingPlans />
        </div>
      </Section>

      {/* 8 — CTA */}
      <Section>
        <Reveal className="overflow-hidden rounded-2xl border bg-card">
          <div className="relative isolate px-6 py-14 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-fade" />
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Bring maintenance under control.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-balance text-muted-foreground">
              Log in to the demo environment and see the full workflow with
              realistic sample data.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get started <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Log in with a demo account</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
