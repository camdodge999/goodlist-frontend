import BlogsPage from "@/components/pages/BlogsPage";

interface PageProps {
  readonly searchParams?: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  
  return <BlogsPage searchParams={resolvedSearchParams} />;
} 