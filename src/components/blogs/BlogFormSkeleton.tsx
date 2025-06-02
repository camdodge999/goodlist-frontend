import { Skeleton } from '@/components/ui/skeleton';

export default function BlogFormSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Skip title skeleton as requested */}
          
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Skeleton className="h-10 w-48" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 