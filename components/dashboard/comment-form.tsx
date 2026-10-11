"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addComment } from "@/lib/actions/requests";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({
  requestId,
  canInternal,
}: {
  requestId: string;
  canInternal: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = React.useState("");
  const [internal, setInternal] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPending(true);
    const fd = new FormData();
    fd.set("requestId", requestId);
    fd.set("body", body.trim());
    fd.set("internal", internal ? "true" : "false");
    const res = await addComment(fd);
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setBody("");
    setInternal(false);
    toast.success(internal ? "Internal note added." : "Comment added.");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder={
          internal ? "Write an internal note (team only)…" : "Write a comment…"
        }
        className={cn(internal && "border-amber-500/40 bg-amber-500/5")}
      />
      <div className="flex items-center justify-between">
        {canInternal ? (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={internal}
              onChange={(e) => setInternal(e.target.checked)}
              className="size-3.5 rounded border-input"
            />
            <Lock className="size-3" />
            Internal note (not visible to tenant)
          </label>
        ) : (
          <span />
        )}
        <Button type="submit" size="sm" disabled={pending || !body.trim()}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {internal ? "Add note" : "Comment"}
        </Button>
      </div>
    </form>
  );
}
