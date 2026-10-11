"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/forms/field";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    // Demo: no mail provider connected. Always confirm to avoid account probing.
    await new Promise((r) => setTimeout(r, 600));
    setSent(values.email);
  }

  if (sent) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <MailCheck className="mx-auto size-9 text-primary" />
        <h2 className="mt-3 text-base font-semibold">Check your inbox</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{sent}</span> matches
          an account, a reset link is on its way.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Demo note: email delivery isn&apos;t wired up. Use a demo account on the
          login page instead.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="fp-email">Email</Label>
        <Input
          id="fp-email"
          type="email"
          autoComplete="email"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        <FieldError>{errors.email?.message}</FieldError>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Send reset link
      </Button>
    </form>
  );
}
