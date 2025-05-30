import { getBlogBySlug } from "@/lib/blog-service";
import BlogPostClient from "@/components/blogs/BlogPostClient";
import BlogNotFound from "@/components/blogs/BlogNotFound";
import ContentWidth from "@/components/layout/ContentWidth";
import { Footer } from "@/components/layout/Footer";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps) {
  const blog = await getBlogBySlug(params.slug);
  
  if (!blog) {
    return {
      title: 'Blog Post Not Found - Goodlistseller',
      description: 'The blog post you are looking for could not be found.',
    };
  }

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: blog.tags.join(', '),
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: [blog.author],
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
    },
  };
}

// Server Component for initial data fetching
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const blog = await getBlogBySlug(params.slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <ContentWidth>
        {blog ? (
          <BlogPostClient blog={blog} />
        ) : (
          <BlogNotFound slug={params.slug} />
        )}
      </ContentWidth>
      <Footer />
    </div>
  );
} 