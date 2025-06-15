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
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    fetchBlogBySlug, 
    loading, 
    error 
  } = useBlog();

  useEffect(() => {
    if (!slug || isInitialized) return;

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
        setIsInitialized(true);
      } catch (err) {
        console.error('Error loading blog:', err);
        setNotFound(true);
        setIsInitialized(true);
      }
    };

    loadBlog();
  }, [slug, isInitialized]); // Removed fetchBlogBySlug from dependencies to prevent auto-refetch on window focus

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-521px)] bg-gray-50">
        <ContentWidth>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                {/* Breadcrumb skeleton */}
                <div className="mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>

                {/* Header section skeleton */}
                <header className="mb-8">
                  {/* Featured badge skeleton */}
                  <div className="mb-4">
                    <div className="h-6 bg-yellow-100 rounded-full w-32"></div>
                  </div>

                  {/* Title skeleton */}
                  <div className="mb-4">
                    <div className="h-10 bg-gray-200 rounded mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded w-4/5"></div>
                  </div>
                  
                  {/* Author info skeleton */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-4 bg-gray-200 rounded w-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  
                  {/* Tags skeleton */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="h-6 bg-blue-100 rounded-full w-20"></div>
                    <div className="h-6 bg-blue-100 rounded-full w-24"></div>
                    <div className="h-6 bg-blue-100 rounded-full w-18"></div>
                    <div className="h-6 bg-blue-100 rounded-full w-16"></div>
                  </div>

                  {/* Engagement metrics skeleton */}
                  <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-18"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </header>

                {/* Content skeleton */}
                <article className="mb-8">
                  <div className="space-y-4">
                    {/* Paragraph skeletons */}
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    
                    {/* Image placeholder */}
                    <div className="h-64 bg-gray-200 rounded-lg my-6"></div>
                    
                    {/* More paragraph skeletons */}
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    
                    {/* Subheading skeleton */}
                    <div className="h-6 bg-gray-200 rounded w-2/3 mt-8 mb-4"></div>
                    
                    {/* List items skeleton */}
                    <div className="space-y-2 ml-4">
                      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    
                    {/* Code block skeleton */}
                    <div className="bg-gray-100 p-4 rounded-lg my-6">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                    
                    {/* Final paragraphs */}
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </article>

                {/* Footer metadata skeleton */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
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
      <div className="min-h-[calc(100vh-521px)] bg-gray-50"> 
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
    <div className="min-h-[calc(100vh-521px)] bg-gray-50">
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