import {
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/dashboard/skeletons";

export default function AdminLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="space-y-6">
        <StatCardsSkeleton count={4} />
        <TableSkeleton rows={8} />
      </div>
    </div>
  );
}
