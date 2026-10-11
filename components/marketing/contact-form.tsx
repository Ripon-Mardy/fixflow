"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/forms/field";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional(),
  message: z.string().min(10, "Tell us a little more"),
});
type Values = z.infer<typeof schema>;

export function ContactForm() {
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    // Demo: no external mail provider is connected. Simulate a network call.
    await new Promise((r) => setTimeout(r, 700));
    console.info("[contact] demo submission", values);
    setDone(true);
    toast.success("Message sent", {
      description: "This is a demo — nothing was emailed.",
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h3 className="mt-3 text-lg font-semibold">Thanks — we&apos;ve got it.</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          In the real product this would reach the FixFlow team. For the demo,
          your message stays in your browser.
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => setDone(false)}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border bg-card p-6"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-name">Name</Label>
          <Input id="c-name" {...register("name")} aria-invalid={!!errors.name} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-email">Work email</Label>
          <Input
            id="c-email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-company">Company (optional)</Label>
        <Input id="c-company" {...register("company")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-message">How can we help?</Label>
        <Textarea
          id="c-message"
          rows={5}
          {...register("message")}
          aria-invalid={!!errors.message}
        />
        <FieldError>{errors.message?.message}</FieldError>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Send message
      </Button>
    </form>
  );
}
