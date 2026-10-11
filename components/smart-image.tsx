"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * next/image wrapper that degrades gracefully when a remote image fails
 * (offline demo, rate-limited CDN, dead URL) instead of showing a broken
 * image icon.
 */
export function SmartImage({
  className,
  fallbackClassName,
  alt,
  ...props
}: ImageProps & { fallbackClassName?: string }) {
  const [failed, setFailed] = React.useState(false);

  if (failed || !props.src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          fallbackClassName ?? className,
        )}
        aria-label={typeof alt === "string" ? alt : "Image unavailable"}
        role="img"
      >
        <ImageOff className="size-5 opacity-60" />
      </div>
    );
  }

  return (
    <Image
      className={className}
      alt={alt}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
