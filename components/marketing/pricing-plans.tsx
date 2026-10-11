import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export const PLANS = [
  {
    name: "Starter",
    price: 29,
    tagline: "For a single landlord or a first building.",
    features: [
      "Up to 2 properties",
      "Unlimited maintenance requests",
      "1 manager seat",
      "Tenant portal & email updates",
      "Core analytics",
    ],
    cta: "Start with Starter",
    featured: false,
  },
  {
    name: "Professional",
    price: 79,
    tagline: "For a growing property management team.",
    features: [
      "Up to 15 properties",
      "5 manager seats",
      "Technician assignment & scheduling",
      "Priority & SLA tracking",
      "Full analytics dashboard",
      "Activity audit log",
    ],
    cta: "Choose Professional",
    featured: true,
  },
  {
    name: "Business",
    price: 149,
    tagline: "For established firms managing at scale.",
    features: [
      "Unlimited properties",
      "Unlimited manager seats",
      "Role-based dashboards & admin panel",
      "Custom categories & workflows",
      "Advanced reporting & exports",
      "Priority support",
    ],
    cta: "Choose Business",
    featured: false,
  },
];

export function PricingPlans() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {PLANS.map((plan, i) => (
        <Reveal key={plan.name} delay={i * 0.06}>
          <div
            className={cn(
              "flex h-full flex-col rounded-2xl border bg-card p-6",
              plan.featured && "border-primary/40 shadow-lg ring-1 ring-primary/20",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              {plan.featured && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Most popular
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight">
                ${plan.price}
              </span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Demo pricing — no real billing.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex-1" />
            <Button
              asChild
              className="mt-4 w-full"
              variant={plan.featured ? "default" : "outline"}
            >
              <Link href="/register">{plan.cta}</Link>
            </Button>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
