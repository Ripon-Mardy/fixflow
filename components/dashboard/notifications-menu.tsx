"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, Loader2 } from "lucide-react";
import type { Notification } from "@prisma/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";
import {
  fetchNotifications,
  markAllRead,
  markRead,
} from "@/lib/actions/notifications";

type Item = Notification & { request: { id: string; reference: string } | null };

export function NotificationsMenu({ initialUnread }: { initialUnread: number }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Item[]>([]);
  const [unread, setUnread] = React.useState(initialUnread);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchNotifications(8)
      .then((r) => {
        setItems(r.items as Item[]);
        setUnread(r.unread);
      })
      .finally(() => setLoading(false));
  }, [open]);

  async function handleMarkAll() {
    setUnread(0);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    await markAllRead();
    router.refresh();
  }

  async function handleOpenItem(item: Item) {
    if (!item.read) {
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)),
      );
      await markRead(item.id);
    }
    setOpen(false);
    if (item.request) router.push(`/dashboard/requests/${item.request.id}`);
    else router.push("/dashboard/notifications");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
          className="relative"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Check className="size-3" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[24rem] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 size-5 opacity-50" />
              You&apos;re all caught up.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleOpenItem(item)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
                      !item.read && "bg-primary/[0.04]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        item.read ? "bg-transparent" : "bg-primary",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.body}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {timeAgo(item.createdAt)}
                        {item.request ? ` · ${item.request.reference}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
