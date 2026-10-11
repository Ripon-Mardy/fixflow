"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Copy, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PRIORITY_META, PRIORITY_ORDER } from "@/lib/constants";
import { SAMPLE_ISSUE_PHOTOS } from "@/lib/services/storage";
import { createRequest, type ActionResult } from "@/lib/actions/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/forms/field";

type Category = { id: string; name: string };
type Property = { id: string; name: string; units: { id: string; label: string }[] };

export function CreateRequestForm({
  categories,
  properties,
  fixedProperty,
  fixedUnit,
  isTenant,
}: {
  categories: Category[];
  properties: Property[];
  fixedProperty: string | null;
  fixedUnit: string | null;
  isTenant: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [result, setResult] = React.useState<{ id: string; reference: string } | null>(
    null,
  );

  const [categoryId, setCategoryId] = React.useState("");
  const [priority, setPriority] = React.useState("MEDIUM");
  const [propertyId, setPropertyId] = React.useState(
    fixedProperty ?? properties[0]?.id ?? "",
  );
  const [unitId, setUnitId] = React.useState(fixedUnit ?? "");
  const [photos, setPhotos] = React.useState<string[]>([]);

  const units = properties.find((p) => p.id === propertyId)?.units ?? [];

  function togglePhoto(url: string) {
    setPhotos((prev) =>
      prev.includes(url) ? prev.filter((p) => p !== url) : [...prev, url],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const form = new FormData(e.currentTarget);
    form.set("categoryId", categoryId);
    form.set("priority", priority);
    form.set("propertyId", propertyId);
    form.set("unitId", unitId);
    form.delete("attachments");
    photos.forEach((p) => form.append("attachments", p));

    const res: ActionResult<{ id: string; reference: string }> = await createRequest(
      null,
      form,
    );
    setPending(false);

    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
      return;
    }
    setResult(res.data ?? null);
    toast.success("Your maintenance request has been submitted.");
  }

  if (result) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-11 text-primary" />
        <h2 className="mt-4 text-lg font-semibold">
          Your maintenance request has been submitted.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ve logged your request and notified the property manager.
        </p>
        <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-lg border bg-muted/40 px-4 py-2">
          <span className="text-xs text-muted-foreground">Request ID</span>
          <span className="font-mono text-sm font-semibold">{result.reference}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(result.reference);
              toast.success("Copied");
            }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Copy request ID"
          >
            <Copy className="size-3.5" />
          </button>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href={`/dashboard/requests/${result.id}`}>View request</Link>
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/requests")}>
            Back to requests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Kitchen sink draining slowly"
            aria-invalid={!!errors.title}
          />
          <FieldError>{errors.title}</FieldError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Describe what's happening, when it started, and anything you've already tried."
            aria-invalid={!!errors.description}
          />
          <FieldError>{errors.description}</FieldError>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger aria-invalid={!!errors.categoryId}>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors.categoryId}</FieldError>
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_ORDER.slice()
                  .reverse()
                  .map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose <strong>Emergency</strong> only for safety risks or active
              damage (flooding, no heat, exposed wiring).
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Property</Label>
            <Select
              value={propertyId}
              onValueChange={(v) => {
                setPropertyId(v);
                setUnitId("");
              }}
              disabled={isTenant}
            >
              <SelectTrigger aria-invalid={!!errors.propertyId}>
                <SelectValue placeholder="Choose a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors.propertyId}</FieldError>
          </div>

          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={unitId} onValueChange={setUnitId} disabled={isTenant}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferredAccess">Preferred access time</Label>
          <Input
            id="preferredAccess"
            name="preferredAccess"
            placeholder="e.g. Weekday mornings before 11am"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ImagePlus className="size-4" /> Photo attachments
          </Label>
          <p className="text-xs text-muted-foreground">
            Demo mode uses a small set of sample photos instead of live uploads.
            Pick any that resemble the issue.
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SAMPLE_ISSUE_PHOTOS.map((p) => {
              const selected = photos.includes(p.url);
              return (
                <button
                  type="button"
                  key={p.url}
                  onClick={() => togglePhoto(p.url)}
                  aria-pressed={selected}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                    selected ? "border-primary" : "border-transparent hover:border-border",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.label}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                  {selected && (
                    <span className="absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground">
                      <CheckCircle2 className="size-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Submit request
        </Button>
      </div>
    </form>
  );
}
