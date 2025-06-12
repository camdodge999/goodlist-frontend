
import ContentWidth from "@/components/layout/ContentWidth";
import BlogClientWrapper from "@/components/blogs/BlogClientWrapper";
import { Footer } from "@/components/layout/Footer";
import { BlogProvider } from "@/contexts/BlogContext";

interface BlogsPageProps {
  readonly searchParams?: {
    page?: string;
    search?: string;
  };
}

// Server Component for initial data fetching
export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const search = searchParams?.search ?? "";
  const page = parseInt(searchParams?.page ?? "1", 10);

  // Initialize with empty data structure - similar to stores pattern
  const initialData = {
    blogs: [],
    pagination: {
      currentPage: page,
      totalPages: 1,
      totalBlogs: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 mx-auto">
      <ContentWidth>
        <div className="container mx-auto px-4 py-8">
          {/* Wrap with BlogProvider - similar to stores pattern */}
          <BlogProvider initialData={initialData} initialSearchQuery={search}>
            <BlogClientWrapper
              initialData={initialData}
              initialSearchQuery={search}
            />
          </BlogProvider>
        </div>
      </ContentWidth>
      <Footer />
    </div>
  );
} 