import {
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/dashboard/skeletons";

export default function DashboardLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="space-y-6">
        <StatCardsSkeleton count={5} />
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}
