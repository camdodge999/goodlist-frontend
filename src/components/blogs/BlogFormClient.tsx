'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faEye } from '@fortawesome/free-solid-svg-icons';
import { Blog, BlogFormData } from '@/types/blog';
import { useBlog } from '@/hooks/useBlog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import BlogFormSkeleton from '@/components/blogs/BlogFormSkeleton';
import StatusDialog from '@/components/common/StatusDialog';
import useShowDialog from '@/hooks/useShowDialog';

interface UploadedImage {
  fileName: string;
  path: string;
  url: string;
  size: number;
  type: string;
}

interface BlogFormClientProps {
  blogId?: string;
}

export default function BlogFormClient({ blogId }: BlogFormClientProps) {
  const router = useRouter();
  const {
    loading,
    error,
    createBlog,
    updateBlog,
    getBlogById,
    canManageBlogs
  } = useBlog({ adminOnly: true });

  // Dialog hooks
  const {
    showSuccessDialog,
    setShowSuccessDialog,
    successMessage,
    successTitle,
    successButtonText,
    showErrorDialog,
    setShowErrorDialog,
    errorMessage,
    errorTitle,
    errorButtonText,
    displaySuccessDialog,
    displayErrorDialog,
    handleSuccessClose,
    handleErrorClose,
  } = useShowDialog();

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    linkPath: '',
    fileMarkdownPath: '',
    status: 'draft',
    tags: '',
    metaDescription: '',
    featured: false
  });

  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!blogId);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const isEditing = !!blogId;

  // Handle uploaded images from markdown editor
  const handleImageUpload = (images: UploadedImage[]) => {
    setUploadedImages(images);
  };

  // Check authentication and redirect if not admin
  useEffect(() => {
    if (!loading && !canManageBlogs) {
      router.push('/login');
      return;
    }
  }, [loading, canManageBlogs, router]);

  // Fetch blog data if editing
  useEffect(() => {
    if (blogId && canManageBlogs) {
      const fetchBlog = async () => {
        setIsFetching(true);
        try {
          const blog = await getBlogById(blogId);
          if (blog) {
            setEditingBlog(blog);
            setFormData({
              title: blog.title,
              slug: blog.slug,
              content: blog.content || '',
              excerpt: blog.excerpt || '',
              linkPath: blog.linkPath || '',
              fileMarkdownPath: blog.fileMarkdownPath || '',
              status: blog.status,
              tags: typeof blog.tags === 'string' ? blog.tags : blog.tags?.join(',') || '',
              metaDescription: blog.metaDescription || '',
              featured: blog.featured
            });
          } else {
            displayErrorDialog({
              title: "เกิดข้อผิดพลาด",
              message: "ไม่พบบทความที่ต้องการแก้ไข",
              buttonText: "กลับไปจัดการบทความ",
              onButtonClick: () => router.push('/blog-management')
            });
          }
        } catch (err) {
          displayErrorDialog({
            title: "เกิดข้อผิดพลาด",
            message: "ไม่สามารถโหลดข้อมูลบทความได้",
            buttonText: "กลับไปจัดการบทความ",
            onButtonClick: () => router.push('/blog-management')
          });
        } finally {
          setIsFetching(false);
        }
      };

      fetchBlog();
    }
  }, [blogId, canManageBlogs, getBlogById, router, displayErrorDialog]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create form data with uploaded images
      const blogDataWithImages = {
        ...formData,
        uploadedImages: uploadedImages.map(img => img.path) // Include image paths
      };

      if (isEditing && editingBlog) {
        const updated = await updateBlog(editingBlog.id, blogDataWithImages);
        if (updated) {
          displaySuccessDialog({
            title: "สำเร็จ",
            message: "อัพเดตบทความเรียบร้อยแล้ว",
            buttonText: "กลับไปจัดการบทความ",
            onButtonClick: () => router.push('/blog-management')
          });
        }
      } else {
        const created = await createBlog(blogDataWithImages);
        if (created) {
          displaySuccessDialog({
            title: "สำเร็จ",
            message: "สร้างบทความเรียบร้อยแล้ว",
            buttonText: "กลับไปจัดการบทความ",
            onButtonClick: () => router.push('/blog-management')
          });
        }
      }
    } catch (err) {
      displayErrorDialog({
        title: "เกิดข้อผิดพลาด",
        message: `ไม่สามารถ${isEditing ? 'อัพเดต' : 'สร้าง'}บทความได้`,
        buttonText: "ลองใหม่"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    if (formData.slug) {
      window.open(`/blogs/${formData.slug}`, '_blank');
    } else {
      displayErrorDialog({
        title: "คำเตือน",
        message: "กรุณาเพิ่ม slug เพื่อดูตัวอย่างบทความ",
        buttonText: "ตกลง"
      });
    }
  };

  // Show loading state while fetching blog data
  if (isFetching) {
    return <BlogFormSkeleton />;
  }

  // Show error if not authenticated or not admin
  if (!canManageBlogs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>ไม่มีสิทธิ์เข้าถึง</CardTitle>
            <CardDescription>
              คุณต้องมีสิทธิ์ผู้ดูแลระบบเพื่อเข้าถึงการจัดการบทความ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              ไปหน้าเข้าสู่ระบบ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/blog-management')}
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
              กลับไปจัดการบทความ
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'แก้ไขบทความ' : 'สร้างบทความใหม่'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? 'อัพเดตเนื้อหาและการตั้งค่าบทความของคุณ' : 'เขียนและเผยแพร่บทความใหม่ของคุณ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
              <CardDescription>
                รายละเอียดสำคัญเกี่ยวกับบทความของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">หัวข้อ *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="ใส่หัวข้อบทความ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-ของ-บทความ"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">สรุปย่อ</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="คำอธิบายสั้นๆ เกี่ยวกับบทความของคุณ..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>เนื้อหา</CardTitle>
              <CardDescription>
                เขียนเนื้อหาบทความของคุณโดยใช้ Markdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="เขียนเนื้อหาบทความของคุณในรูปแบบ Markdown..."
                minHeight="500px"
                onImageUpload={handleImageUpload}
              />
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่า</CardTitle>
              <CardDescription>
                กำหนดค่าการเผยแพร่และจัดการSEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">สถานะ</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">ร่าง</SelectItem>
                      <SelectItem value="published">เผยแพร่</SelectItem>
                      <SelectItem value="archived">จัดเก็บ</SelectItem>
                      <SelectItem value="deleted">ลบ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">แท็ก</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="react, nextjs, javascript"
                  />
                  <p className="text-xs text-muted-foreground">แยกแท็กด้วยเครื่องหมาย ,</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkPath">ลิงก์บทความ</Label>
                  <Input
                    id="linkPath"
                    value={formData.linkPath}
                    onChange={(e) => setFormData({ ...formData, linkPath: e.target.value })}
                    placeholder="/blogs/slug-of-blog-post"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileMarkdownPath">เส้นทางไฟล์ Markdown</Label>
                  <Input
                    id="fileMarkdownPath"
                    value={formData.fileMarkdownPath}
                    onChange={(e) => setFormData({ ...formData, fileMarkdownPath: e.target.value })}
                    placeholder="/content/blogs/your-post.md"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">คำอธิบายอื่นๆ</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="คำอธิบายอื่นๆ สำหรับ SEO (สูงสุด 160 ตัวอักษร)"
                  maxLength={160}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metaDescription.length}/160 ตัวอักษร
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
                />
                <Label htmlFor="featured">บทความแนะนำ</Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={!formData.slug}
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
              <span>ตรวจสอบบทความก่อนเผยแพร่</span>
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/blog-management')}
              >
                <span>ยกเลิก</span>
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                <span>{isLoading ? 'กำลังบันทึก...' : (isEditing ? 'อัพเดตบทความ' : 'สร้างบทความ')}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Status Dialogs */}
      <StatusDialog
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        type="success"
        title={successTitle}
        message={successMessage}
        buttonText={successButtonText}
        onButtonClick={handleSuccessClose}
      />

      <StatusDialog
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        type="error"
        title={errorTitle}
        message={errorMessage}
        buttonText={errorButtonText}
        onButtonClick={handleErrorClose}
      />
    </div>
  );
} 