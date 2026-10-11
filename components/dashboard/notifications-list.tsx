"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Flag,
  Inbox,
  MessageSquare,
  Siren,
  UserCheck,
} from "lucide-react";
import type { Notification, NotificationType } from "@prisma/client";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { markAllRead, markRead } from "@/lib/actions/notifications";

const ICONS: Record<NotificationType, React.ElementType> = {
  REQUEST_CREATED: Inbox,
  REQUEST_ASSIGNED: UserCheck,
  STATUS_CHANGED: Activity,
  PRIORITY_CHANGED: Flag,
  COMMENT_ADDED: MessageSquare,
  REQUEST_RESOLVED: CheckCircle2,
  UPDATE_REQUESTED: BellRing,
  EMERGENCY: Siren,
};

type Item = Notification & { request: { id: string; reference: string } | null };

export function NotificationsList({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const shown = items.filter((i) => (filter === "unread" ? !i.read : true));
  const unreadCount = items.filter((i) => !i.read).length;

  async function open(item: Item) {
    if (!item.read) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)),
      );
      await markRead(item.id);
    }
    if (item.request) router.push(`/dashboard/requests/${item.request.id}`);
  }

  async function allRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    await markAllRead();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border p-0.5">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors",
                filter === f
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
              {f === "unread" && unreadCount > 0 && ` (${unreadCount})`}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={allRead}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        )}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "No unread notifications." : "No notifications yet."}
          description="Updates about your requests and team activity will show up here."
        />
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {shown.map((item) => {
            const IconCmp = ICONS[item.type] ?? Bell;
            return (
              <li key={item.id}>
                <button
                  onClick={() => open(item)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/50",
                    !item.read && "bg-primary/[0.03]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                      item.type === "EMERGENCY"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <IconCmp className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.title}</span>
                      {!item.read && (
                        <span className="size-1.5 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {item.body}
                    </span>
                    <span
                      className="mt-1 block text-xs text-muted-foreground"
                      title={formatDateTime(item.createdAt)}
                    >
                      {timeAgo(item.createdAt)}
                      {item.request ? ` · ${item.request.reference}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
