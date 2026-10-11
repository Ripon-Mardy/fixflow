"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard-preview";

export function Hero() {
  const reduce = useReducedMotion();
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.05 },
    },
  };
  const item = reduce
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
        },
      };

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Property maintenance, simplified
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Stop chasing maintenance requests.
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-4 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
          >
            FixFlow gives property managers one place to receive, assign, track,
            and resolve maintenance requests.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" asChild>
              <Link href="/register">
                Start managing repairs <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/how-it-works">
                <PlayCircle className="size-4" /> See how it works
              </Link>
            </Button>
          </motion.div>
          <motion.p
            variants={item}
            className="mt-3 text-xs text-muted-foreground"
          >
            No credit card. Demo environment with sample data and instant login.
          </motion.p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-12 max-w-5xl"
        >
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}
