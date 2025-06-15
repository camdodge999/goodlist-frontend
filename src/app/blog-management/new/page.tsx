import { Suspense } from 'react';
import { Metadata } from 'next';
import BlogFormClient from '@/components/blogs/BlogFormClient';
import BlogFormSkeleton from '@/components/blogs/BlogFormSkeleton';
import { metadataPages } from '@/consts/metadata';
import { requireAdmin } from '@/lib/auth-utils';

export const metadata: Metadata = {
  title: metadataPages['new-blog'].title,
  description: metadataPages['new-blog'].description,
};

export default async function NewBlogPage() {
  // Server-side admin check - automatically redirects if not admin
  await requireAdmin();

  return (
    <Suspense fallback={<BlogFormSkeleton />}>
      <BlogFormClient />
    </Suspense>
  );
} 