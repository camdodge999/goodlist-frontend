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

  // Helper function to convert tags string to array
  const getTagsArray = (tags?: string | string[]): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.filter(tag => tag.trim().length > 0);
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  const tagsArray = getTagsArray(blog.tags);
  const authorName = typeof blog.author === 'string' ? blog.author : blog.author?.name || 'Unknown Author';

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: tagsArray.join(', '),
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: [authorName],
      tags: tagsArray,
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