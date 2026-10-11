import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function RequestNotFound() {
  return (
    <div className="py-10">
      <EmptyState
        icon={FileQuestion}
        title="We couldn't find that request."
        description="It may have been removed, or you don't have access to it."
        action={
          <Button asChild>
            <Link href="/dashboard/requests">Back to requests</Link>
          </Button>
        }
      />
    </div>
  );
}
