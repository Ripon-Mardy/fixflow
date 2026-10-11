import { Lock } from "lucide-react";
import type { Role } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatDateTime, initials } from "@/lib/utils";

type Comment = {
  id: string;
  body: string;
  internal: boolean;
  system: boolean;
  createdAt: Date;
  author: { id: string; name: string; role: Role; avatarUrl: string | null } | null;
};

export function RequestTimeline({
  comments,
  showInternal,
}: {
  comments: Comment[];
  showInternal: boolean;
}) {
  const visible = comments.filter((c) => showInternal || !c.internal);

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity yet.</p>
    );
  }

  return (
    <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
      {visible.map((c) => {
        const time = formatDateTime(c.createdAt);
        if (c.system) {
          return (
            <li key={c.id} className="relative flex gap-3">
              <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
                <span className="size-1.5 rounded-full bg-primary" />
              </span>
              <div className="pt-1.5">
                <p className="text-sm">{c.body}</p>
                <p className="text-xs text-muted-foreground">{time}</p>
              </div>
            </li>
          );
        }
        return (
          <li key={c.id} className="relative flex gap-3">
            <Avatar className="mt-0.5 size-8 shrink-0 border bg-background">
              {c.author?.avatarUrl && (
                <AvatarImage src={c.author.avatarUrl} alt={c.author.name} />
              )}
              <AvatarFallback>
                {initials(c.author?.name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "min-w-0 flex-1 rounded-lg border px-3 py-2",
                c.internal && "border-amber-500/40 bg-amber-500/5",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {c.author?.name ?? "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground">{time}</span>
                {c.internal && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                    <Lock className="size-2.5" /> Internal
                  </span>
                )}
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {c.body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
