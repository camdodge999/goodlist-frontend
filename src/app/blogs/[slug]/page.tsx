'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useBlog } from '@/hooks/useBlog';
import BlogPostClient from "@/components/blogs/BlogPostClient";
import BlogNotFound from "@/components/blogs/BlogNotFound";
import ContentWidth from "@/components/layout/ContentWidth";
import { Footer } from "@/components/layout/Footer";
import { Blog } from '@/types/blog';

// Client Component for blog post page
export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  const { 
    fetchBlogBySlug, 
    loading, 
    error 
  } = useBlog();

  useEffect(() => {
    if (!slug) return;

    const loadBlog = async () => {
      try {
        const fetchedBlog = await fetchBlogBySlug(slug);
        if (fetchedBlog) {
          setBlog(fetchedBlog);
          setNotFound(false);
        } else {
          setBlog(null);
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error loading blog:', err);
        setNotFound(true);
      }
    };

    loadBlog();
  }, [slug, fetchBlogBySlug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ContentWidth>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded mb-6"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </ContentWidth>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ContentWidth>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blog</h1>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        </ContentWidth>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ContentWidth>
        {blog && !notFound ? (
          <BlogPostClient blog={blog} />
        ) : (
          <BlogNotFound slug={slug} />
        )}
      </ContentWidth>
      <Footer />
    </div>
  );
} 