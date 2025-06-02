import { Suspense } from 'react';
import { Metadata } from 'next';
import BlogFormClient from '@/components/blogs/BlogFormClient';
import BlogFormSkeleton from '@/components/blogs/BlogFormSkeleton';
import { metadataPages } from '@/consts/metadata';

export const metadata: Metadata = {
  title: metadataPages['new-blog'].title,
  description: metadataPages['new-blog'].description,
};

export default async function NewBlogPage() {
  return (
    <Suspense fallback={<BlogFormSkeleton />}>
      <BlogFormClient />
    </Suspense>
  );
} 