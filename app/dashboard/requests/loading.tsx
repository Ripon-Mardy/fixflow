import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/dashboard/skeletons";

export default function RequestsLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <TableSkeleton rows={10} />
    </div>
  );
}
