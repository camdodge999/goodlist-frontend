import { Suspense } from "react";
import ContentWidth from "@/components/layout/ContentWidth";
import BlogClientWrapper from "@/components/blogs/BlogClientWrapper";
import { Footer } from "@/components/layout/Footer";
import { getBlogs } from "@/lib/blog-service";
import { BlogPageSkeleton } from "../blogs/BlogPageSkeleton";

interface BlogsPageProps {
  searchParams?: {
    page?: string;
    search?: string;
  };
  nonce?: string | null;
}

// Server Component for initial data fetching
export default async function BlogsPage({ searchParams, nonce }: BlogsPageProps) {
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
          <Suspense fallback={<BlogPageSkeleton />}>
            <BlogClientWrapper
              initialData={initialData}
              initialSearchQuery={search}
              nonce={nonce}
            />
          </Suspense>
        </div>
      </ContentWidth >
      <Footer />
    </div >
  );
} 