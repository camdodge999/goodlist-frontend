'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faMagnifyingGlass, 
  faArrowsRotate 
} from '@fortawesome/free-solid-svg-icons';
import { Blog, BlogSearchParams } from '@/types/blog';
import { useBlog } from '@/hooks/useBlog';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BlogManagementSkeleton from '@/components/blogs/BlogManagementSkeleton';
import BlogStatsCards from '@/components/blogs/BlogStatsCards';
import BlogTable from '@/components/blogs/BlogTable';
import useShowDialog from '@/hooks/useShowDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusDialog from '@/components/common/StatusDialog';

export default function BlogManagementClient() {
  const router = useRouter();
  const {
    blogs,
    loading,
    error,
    fetchBlogs,
    deleteBlog,
    canManageBlogs
  } = useBlog({ adminOnly: true });

  const {
    showConfirmDialog,
    setShowConfirmDialog,
    confirmTitle,
    confirmMessage,
    confirmButtonText,
    cancelButtonText,
    onConfirmButtonClick,
    onCancelButtonClick,
    displayConfirmDialog,
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

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInitialized, setIsInitialized] = useState(false);

  // Check authentication and redirect if not admin
  useEffect(() => {
    if (!loading && !canManageBlogs) {
      router.push('/login');
      return;
    }
  }, [loading, canManageBlogs, router]);

  // Fetch blogs on component mount and when filters change
  useEffect(() => {
    if (canManageBlogs && (!isInitialized || searchTerm)) {
      const params: BlogSearchParams = {};
      if (searchTerm) params.search = searchTerm;
      fetchBlogs(params);
      if (!isInitialized) setIsInitialized(true);
    }
  }, [canManageBlogs, searchTerm, isInitialized]); // Removed fetchBlogs from dependencies to prevent auto-refetch on window focus

  // Filter blogs based on status (client-side filtering for status)
  const filteredBlogs = blogs.filter(blog => {
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    return matchesStatus;
  });

  const handleCreateBlog = () => {
    router.push('/blog-management/new');
  };

  const handleEditBlog = (blog: Blog) => {
    router.push(`/blog-management/edit/${blog.id}`);
  };

  const handleDeleteBlog = async (blogId: string) => {
    displayConfirmDialog({
      title: 'ยืนยันการลบบทความ',
      message: 'คุณแน่ใจหรือไม่ที่จะลบบทความนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้',
      confirmText: 'ลบ',
      cancelText: 'ยกเลิก',
      onConfirm: async () => {
        const success = await deleteBlog(blogId);
        if (success) {
          // Show success dialog
          displaySuccessDialog({
            title: 'สำเร็จ',
            message: 'ลบบทความเรียบร้อยแล้ว',
            buttonText: 'ตกลง'
          });
          // Refresh the blogs list
          fetchBlogs({ search: searchTerm });
        } else {
          // Show error dialog
          displayErrorDialog({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถลบบทความได้ กรุณาลองใหม่อีกครั้ง',
            buttonText: 'ตกลง'
          });
        }
      }
    });
  };

  const handleRefresh = () => {
    fetchBlogs({ search: searchTerm });
  };

  // Show loading state
  if (loading) {
    return <BlogManagementSkeleton />;
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

  // Show API error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">เกิดข้อผิดพลาด</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => fetchBlogs({ search: searchTerm })}
              className="w-full flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowsRotate} className="h-4 w-4" />
              ลองใหม่
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">จัดการบทความ</h1>
          <p className="mt-2 text-gray-600">จัดการบทความ ร่าง และเนื้อหาที่เผยแพร่แล้ว</p>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faMagnifyingGlass} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" 
                  />
                  <Input
                    type="text"
                    placeholder="ค้นหาบทความ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="กรองตามสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                    <SelectItem value="draft">ร่าง</SelectItem>
                    <SelectItem value="published">เผยแพร่</SelectItem>
                    <SelectItem value="archived">จัดเก็บ</SelectItem>
                    <SelectItem value="deleted">ลบ</SelectItem>
                  </SelectContent>
                </Select>

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faArrowsRotate} className="h-4 w-4" />
                  รีเฟรช
                </Button>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateBlog}
                className="flex items-center gap-2"
                variant="primary"
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                <span>เขียนบทความ</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <BlogStatsCards blogs={blogs} />

        {/* Blogs Table */}
        <BlogTable 
          blogs={filteredBlogs}
          onEdit={handleEditBlog}
          onDelete={handleDeleteBlog}
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

        {/* Success Dialog */}
        <StatusDialog
          isOpen={showSuccessDialog}
          setIsOpen={setShowSuccessDialog}
          type="success"
          message={successMessage}
          title={successTitle}
          buttonText={successButtonText}
          onButtonClick={handleSuccessClose}
        />

        {/* Error Dialog */}
        <StatusDialog
          isOpen={showErrorDialog}
          setIsOpen={setShowErrorDialog}
          type="error"
          message={errorMessage}
          title={errorTitle}
          buttonText={errorButtonText}
          onButtonClick={handleErrorClose}
        />
      </div>
    </div>
  );
} 