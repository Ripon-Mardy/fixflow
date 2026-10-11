import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/marketing/reveal";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Three simple plans — Starter at $29, Professional at $79 and Business at $149 per month. Demo pricing only.",
};

const FAQ = [
  {
    q: "Is this real billing?",
    a: "No. FixFlow is a portfolio demo. The plans and prices are illustrative and no payment processor is connected.",
  },
  {
    q: "How do the demo accounts work?",
    a: "The login page lists four accounts — admin, manager, technician and tenant — that all use the password Demo123!. Pick any to explore that role.",
  },
  {
    q: "Can I connect my own database?",
    a: "Yes. The project uses Prisma with PostgreSQL. Point DATABASE_URL at your instance, run the migrations and seed, and you're set.",
  },
  {
    q: "What would a real rollout add?",
    a: "Production auth, email/SMS delivery, file uploads and payments are stubbed behind clean service interfaces, ready to be wired to real providers.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Section className="pb-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Plans that scale with your portfolio"
          description="Start with one building, grow to a whole management company."
        />
      </Section>

      <Section className="pt-0">
        <PricingPlans />
        <Reveal className="mx-auto mt-10 max-w-2xl">
          <Alert variant="info">
            <Info />
            <AlertTitle>Demo pricing</AlertTitle>
            <AlertDescription>
              These figures exist to make the product feel complete. Nothing on
              this page charges a card or creates a subscription.
            </AlertDescription>
          </Alert>
        </Reveal>
      </Section>

      <Section className="border-t bg-muted/20">
        <SectionHeading eyebrow="FAQ" title="Common questions" />
        <div className="mx-auto mt-10 max-w-2xl divide-y rounded-xl border bg-card">
          {FAQ.map((item) => (
            <div key={item.q} className="p-5">
              <h3 className="text-sm font-semibold">{item.q}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
