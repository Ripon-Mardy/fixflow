import type { Metadata } from "next";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/marketing/reveal";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the FixFlow team.",
};

const CHANNELS = [
  { icon: Mail, title: "Email", value: "hello@fixflow.demo", note: "Demo address — not monitored." },
  { icon: MessageSquare, title: "Sales", value: "Book a walkthrough", note: "See the manager dashboard with your own data shape." },
  { icon: MapPin, title: "Office", value: "Portland, OR", note: "Remote-first team across the US." },
];

export default function ContactPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Contact"
        title="Talk to us about your portfolio"
        description="Questions about the workflow, the data model, or running FixFlow for your buildings? Send a note."
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <Reveal className="space-y-4">
          {CHANNELS.map((c) => (
            <div key={c.title} className="flex gap-4 rounded-xl border bg-card p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {c.title}
                </p>
                <p className="text-sm font-semibold">{c.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.note}</p>
              </div>
            </div>
          ))}
        </Reveal>
        <Reveal delay={0.08}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
