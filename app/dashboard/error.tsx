"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-8">
      <ErrorState
        title="Something went wrong while loading this page."
        description="This is usually temporary. Try again, or head back to your dashboard."
        onRetry={reset}
      />
    </div>
  );
}
