"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/logo";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { UserMenu } from "@/components/dashboard/user-menu";
import { ADMIN_NAV } from "@/lib/nav";

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; avatarUrl?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {ADMIN_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive(item.href, item.exact)
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          )}
        >
          <Icon name={item.icon as never} className="size-4 shrink-0" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <LogoMark />
          <div className="leading-tight">
            <p className="text-sm font-semibold">
              Fix<span className="text-primary">Flow</span>
            </p>
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <ShieldCheck className="size-3" /> Admin
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="border-t p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3.5" /> Back to app
          </Link>
        </div>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="flex h-16 items-center gap-2 border-b px-5">
            <LogoMark />
            <span className="text-sm font-semibold">FixFlow Admin</span>
          </SheetTitle>
          {nav}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <p className="text-sm font-medium text-muted-foreground">
            Admin console
          </p>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <div className="mx-1 h-6 w-px bg-border" />
            <UserMenu
              name={user.name}
              email={user.email}
              role="ADMIN"
              avatarUrl={user.avatarUrl}
            />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
