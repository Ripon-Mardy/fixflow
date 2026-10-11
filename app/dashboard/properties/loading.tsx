import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/dashboard/skeletons";

export default function PropertiesLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} />
    </div>
  );
}
