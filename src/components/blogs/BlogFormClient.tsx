'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Blog, BlogFormData, BlogAsset } from '@/types/blog';
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
import ConfirmDialog from '@/components/common/ConfirmDialog';
import useShowDialog from '@/hooks/useShowDialog';
import CSRFInput from '@/components/ui/csrf-input';
import { BlogFormInput, validateBlogForm } from '@/validators/blog.schema';
import { extractImagesFromMarkdown } from '@/utils/markdown-utils';

interface UploadedImage {
  fileName: string;
  path: string;
  url: string;
  size: number;
  type: string;
  file?: File; // Add optional File object for MIME handling
}

interface BlogFormClientProps {
  readonly blogId?: string;
}

// Validation error type
interface ValidationErrors {
  [key: string]: string;
}

export default function BlogFormClient({ blogId }: BlogFormClientProps) {
  const router = useRouter();
  const {
    loading,
    createBlog,
    updateBlog,
    fetchBlogById,
    deleteBlog,
    canManageBlogs,
    cleanupDraftImages
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
    showConfirmDialog,
    setShowConfirmDialog,
    confirmTitle,
    confirmMessage,
    confirmButtonText,
    cancelButtonText,
    onConfirmButtonClick,
    onCancelButtonClick,
    displaySuccessDialog,
    displayErrorDialog,
    displayConfirmDialog,
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
    uploadedImages: [] // Keep as string[] for validation
  });

  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!blogId);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // Separate state for File objects
  const [draftImages, setDraftImages] = useState<string[]>([]); // Track draft images for cleanup

  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Add ref to track if component has been initialized
  const hasInitialized = useRef(false);
  const isPageRefresh = useRef(false);

  const isEditing = !!blogId;

  // Helper to determine the route context
  const getRouteContext = useCallback(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/blog-management/new')) {
        return 'new';
      } else if (pathname.includes('/blog-management/edit/')) {
        return 'edit';
      }
    }
    return isEditing ? 'edit' : 'new';
  }, [isEditing]);

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

  // Cleanup draft images when component unmounts (user navigates away without saving)
  useEffect(() => {
    return () => {
      // Only cleanup if there are unsaved draft images and the form wasn't submitted successfully
      if (draftImages.length > 0 && !hasSubmitted) {
        const routeContext = getRouteContext();

        // Different cleanup behavior based on route context:
        // - For new blog creation (blog-management/new): cleanup unused draft images
        // - For editing existing blog (blog-management/edit/[id]): be more conservative
        let shouldCleanup = false;

        if (routeContext === 'new') {
          // Always cleanup draft images when abandoning new blog creation
          shouldCleanup = true;
        } else if (routeContext === 'edit') {
          // Only cleanup if we don't have an existing blog loaded (safety check)
          shouldCleanup = !editingBlog;
        }

        if (shouldCleanup) {
          // Use a timeout to allow for navigation to complete
          setTimeout(() => {
            fetch('/api/blogs/cleanup-draft-images', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imagePaths: draftImages,
                action: 'cleanup'
              }),
            }).catch(error => {
              console.error('Error cleaning up draft images on unmount:', error);
            });
          }, 1000);
        }
      }
    };
  }, [draftImages, hasSubmitted, getRouteContext, editingBlog]);

  // Convert blog assets to UploadedImage format - memoized
  const convertAssetsToUploadedImages = useCallback((assets: BlogAsset[]): UploadedImage[] => {
    return assets.map(asset => ({
      fileName: asset.fileName || asset.originalName || 'unknown',
      path: asset.filePath,
      url: asset.filePath.startsWith('/') ? asset.filePath : `/${asset.filePath}`,
      size: 0, // Size not available from assets
      type: 'image/jpeg' // Default type, could be improved
    }));
  }, []);

  // Extract images from markdown content and convert to File objects
  const extractImagesFromMarkdownContent = useCallback(async (content: string): Promise<UploadedImage[]> => {
    const markdownImages = extractImagesFromMarkdown(content);
    const uploadedImages: UploadedImage[] = [];

    for (const markdownImage of markdownImages) {
      try {
        // Check if the image is a local uploaded image (starts with /uploads/)
        if (markdownImage.src.startsWith('/uploads/')) {
          // Fetch the image and convert to File object
          const response = await fetch(markdownImage.src);
          if (response.ok) {
            const blob = await response.blob();
            const fileName = markdownImage.src.split('/').pop() || 'image';
            const file = new File([blob], fileName, { type: blob.type });

            uploadedImages.push({
              fileName: fileName,
              path: markdownImage.src.replace('/uploads/', 'uploads/'),
              url: markdownImage.src,
              size: file.size,
              type: file.type,
              file: file
            });
          }
        }
      } catch (error) {
        console.warn('Failed to fetch image from markdown:', markdownImage.src, error);
      }
    }

    return uploadedImages;
  }, []);

  // Handle uploaded images from markdown editor - memoized
  const handleImageUpload = useCallback((images: UploadedImage[]) => {
    setUploadedImages(images);
    // Update formData.uploadedImages with paths for validation
    setFormData(prev => ({
      ...prev,
      uploadedImages: images.map(img => img.path)
    }));
    // Update uploadedFiles with File objects when available
    setUploadedFiles(images.map(img => img.file).filter((file): file is File => file !== undefined));

    // Track draft images (only new uploads from uploads/blog directory)
    const newDraftImages = images
      .filter(img => img.url.startsWith('/uploads/blog/'))
      .map(img => img.url);
    setDraftImages(prev => {
      const combined = [...prev, ...newDraftImages];
      return [...new Set(combined)]; // Remove duplicates
    });
  }, []);

  // Helper function to cleanup draft images and update state
  const handleCleanupDraftImages = useCallback(async (action: 'cleanup' | 'preserve' = 'cleanup') => {
    if (draftImages.length === 0) return;

    const success = await cleanupDraftImages(draftImages, action);

    if (success && action === 'cleanup') {
      // Clear draft images list after successful cleanup
      setDraftImages([]);
    }
  }, [draftImages, cleanupDraftImages]);

  // Check authentication and redirect if not admin
  useEffect(() => {
    if (!loading && !canManageBlogs) {
      router.push('/login');
    }
  }, [loading, canManageBlogs, router]);

  // Check if this is a page refresh vs navigation
  useEffect(() => {
    // Check if this is a page refresh by looking at navigation type
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      isPageRefresh.current = navigation.type === 'reload';
    }
  }, []);

  // Fetch blog data if editing - ONLY on page refresh
  useEffect(() => {
    if (blogId && canManageBlogs && !hasInitialized.current) {
      // Only fetch if this is a page refresh or first load
      if (isPageRefresh.current || !hasInitialized.current) {
        const fetchBlog = async () => {
          setIsFetching(true);
          try {
            const blog = await fetchBlogById(blogId);
            if (blog) {
              setEditingBlog(blog);
              const existingAssets = blog.assets ?? [];
              const existingUploadedImages = convertAssetsToUploadedImages(existingAssets);

              setFormData({
                title: blog.title,
                slug: blog.slug,
                content: blog.content ?? '',
                excerpt: blog.excerpt ?? '',
                status: blog.status,
                tags: typeof blog.tags === 'string' ? blog.tags : blog.tags?.join(',') ?? '',
                metaDescription: blog.metaDescription ?? '',
                featured: blog.featured,
                uploadedImages: existingAssets.map(asset => asset.filePath)
              });

              // Extract images from markdown content first
              const markdownImages = await extractImagesFromMarkdownContent(blog.content ?? '');

              // Combine existing assets with markdown images, prioritizing markdown images
              const allImages = [...markdownImages];

              // Add any existing assets that aren't already in markdown
              existingUploadedImages.forEach(existingImg => {
                const alreadyExists = markdownImages.some(mdImg => mdImg.path === existingImg.path);
                if (!alreadyExists) {
                  allImages.push(existingImg);
                }
              });

              // Set the uploaded images for the markdown editor
              setUploadedImages(allImages);

              // Set uploaded files from markdown images
              setUploadedFiles(allImages.map(img => img.file).filter((file): file is File => file !== undefined));

              // Track existing draft images (only from uploads/blog directory)
              const existingDraftImages = allImages
                .filter(img => img.url.startsWith('/uploads/blog/'))
                .map(img => img.url);
              setDraftImages(existingDraftImages);
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
            hasInitialized.current = true;
          }
        };

        fetchBlog();
      } else {
        hasInitialized.current = true;
      }
    } else if (!blogId) {
      // For new blog creation, mark as initialized immediately
      hasInitialized.current = true;
    }
  }, [blogId, canManageBlogs, fetchBlogById, router, displayErrorDialog, convertAssetsToUploadedImages, extractImagesFromMarkdownContent]);

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

      // Handle uploaded images - append File objects as an array
      uploadedFiles.forEach((file, index) => {
        formDataToSubmit.append(`markdownImage[${index}]`, file);
      });

      // Also append image paths for server processing
      formData.uploadedImages.forEach((imagePath, index) => {
        formDataToSubmit.append(`imagePath[${index}]`, imagePath);
      });

      if (isEditing && editingBlog) {
        // For updates (blog-management/edit/[id])
        const updated = await updateBlog(editingBlog.id, formDataToSubmit);
        if (updated) {
          // Handle draft image cleanup for EDITING existing blog
          if (formData.status === 'published' || formData.status === 'archived') {
            // If blog is published or archived, preserve the images (they're now permanent)
            await handleCleanupDraftImages('preserve');
          } else if (formData.status === 'deleted') {
            // If blog is deleted, cleanup the draft images
            await handleCleanupDraftImages('cleanup');
          } else if (formData.status === 'draft') {
            // For editing existing draft, preserve images for continued editing
            await handleCleanupDraftImages('preserve');
          }

          displaySuccessDialog({
            title: "สำเร็จ",
            message: "อัพเดตบทความเรียบร้อยแล้ว",
            buttonText: "กลับไปจัดการบทความ",
            onButtonClick: () => router.push('/blog-management')
          });
          setTimeout(() => {
            router.push('/blog-management');
          }, 1000);
        }
      } else {
        // For creation (blog-management/new)
        const created = await createBlog(formDataToSubmit);
        if (created) {
          // Handle draft image cleanup for CREATING new blog
          if (formData.status === 'published' || formData.status === 'archived') {
            // If new blog is published or archived, preserve the images (they're now permanent)
            await handleCleanupDraftImages('preserve');
          } else if (formData.status === 'deleted') {
            // If new blog is deleted, cleanup the draft images
            await handleCleanupDraftImages('cleanup');
          } else if (formData.status === 'draft') {
            // For new draft blog, preserve images for future editing
            await handleCleanupDraftImages('preserve');
          }

          displaySuccessDialog({
            title: "สำเร็จ",
            message: "สร้างบทความเรียบร้อยแล้ว",
            buttonText: "กลับไปจัดการบทความ",
            onButtonClick: () => router.push('/blog-management')
          });
          setTimeout(() => {
            router.push('/blog-management');
          }, 1000);
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
  }, [formData, hasSubmitted, validateForm, displayErrorDialog, isEditing, editingBlog, updateBlog, createBlog, displaySuccessDialog, router, uploadedFiles, handleCleanupDraftImages]);

    // const handlePreview = useCallback(() => {
    //   if (debouncedSlug) {
    //     window.open(`/blogs/${debouncedSlug}`, '_blank');
    //   } else {
    //     displayErrorDialog({
    //       title: "คำเตือน",
    //       message: "กรุณาเพิ่ม slug เพื่อดูตัวอย่างบทความ",
    //       buttonText: "ตกลง"
    //     });
    //   }
    // }, [debouncedSlug, displayErrorDialog]);

  const handleDeleteBlog = useCallback(() => {
    if (!editingBlog) return;
    
    displayConfirmDialog({
      title: 'ยืนยันการลบบทความ',
      message: 'คุณแน่ใจหรือไม่ที่จะลบบทความนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้',
      confirmText: 'ลบ',
      cancelText: 'ยกเลิก',
      onConfirm: async () => {
        const success = await deleteBlog(editingBlog.id);
        if (success) {
          // Handle draft image cleanup after deletion
          await handleCleanupDraftImages('cleanup');
          
          displaySuccessDialog({
            title: "สำเร็จ",
            message: "ลบบทความเรียบร้อยแล้ว",
            buttonText: "กลับไปจัดการบทความ",
            onButtonClick: () => router.push('/blog-management')
          });
          setTimeout(() => {
            router.push('/blog-management');
          }, 1000);
        }
      }
    });
  }, [editingBlog, displayConfirmDialog, deleteBlog, handleCleanupDraftImages, displaySuccessDialog, router]);

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
                  onImageUpload={handleImageUpload}
                  initialUploadedImages={uploadedImages}
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
          <div className={`flex ${isEditing ? 'justify-between' : 'justify-end'} items-center pt-6 border-t`}>
            {isEditing && editingBlog && (
              <Button
                type="button"
                onClick={handleDeleteBlog}
                className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                <span>ลบบทความ</span>
              </Button>
            )}
            {/* <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={!debouncedSlug}
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
              <span>ตรวจสอบบทความก่อนเผยแพร่</span>
            </Button> */}

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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        setIsOpen={setShowConfirmDialog}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmButtonText}
        cancelText={cancelButtonText}
        onConfirm={onConfirmButtonClick}
        onCancel={onCancelButtonClick}
      />
    </div>
  );
} 