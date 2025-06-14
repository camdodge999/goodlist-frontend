'use client';

import { useState, useEffect, useCallback } from 'react';
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
import CSRFInput from '@/components/ui/csrf-input';
import { BlogFormInput, validateBlogForm } from '@/validators/blog.schema';

interface UploadedImage {
  fileName: string;
  path: string;
  url: string;
  size: number;
  type: string;
}

interface BlogFormClientProps {
  readonly blogId?: string;
}

// Validation error type
interface ValidationErrors {
  [key: string]: string;
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function BlogFormClient({ blogId }: BlogFormClientProps) {
  const router = useRouter();
  const {
    loading,
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

  const [formData, setFormData] = useState<BlogFormInput>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    tags: '',
    metaDescription: '',
    featured: false,
    uploadedImages: []
  });

  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!blogId);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isEditing = !!blogId;

  // Validation helper function - memoized to prevent recreation
  const validateForm = useCallback((data: BlogFormInput): ValidationErrors => {
    const result = validateBlogForm(data);
    const errors: ValidationErrors = {};

    if (!result.success) {
      result.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        errors[field] = error.message;
      });
    }

    return errors;
  }, []);

  // Clear individual field error when user starts typing - optimized
  const clearFieldError = useCallback((fieldName: string) => {
    if (hasSubmitted && validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [hasSubmitted, validationErrors]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle uploaded images from markdown editor - memoized
  const handleImageUpload = useCallback((images: UploadedImage[]) => {
    setUploadedImages(images);
  }, []);

  // Check authentication and redirect if not admin
  useEffect(() => {
    if (!loading && !canManageBlogs) {
      router.push('/login');
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
              content: blog.content ?? '',
              excerpt: blog.excerpt ?? '',  
              status: blog.status,
              tags: typeof blog.tags === 'string' ? blog.tags : blog.tags?.join(',') ?? '',
              metaDescription: blog.metaDescription ?? '',
              featured: blog.featured,
              uploadedImages: []
            });
          } else {
            displayErrorDialog({
              title: "เกิดข้อผิดพลาด",
              message: "ไม่พบบทความที่ต้องการแก้ไข",
              buttonText: "กลับไปจัดการบทความ",
              onButtonClick: () => router.push('/blog-management')
            });
          }
        } catch {
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

  // Debounce slug input for better performance
  const debouncedSlug = useDebounce(formData.slug, 300);

  // Auto-generate slug from title (immediate, not debounced)
  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  // Optimized input handlers using useCallback
  const handleInputChange = useCallback((field: keyof BlogFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
  }, [clearFieldError]);

  const handleSelectChange = useCallback((field: keyof BlogFormData) => (
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
  }, [clearFieldError]);

  const handleCheckboxChange = useCallback((field: keyof BlogFormData) => (
    checked: boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
    clearFieldError(field);
  }, [clearFieldError]);

  const handleContentChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
    clearFieldError('content');
  }, [clearFieldError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark that form has been submitted
    setHasSubmitted(true);
    
    // Validate form before submission (use current formData, not debounced)
    const errors = validateForm(formData);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData instance
      const formDataToSubmit = new FormData();
      
      // Create markdown file from content
      const markdownContent = formData.content;
      const markdownFileName = `${formData.slug || 'blog'}.md`;
      const markdownFile = new File([markdownContent], markdownFileName, {
        type: 'text/markdown'
      });
      
      // Add all form fields to FormData
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('slug', formData.slug);
      formDataToSubmit.append('content', formData.content);
      formDataToSubmit.append('excerpt', formData.excerpt || '');
      formDataToSubmit.append('status', formData.status);
      formDataToSubmit.append('tags', formData.tags || '');
      formDataToSubmit.append('metaDescription', formData.metaDescription || '');
      formDataToSubmit.append('featured', formData.featured.toString());
      
      // Add the markdown file
      formDataToSubmit.append('markdownFile', markdownFile);
      
      // Add uploaded images paths
      uploadedImages.forEach((img, index) => {
        formDataToSubmit.append(`uploadedImages[${index}]`, img.path);
      });

      if (isEditing && editingBlog) {
        // For updates, also use FormData
        const updated = await updateBlog(editingBlog.id, formDataToSubmit);
        if (updated) {
          displaySuccessDialog({
            title: "สำเร็จ",
            message: "อัพเดตบทความเรียบร้อยแล้ว",
            buttonText: "กลับไปจัดการบทความ",
            onButtonClick: () => router.push('/blog-management')
          });
        }
      } else {
        // For creation, use FormData
        const created = await createBlog(formDataToSubmit);
        if (created) {
          displaySuccessDialog({
            title: "สำเร็จ",
            message: "สร้างบทความเรียบร้อยแล้ว",
            buttonText: "กลับไปจัดการบทความ",
            onButtonClick: () => router.push('/blog-management')
          });
        }
      }
    } catch {
      displayErrorDialog({
        title: "เกิดข้อผิดพลาด",
        message: `ไม่สามารถ${isEditing ? 'อัพเดต' : 'สร้าง'}บทความได้`,
        buttonText: "ลองใหม่"
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, hasSubmitted, validateForm, displayErrorDialog, isEditing, editingBlog, updateBlog, createBlog, uploadedImages, displaySuccessDialog, router]);

  const handlePreview = useCallback(() => {
    if (debouncedSlug) {
      window.open(`/blogs/${debouncedSlug}`, '_blank');
    } else {
      displayErrorDialog({
        title: "คำเตือน",
        message: "กรุณาเพิ่ม slug เพื่อดูตัวอย่างบทความ",
        buttonText: "ตกลง"
      });
    }
  }, [debouncedSlug, displayErrorDialog]);

  // Helper function to get error message for a field (only show if submitted) - memoized
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return hasSubmitted ? validationErrors[fieldName] : undefined;
  }, [hasSubmitted, validationErrors]);

  // Helper function to check if field has error (only show if submitted) - memoized
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return hasSubmitted && !!validationErrors[fieldName];
  }, [hasSubmitted, validationErrors]);

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
          <CSRFInput />
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลบทความ</CardTitle>  
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
                    onChange={handleInputChange('title')}
                    placeholder="ใส่หัวข้อบทความ"
                    className={hasFieldError('title') ? 'border-red-500' : ''}
                  />
                  {getFieldError('title') && (
                    <p className="text-sm text-red-500">{getFieldError('title')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={handleInputChange('slug')}
                    placeholder="url-ของ-บทความ"  
                    className={hasFieldError('slug') ? 'border-red-500' : ''}
                  />
                  {getFieldError('slug') && (
                    <p className="text-sm text-red-500">{getFieldError('slug')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">สรุปย่อ</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange('excerpt')}
                  placeholder="คำอธิบายสั้นๆ เกี่ยวกับบทความของคุณ..."
                  rows={3}
                  className={hasFieldError('excerpt') ? 'border-red-500' : ''}
                />
                {getFieldError('excerpt') && (
                  <p className="text-sm text-red-500">{getFieldError('excerpt')}</p>
                )}
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
              <div className="space-y-2">
                <MarkdownEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="เขียนเนื้อหาบทความของคุณในรูปแบบ Markdown..."
                  minHeight="500px"
                  onImageUpload={handleImageUpload}
                />
                {getFieldError('content') && (
                  <p className="text-sm text-red-500">{getFieldError('content')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่า</CardTitle>
              <CardDescription>
                กำหนดค่าการเผยแพร่และจัดการ SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">สถานะ</Label>
                  <Select
                    value={formData.status}
                    onValueChange={handleSelectChange('status')}
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
                    onChange={handleInputChange('tags')}
                    placeholder="react, nextjs, javascript"
                    className={hasFieldError('tags') ? 'border-red-500' : ''}
                  />
                  {getFieldError('tags') && (
                    <p className="text-sm text-red-500">{getFieldError('tags')}</p>
                  )}
                  <p className="text-xs text-muted-foreground">แยกแท็กด้วยเครื่องหมาย ,</p>
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="metaDescription">คำอธิบายอื่นๆ</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange('metaDescription')}
                  placeholder="คำอธิบายอื่นๆ สำหรับ SEO (สูงสุด 160 ตัวอักษร)"
                  maxLength={160}
                  rows={2}
                  className={hasFieldError('metaDescription') ? 'border-red-500' : ''}
                />
                {getFieldError('metaDescription') && (
                  <p className="text-sm text-red-500">{getFieldError('metaDescription')}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.metaDescription?.length ?? 0}/160 ตัวอักษร
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={handleCheckboxChange('featured')}
                />
                <Label htmlFor="featured" className="cursor-pointer">บทความแนะนำ</Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={!debouncedSlug}
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
                <span>
                  {(() => {
                    if (isLoading) return 'กำลังบันทึก...';
                    return isEditing ? 'อัพเดตบทความ' : 'สร้างบทความ';
                  })()}
                </span>
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