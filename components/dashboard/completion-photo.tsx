"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addCompletionPhoto } from "@/lib/actions/requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OPTIONS = [
  "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1585128792020-803d29415281?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1596263576925-d90a4a9f590b?auto=format&fit=crop&w=1200&q=70",
];

export function CompletionPhoto({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<string | null>(null);

  async function pick(url: string) {
    setPending(url);
    const fd = new FormData();
    fd.set("requestId", requestId);
    fd.set("url", url);
    const res = await addCompletionPhoto(fd);
    setPending(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Completion photo added.");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => setOpen(true)}
      >
        <Camera className="size-4" /> Add completion photo
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a completion photo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Demo mode uses sample photos in place of a live camera upload.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {OPTIONS.map((url) => (
              <button
                key={url}
                onClick={() => pick(url)}
                disabled={!!pending}
                className="relative aspect-square overflow-hidden rounded-lg border transition-colors hover:border-primary disabled:opacity-60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Completion sample" className="size-full object-cover" />
                {pending === url && (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Loader2 className="size-4 animate-spin" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
