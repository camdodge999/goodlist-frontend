import { Suspense } from 'react';
import { Metadata } from 'next';
import BlogFormClient from '@/components/blogs/BlogFormClient';
import BlogFormSkeleton from '@/components/blogs/BlogFormSkeleton';
import { metadataPages } from '@/consts/metadata';
import { requireAdmin } from '@/lib/auth-utils';

export const metadata: Metadata = {
  title: metadataPages['edit-blog'].title,
  description: metadataPages['edit-blog'].description,
};

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  // Server-side admin check - automatically redirects if not admin
  await requireAdmin();
  
  const { id } = await params;
  
  return (
    <Suspense fallback={<BlogFormSkeleton />}>
      <BlogFormClient blogId={id} />
    </Suspense>
  );
} 