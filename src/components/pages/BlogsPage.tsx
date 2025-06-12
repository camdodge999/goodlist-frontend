import { Suspense } from "react";
import ContentWidth from "@/components/layout/ContentWidth";
import BlogClientWrapper from "@/components/blogs/BlogClientWrapper";
import { Footer } from "@/components/layout/Footer";
import { getBlogs } from "@/lib/blog-service";
import { BlogPageSkeleton } from "../blogs/BlogPageSkeleton";
import { BlogProvider } from "@/contexts/BlogContext";

interface BlogsPageProps {
  readonly searchParams?: {
    page?: string;
    search?: string;
  };
}

// Server Component for initial data fetching
export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const page = parseInt(searchParams?.page ?? "1");
  const search = searchParams?.search ?? "";  

  // Fetch initial data on the server - only published blogs
  const initialData = await getBlogs({
    page,
    limit: 6,
    search,
    status: 'published',
  });

  return (
    <BlogProvider initialData={initialData} initialSearchQuery={search}>
      <div className="min-h-screen bg-gray-50 mx-auto">
        <ContentWidth>
          <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<BlogPageSkeleton />}>
              <BlogClientWrapper
                initialData={initialData}
                initialSearchQuery={search}
              />
            </Suspense>
          </div>
        </ContentWidth >
        <Footer />
      </div >
    </BlogProvider>
  );
} 