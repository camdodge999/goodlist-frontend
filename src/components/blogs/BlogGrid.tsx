"use client";

import Link from "next/link";
import Image from "next/image";
import { Blog } from "@/types/blog";
import { getFirstImageFromMarkdown, generateExcerptFromMarkdown } from "@/utils/markdown-utils";
import dayjs from "dayjs";

interface BlogGridProps {
  readonly blogs: Blog[];
  readonly searchQuery?: string;
  readonly isLoading?: boolean;
}

export default function BlogGrid({ blogs, searchQuery, isLoading }: BlogGridProps) {  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    return dayjs(dateString).format("MMMM D, YYYY");
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

  // Enhanced empty state for store verification content
  const EmptyState = () => {
    if (searchQuery) {
      return (
        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No Store Guides Found
            </h3>
            <p className="text-gray-600 mb-4">
              No store verification guides match your search for &quot;{searchQuery}&quot;
            </p>
            <p className="text-sm text-gray-500">
              Try different keywords or browse all verification guides
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-8">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Learn How to Shop Safely Online
          </h3>
          
          <p className="text-xl text-gray-600 mb-10">
            Discover comprehensive guides to verify stores and protect yourself from scams
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-green-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-green-900 mb-3">Verify Stores</h4>
              <p className="text-green-800">Learn to identify legitimate sellers and verified stores across all platforms</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-blue-900 mb-3">Safety Checklists</h4>
              <p className="text-blue-800">Follow step-by-step verification processes for different marketplaces</p>
            </div>

            <div className="bg-red-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-red-900 mb-3">Avoid Scams</h4>
              <p className="text-red-800">Recognize common scam tactics and protect your money and personal data</p>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/verify" 
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Verify a Store Now
            </Link>
            <Link 
              href="/store" 
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Browse Verified Stores
            </Link>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Image skeleton */}
              <div className="lg:w-80 h-64 lg:h-auto bg-gray-200"></div>
              
              {/* Content skeleton */}
              <div className="flex-1 p-8">
                <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded mb-6 w-2/3"></div>
                
                <div className="flex gap-2 mb-6">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">
      {blogs.map((blog) => {
        const tagsArray = getTagsArray(blog.tags);
        const readTime = calculateReadTime(blog.content, blog.readTime);
        const authorName = blog.createdBy?.displayName || blog.author?.displayName || blog.author?.name || 'Unknown Author';
        
        // Extract hero image from markdown content
        const heroImage = blog.content ? getFirstImageFromMarkdown(blog.content) : null;
        
        // Generate enhanced excerpt from markdown if not provided
        const displayExcerpt = blog.excerpt || (blog.content ? generateExcerptFromMarkdown(blog.content, 180) : '');

        return (
          <article
            key={blog.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Hero Image */}
              <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden">
                {heroImage ? (
                  <Image
                    src={heroImage.src}
                    alt={heroImage.alt || blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                
                {/* Featured badge overlay */}
                {blog.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      ⭐ Featured Guide
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-8 flex flex-col">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    <Link href={`/blogs/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {displayExcerpt}
                  </p>

                  {/* Tags */}
                  {tagsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tagsArray.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium border border-blue-100"
                        >
                          {tag}
                        </span>
                      ))}
                      {tagsArray.length > 4 && (
                        <span className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full font-medium border border-gray-200">
                          +{tagsArray.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {authorName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{authorName}</span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {formatDate(blog.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {readTime} min read
                    </span>
                    
                    {blog.viewCount > 0 && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {blog.viewCount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
} 