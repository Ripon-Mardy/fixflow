"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function AdminError({
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
        title="Something went wrong in the admin console."
        onRetry={reset}
      />
    </div>
  );
}
