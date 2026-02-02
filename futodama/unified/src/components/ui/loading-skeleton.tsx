import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn("p-6 rounded-lg border bg-card", className)}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function LoadingList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function LoadingStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 rounded-lg border bg-card">
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="rounded-lg border">
      <div className="p-4 border-b">
        <Skeleton className="h-4 w-full" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
          <Skeleton className="h-4 w-[25%]" />
          <Skeleton className="h-4 w-[20%]" />
          <Skeleton className="h-4 w-[15%]" />
          <Skeleton className="h-4 w-[15%]" />
          <Skeleton className="h-4 w-[10%]" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton };
