import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/marketing/reveal";
import { WorkflowSteps } from "@/components/marketing/workflow-steps";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "From a tenant's report to a resolved repair: how FixFlow moves a maintenance request through review, assignment, progress and resolution.",
};

const ROLES = [
  {
    role: "Tenant",
    color: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    points: [
      "Submits a request with category, priority, photos and access time",
      "Follows the status and timeline without calling anyone",
      "Comments back and forth with the assigned technician",
      "Gets notified automatically when the issue is resolved",
    ],
  },
  {
    role: "Manager",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    points: [
      "Reviews every incoming request from one prioritised queue",
      "Assigns the right technician and sets priority",
      "Tracks progress across every property on the dashboard",
      "Watches resolution rate and time-to-fix trend over time",
    ],
  },
  {
    role: "Technician",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    points: [
      "Opens a focused list of only their assigned jobs",
      "Sees property, tenant and issue photos before arriving",
      "Updates status and notes from the field",
      "Uploads a completion photo and marks the job resolved",
    ],
  },
  {
    role: "Admin",
    color: "bg-red-500/10 text-red-700 dark:text-red-300",
    points: [
      "Manages users, properties, categories and roles",
      "Sees every request across the whole account",
      "Reviews an audit-style activity log of all changes",
      "Configures the workflow the other roles operate inside",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Section className="pb-8">
        <SectionHeading
          eyebrow="How it works"
          title="Tenant reports it. FixFlow carries it to done."
          description="One predictable path replaces the pile of texts, calls and spreadsheet rows."
        />
      </Section>

      <Section className="pt-0">
        <div className="mx-auto max-w-2xl">
          <WorkflowSteps />
        </div>
      </Section>

      <Section className="border-t bg-muted/20">
        <SectionHeading
          eyebrow="Who does what"
          title="Each role gets its own experience"
          description="The same request looks different depending on who's looking at it — and that's the point."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {ROLES.map((r, i) => (
            <Reveal key={r.role} delay={(i % 2) * 0.06}>
              <div className="h-full rounded-xl border bg-card p-6">
                <span
                  className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${r.color}`}
                >
                  {r.role}
                </span>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="border-t">
        <Reveal className="rounded-2xl border bg-card px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Try it with a real dataset
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            The demo is seeded with six properties, dozens of tenants and over
            sixty requests in every stage.
          </p>
          <Button className="mt-5" size="lg" asChild>
            <Link href="/login">
              Log in to the demo <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
