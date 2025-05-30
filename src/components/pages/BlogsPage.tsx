import { Suspense } from "react";
import ContentWidth from "@/components/layout/ContentWidth";
import BlogClientWrapper from "@/components/blogs/BlogClientWrapper";
import BlogLoadingSkeleton from "@/components/blogs/BlogLoadingSkeleton";
import { Footer } from "@/components/layout/Footer";
import { getBlogs } from "@/lib/blog-service";

interface BlogsPageProps {
  searchParams?: {
    page?: string;
    search?: string;
  };
}

// Server Component for initial data fetching
export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const page = parseInt(searchParams?.page || "1");
  const search = searchParams?.search || "";

  // Fetch initial data on the server
  const initialData = await getBlogs({
    page,
    limit: 6,
    search,
  });

  return (
    <div className="min-h-screen bg-gray-50 mx-auto">
      <ContentWidth>
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<BlogLoadingSkeleton />}>
            <BlogClientWrapper 
              initialData={initialData}
              initialSearchQuery={search}
            />
          </Suspense>
        </div>
      </ContentWidth>
      <Footer />
    </div>
  );
} 