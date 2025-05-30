"use client";

import Link from "next/link";
import { Blog } from "@/types/blog";
import dayjs from "dayjs";

interface BlogGridProps {
  blogs: Blog[];
  searchQuery?: string;
  isLoading?: boolean;
}

export default function BlogGrid({ blogs, searchQuery, isLoading }: BlogGridProps) {
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD MMMM YYYY");
  };

  // Minimal empty state with helpful tips
  const EmptyState = () => {
    if (searchQuery) {
      return (
        <div className="text-center py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 mb-4">
              No blogs match your search for "{searchQuery}"
            </p>
            <p className="text-sm text-gray-500">
              Try different keywords or browse all content
            </p>
          </div>
        </div>
      );
    }

    // Tips for verified stores and scam protection
    return (
      <div className="text-center py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Stay Safe While Shopping Online
          </h3>
          
          <p className="text-gray-600 mb-8">
            Learn how to identify verified stores and protect yourself from scams
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Verified Store Tips */}
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold text-green-900">Look for Verified Stores</h4>
              </div>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Check for verification badges</li>
                <li>• Read customer reviews and ratings</li>
                <li>• Verify contact information</li>
                <li>• Look for secure payment options</li>
              </ul>
            </div>

            {/* Scam Protection Tips */}
            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold text-red-900">Avoid Scam Stores</h4>
              </div>
              <ul className="space-y-2 text-sm text-red-800">
                <li>• Beware of unrealistic prices</li>
                <li>• Avoid stores with no reviews</li>
                <li>• Don't trust suspicious payment methods</li>
                <li>• Report suspicious activities</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/verify" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verify a Store
            </Link>
            <Link 
              href="/store" 
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View All verified stores
            </Link>
          </div>
        </div>
      </div>
    );
  };

  if (blogs.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {blogs.map((blog) => (
        <article
          key={blog.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
              <Link
                href={`/blogs/${blog.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {blog.title}
              </Link>
            </h2>

            <p className="text-gray-600 mb-4 line-clamp-3">
              {blog.excerpt}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>By {blog.author}</span>
              <span>{blog.readTime} min read</span>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              {formatDate(blog.publishedAt)}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
} 