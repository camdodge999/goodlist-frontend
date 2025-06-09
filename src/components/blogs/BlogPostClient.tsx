"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Blog } from "@/types/blog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import "highlight.js/styles/github.css";
import dayjs from "dayjs";

interface BlogPostClientProps {
  readonly blog: Blog;
}

export default function BlogPostClient({ blog }: BlogPostClientProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    const date = dayjs(dateString);
    return date.format("DD MMMM YYYY");
  };

  // Helper function to convert tags string to array
  const getTagsArray = (tags?: string | string[]): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.filter(tag => tag.length > 0);
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  // Helper function to calculate read time from content
  const calculateReadTime = (content?: string, fallbackReadTime?: number): number => {
    if (fallbackReadTime) return fallbackReadTime;
    if (!content) return 1;
    
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const tagsArray = getTagsArray(blog?.tags);
  const readTime = calculateReadTime(blog?.content, blog?.readTime);
  const authorName = typeof blog?.author === 'string' ? blog?.author : blog?.author?.name || 'Unknown Author';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">หน้าแรก</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/blogs">บทความ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{blog.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Blog Header */}
        <header className="mb-8">
          {/* Featured badge */}
          {blog.featured && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ⭐ Featured Post
              </span>
            </div>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
            <span>By {authorName}</span>
            <span>•</span>
            <span>{formatDate(blog.publishedAt)}</span>
            <span>•</span>
            <span>{readTime} min read</span>
            {blog.viewCount > 0 && (
              <>
                <span>•</span>
                <span>{blog.viewCount} views</span>
              </>
            )}
          </div>
          
          {/* Tags */}
          {tagsArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tagsArray.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement metrics */}
          {(blog.likeCount > 0 || blog.shareCount > 0 || blog.commentCount > 0) && (
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 p-4 bg-gray-50 rounded-lg">
              {blog.likeCount > 0 && (
                <span className="flex items-center gap-1">
                  <span>👍</span>
                  {blog.likeCount} likes
                </span>
              )}
              {blog.shareCount > 0 && (
                <span className="flex items-center gap-1">
                  <span>📤</span>
                  {blog.shareCount} shares
                </span>
              )}
              {blog.commentCount > 0 && (
                <span className="flex items-center gap-1">
                  <span>💬</span>
                  {blog.commentCount} comments
                </span>
              )}
            </div>
          )}
        </header>

        {/* Blog Content */}
        <article className="mb-8">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {blog.content || "No content available."}
            </ReactMarkdown>
          </div>
        </article>

        {/* Blog metadata */}
        {blog.metaDescription && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Summary</h3>
            <p className="text-blue-800 text-sm">{blog.metaDescription}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link
              href="/blogs"
              className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              กลับไปยังบทความทั้งหมด
            </Link>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Share:</span>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <span className="sr-only">Share on Twitter</span>
                🐦
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <span className="sr-only">Share on Facebook</span>
                📘
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <span className="sr-only">Copy link</span>
                🔗
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 