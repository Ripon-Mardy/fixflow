import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * FixFlow wordmark — a small "flow" glyph (a wrench whose handle bends into
 * an arrow) next to the product name set in the display font.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-[18px]"
        strokeWidth={2}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 5.5a3.5 3.5 0 0 0-4.9 4.4L4 15.5V20h4.5l5.6-5.6a3.5 3.5 0 0 0 4.4-4.9l-2.5 2.5-2-2 2.5-2.5Z" />
        <path d="M14 14c2.5 1 4 2.5 5 5" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  href = "/",
  withText = true,
}: {
  className?: string;
  href?: string | null;
  withText?: boolean;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {withText && (
        <span className="text-lg font-semibold tracking-tight">
          Fix<span className="text-primary">Flow</span>
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="FixFlow home">
      {content}
    </Link>
  );
}
