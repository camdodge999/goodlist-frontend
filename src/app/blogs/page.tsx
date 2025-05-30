import BlogsPage from "@/components/pages/BlogsPage";

interface PageProps {
  searchParams?: {
    page?: string;
    search?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  return <BlogsPage searchParams={searchParams} />;
} 