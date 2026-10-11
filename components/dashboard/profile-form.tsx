"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, type ProfileResult } from "@/lib/actions/profile";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Save changes
    </Button>
  );
}

export function ProfileForm({
  defaultName,
  defaultPhone,
  email,
}: {
  defaultName: string;
  defaultPhone: string;
  email: string;
}) {
  const [state, action] = useActionState<ProfileResult, FormData>(updateProfile, {
    ok: false,
  });

  useEffect(() => {
    if (state.ok) toast.success("Profile updated successfully.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" defaultValue={defaultName} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={defaultPhone} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
        <p className="text-xs text-muted-foreground">
          Email changes are disabled in the demo.
        </p>
      </div>
      <SaveButton />
    </form>
  );
}
