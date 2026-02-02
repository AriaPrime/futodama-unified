import { LoadingStats, LoadingCard, LoadingList } from "@/components/ui/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Stats */}
      <LoadingStats />

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LoadingCard />
        <LoadingCard />
      </div>

      <LoadingList count={3} />
    </div>
  );
}
