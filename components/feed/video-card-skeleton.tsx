import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function VideoCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Video Section Skeleton */}
      <Skeleton className="aspect-video w-full" />

      {/* Content Section */}
      <div className="p-4">
        {/* User Info Skeleton */}
        <div className="flex items-start gap-3 mb-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Prompt Skeleton */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </Card>
  )
}
