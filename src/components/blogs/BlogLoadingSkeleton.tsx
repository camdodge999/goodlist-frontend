"use client";

interface BlogLoadingSkeletonProps {
  count?: number;
}

export default function BlogLoadingSkeleton({ 
  count = 6 
}: BlogLoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="flex">
            {/* Image placeholder - left side */}
            <div className="relative w-80 h-64 flex-shrink-0">
              <div className="w-full h-full bg-gray-200"></div>
              {/* Featured badge placeholder */}
              <div className="absolute top-4 left-4">
                <div className="h-6 bg-gray-300 rounded-full w-24"></div>
              </div>
            </div>
            
            {/* Content section - right side */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                {/* Title placeholder */}
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-6 bg-gray-200 rounded mb-4 w-4/5"></div>
                
                {/* Description placeholder */}
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
                
                {/* Tags placeholder */}
                <div className="flex gap-2 mb-6">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-18"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-14"></div>
                </div>
              </div>
              
              {/* Author info placeholder - bottom */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    {/* Author name placeholder */}
                    <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                    {/* Date placeholder */}
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                
                {/* Read time and views placeholder */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 