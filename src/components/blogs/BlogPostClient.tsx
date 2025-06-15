"use client";

import Link from "next/link";
import ReactMarkdown, { Components } from "react-markdown";
import Image from "next/image";
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
import * as React from "react";

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
  const authorName = blog?.createdBy?.displayName || blog?.author?.displayName || 'Unknown Author';

  // Memoize components to avoid recreation on every render
  const markdownComponents = React.useMemo(() => ({
    h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
    h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
    h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
    p: ({ children }: { children: React.ReactNode }) => <div className="mb-3 leading-relaxed break-words hyphens-auto">{children}</div>,
    ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">
        {children}
      </blockquote>
    ),
    code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
      const isInline = !className
      return isInline ? (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      ) : (
        <code className={className}>{children}</code>
      ) 
    },
    pre: ({ children }: { children: React.ReactNode }) => (
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-3 whitespace-pre-wrap break-all">
        {children}
      </pre>
    ),
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <Image 
        src={src as string} 
        alt={alt || ""} 
        className="max-w-full h-auto rounded-lg shadow-sm mb-3"
        loading="lazy"
        width={800}
        height={600}
      />
    ),
  }), [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto min-h-[calc(100vh-521px)]">
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
            <span>{formatDate(blog.createdAt)}</span>
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
        </header>

        {/* Blog Content */}
        <article className="mb-8">
          <div className="prose prose-lg max-w-none break-words overflow-wrap-anywhere">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents as unknown as Components}
            >
              {blog.content ?? "No content available."}
            </ReactMarkdown>
          </div>
        </article>

        {/* Blog metadata */}
        {blog.metaDescription && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg text-wrap">
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
              <span>กลับไปยังบทความทั้งหมด</span>
            </Link>
            
            {/* <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Share:</span>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <span className="sr-only">Share on Twitter</span>
                <span className="text-lg">🐦</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <span className="sr-only">Share on Facebook</span>
                <span className="text-lg">📘</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <span className="sr-only">Copy link</span>
                <span className="text-lg">🔗</span>
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
} 