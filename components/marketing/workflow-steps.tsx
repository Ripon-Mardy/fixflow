"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ClipboardCheck,
  MessageSquarePlus,
  UserCheck,
  Wrench,
  CheckCircle2,
} from "lucide-react";

const STEPS = [
  {
    icon: MessageSquarePlus,
    title: "Tenant reports the issue",
    body: "A guided form captures the category, priority, photos and best access time — no more vague WhatsApp messages.",
  },
  {
    icon: ClipboardCheck,
    title: "Manager reviews the request",
    body: "Every request lands in one queue with full context, so triage takes seconds, not a phone call.",
  },
  {
    icon: UserCheck,
    title: "Technician gets assigned",
    body: "Match the right technician by specialization and availability. They get notified with everything they need.",
  },
  {
    icon: Wrench,
    title: "Technician updates progress",
    body: "Status changes, notes and completion photos flow back in real time — from the driveway, on a phone.",
  },
  {
    icon: CheckCircle2,
    title: "Issue gets resolved",
    body: "The tenant is notified automatically, the timeline is preserved, and the metrics update themselves.",
  },
];

export function WorkflowSteps() {
  const reduce = useReducedMotion();
  return (
    <ol className="relative space-y-3">
      {STEPS.map((step, i) => (
        <motion.li
          key={step.title}
          initial={reduce ? false : { opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: i * 0.08 }}
          className="flex gap-4 rounded-xl border bg-card p-4 sm:p-5"
        >
          <div className="flex flex-col items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <step.icon className="size-5" />
            </span>
            {i < STEPS.length - 1 && (
              <span className="mt-1 w-px flex-1 bg-border" />
            )}
          </div>
          <div className="pb-1 pt-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Step {i + 1}
              </span>
            </div>
            <h3 className="mt-0.5 font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
