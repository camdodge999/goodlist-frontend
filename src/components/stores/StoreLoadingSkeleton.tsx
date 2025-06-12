"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreLoadingSkeletonProps {
  readonly count?: number;
}

export default function StoreLoadingSkeleton({ 
  count = 6, 
}: StoreLoadingSkeletonProps) {
  return (
    <div className="py-8">
      <div className="max-w-9xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }, (_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video w-full bg-gray-100">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex items-center space-x-2 mt-4">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <div className="pt-2">
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 