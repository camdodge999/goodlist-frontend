import { Suspense } from 'react';
import { Metadata } from 'next';
import BlogManagementClient from '@/components/blogs/BlogManagementClient';
import BlogManagementSkeleton from '@/components/blogs/BlogManagementSkeleton';
import { metadataPages } from '@/consts/metadata';
import { requireAdmin } from '@/lib/auth-utils';

export const metadata: Metadata = {
  title: metadataPages['blog-management'].title,
  description: metadataPages['blog-management'].description,
};

// This could be used to fetch initial data server-side if needed
// async function getInitialBlogs() {
  // For now, we'll let the client component handle the data fetching
  // In the future, you could add server-side data fetching here:
  // try {
  //   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
  //     headers: {
  //       'Authorization': `Bearer ${token}`, // You'd need to get this from cookies/headers
  //     },
  //   });
  //   if (response.ok) {
  //     return await response.json();
  //   }
  // } catch (error) {
  //   console.error('Failed to fetch initial blogs:', error);
  // }
//   return [];
// }

export default async function BlogManagementPage() {
  // Server-side admin check - automatically redirects if not admin
  await requireAdmin();

  // Fetch initial data server-side (optional)
  // const initialBlogs = await getInitialBlogs();

  return (
    <Suspense fallback={<BlogManagementSkeleton />}>
      <BlogManagementClient />
    </Suspense>
  );
}
  