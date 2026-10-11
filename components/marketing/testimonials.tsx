import { Quote } from "lucide-react";
import { Reveal } from "./reveal";

const ITEMS = [
  {
    quote:
      "FixFlow gives our team a clear picture of every maintenance issue from the moment it is reported.",
    name: "Sarah Mitchell",
    role: "Property Manager",
  },
  {
    quote:
      "Tenants stopped calling to ask for updates because they can finally see the status themselves.",
    name: "David Whitfield",
    role: "Operations Lead, 9 buildings",
  },
  {
    quote:
      "Assigning the right technician used to be three phone calls. Now it is one click and they have every detail.",
    name: "Alex Morgan",
    role: "Senior Property Manager",
  },
];

export function Testimonials() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {ITEMS.map((t, i) => (
        <Reveal key={t.name} delay={i * 0.06}>
          <figure className="flex h-full flex-col rounded-xl border bg-card p-6">
            <Quote className="size-6 text-primary/40" />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 border-t pt-4">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
