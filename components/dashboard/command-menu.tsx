"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ClipboardList,
  Loader2,
  Search,
  User,
  Wrench,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { globalSearch, type SearchResult } from "@/lib/actions/search";
import { cn } from "@/lib/utils";

const ICONS = {
  request: ClipboardList,
  property: Building2,
  tenant: User,
  technician: Wrench,
} as const;

const GROUP_LABEL = {
  request: "Requests",
  property: "Properties",
  tenant: "Tenants",
  technician: "Technicians",
} as const;

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const r = await globalSearch(q);
        setResults(r);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(handle);
  }, [query]);

  const grouped = React.useMemo(() => {
    const map = new Map<SearchResult["type"], SearchResult[]>();
    for (const r of results) {
      map.set(r.type, [...(map.get(r.type) ?? []), r]);
    }
    return [...map.entries()];
  }, [results]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search requests, properties, people…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Searching…
          </div>
        )}

        {!loading && query.trim().length < 2 && (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            <Search className="mx-auto mb-2 size-5 opacity-50" />
            Type at least two characters to search.
          </div>
        )}

        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <CommandEmpty>No matches for “{query}”.</CommandEmpty>
        )}

        {grouped.map(([type, items]) => {
          const IconCmp = ICONS[type];
          return (
            <CommandGroup key={type} heading={GROUP_LABEL[type]}>
              {items.map((r) => (
                <CommandItem
                  key={r.id}
                  value={`${r.title} ${r.subtitle}`}
                  onSelect={() => go(r.href)}
                >
                  <IconCmp className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{r.title}</span>
                  <span
                    className={cn(
                      "truncate text-xs text-muted-foreground",
                    )}
                  >
                    {r.subtitle}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
