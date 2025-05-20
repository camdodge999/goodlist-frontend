import { Skeleton } from "@/components/ui/skeleton";

export default function StoreDetailClientSkeleton() {
    return (
        <div className="space-y-6 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              {/* Header Skeleton */}
              <div className="px-6 py-5 sm:px-8 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-24 h-24 rounded-xl" />
                    <div>
                      <Skeleton className="h-8 w-48 mb-2" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
              
              {/* Description Skeleton */}
              <div className="px-6 py-4 sm:px-8 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
              
              {/* Store Details Skeleton */}
              <div className="border-t border-gray-200 px-6 py-5 sm:px-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Contact Information Skeleton */}
                  <div className="p-5 border border-gray-100 shadow-sm rounded-md">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="space-y-4">
                      <div>
                        <Skeleton className="h-5 w-24 mb-1" />
                        <Skeleton className="h-5 w-48" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-8 w-40" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-28 mb-1" />
                        <Skeleton className="h-5 w-36" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Information Skeleton */}
                  <div className="p-5 border border-gray-100 shadow-sm rounded-md">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="space-y-4">
                      <div>
                        <Skeleton className="h-5 w-28 mb-1" />
                        <Skeleton className="h-5 w-36" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-8 w-40" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons Skeleton */}
              <div className="border-t border-gray-200 px-6 py-5 sm:px-8 bg-gray-50">
                <div className="flex justify-end">
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
}