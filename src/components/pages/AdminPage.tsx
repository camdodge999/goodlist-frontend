"use client";

import { useState, useEffect, useMemo } from "react";

import {
  StoreItem,
  ReportsModal
} from "@/components/admin";
import UnderlineTab from "@/components/ui/underline-tab";
import { Store } from "@/types/stores";
import { Report } from "@/types/report";
import useAdminStores from "@/hooks/useAdminStores";
import StoreDetailDialog from "@/components/store/StoreDetailDialog";
import ReportDetailDialog from "@/components/store/ReportDetailDialog";
import StorePagination from "@/components/stores/StorePagination";
import StoreFilter, { VerificationFilter } from "@/components/admin/StoreFilter";
import { useReport } from "@/contexts/ReportContext";
import useShowDialog from "@/hooks/useShowDialog";
import StatusDialog from "@/components/common/StatusDialog";
import { Button } from "@/components/ui/button";

interface SelectedReport {
  store: Store;
  reports: Report[];
}

interface AdminPageProps {
  initialStores?: Store[];
}

export default function AdminPage({ initialStores = [] }: AdminPageProps) {
  // Use ReportContext directly to ensure reports are fetched
  const {
    fetchAllReports,
    isLoading: reportsLoading,
    error: reportsError
  } = useReport();

  // Dialog hooks for success/error messages
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

  // Use our custom hook for store and tab management
  const {
    tabs,
    activeTab,
    setActiveTab,
    filteredStores,
    isLoading,
    handleApproveStore,
    handleRejectStore,
    handleBanStore,
    handleUnbanStore,
    handleUpdateReportStatus,
    reports,
    refreshStores
  } = useAdminStores({ initialStores });

  // UI state
  const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedSingleReport, setSelectedSingleReport] = useState<Report | null>(null);
  const [isReportDetailModalOpen, setIsReportDetailModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter state for verified stores
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Explicitly fetch reports when AdminPage mounts
  useEffect(() => {
    const initializeReports = async () => {
      try {
        await fetchAllReports();
      } catch (error) {
        console.error('AdminPage: Error fetching reports:', error);
      }
    };

    initializeReports();
  }, [fetchAllReports]);


  const handleViewSingleReport = (report: Report) => {
    setSelectedSingleReport(report);
    setIsReportDetailModalOpen(true);
  };

  const handleUpdateModalReportStatus = async (reportId: string, newStatus: "valid" | "invalid") => {
    const result = await handleUpdateReportStatus(reportId, newStatus);

    // Show success or error dialog
    if (result.success) {
      displaySuccessDialog(result.message);
    } else {
      displayErrorDialog(result.message);
    }

    // Map status for UI consistency
    const mappedStatus = newStatus === "valid" ? "reviewed" : "invalid";

    // Update selected report to reflect changes
    if (selectedReport) {
      setSelectedReport({
        ...selectedReport,
        reports: selectedReport.reports.map(r =>
          r.id === reportId ? { ...r, status: mappedStatus as "pending" | "invalid" | "rejected" | "reviewed" } : r
        )
      });
    }

    // Update single report if it's currently selected
    if (selectedSingleReport && selectedSingleReport.id === reportId) {
      setSelectedSingleReport({
        ...selectedSingleReport,
        status: mappedStatus as "pending" | "invalid" | "rejected" | "reviewed"
      });
    }
  };

  const handleCloseReport = () => {
    setSelectedReport(null);
    setIsReportModalOpen(false);
  };

  const handleViewStore = (store: Store) => {
    setSelectedStore(store);
    setIsStoreModalOpen(true);
  };

  const handleCloseStoreModal = () => {
    setSelectedStore(null);
    setIsStoreModalOpen(false);
  };

  const handleCloseReportDetailModal = () => {
    setSelectedSingleReport(null);
    setIsReportDetailModalOpen(false);
  };

  // Enhanced dialog close handlers that refresh data on success
  const handleSuccessCloseWithRefresh = async () => {
    handleSuccessClose();
    // Refresh data after successful operations
    await Promise.all([
      refreshStores(),
      fetchAllReports()
    ]);
  };

  // Async handlers for store actions with dialog feedback
  const handleApproveStoreWithDialog = async (storeId: number) => {
    const result = await handleApproveStore(storeId);
    if (result.success) {
      displaySuccessDialog(result.message);
    } else {
      displayErrorDialog(result.message);
    }
  };

  const handleRejectStoreWithDialog = async (storeId: number) => {
    const result = await handleRejectStore(storeId);
    if (result.success) {
      displaySuccessDialog(result.message);
    } else {
      displayErrorDialog(result.message);
    }
  };

  const handleBanStoreWithDialog = async (storeId: number) => {
    const result = await handleBanStore(storeId);
    if (result.success) {
      displaySuccessDialog(result.message);
    } else {
      displayErrorDialog(result.message);
    }
  };

  const handleUnbanStoreWithDialog = async (storeId: number) => {
    const result = await handleUnbanStore(storeId);
    if (result.success) {
      displaySuccessDialog(result.message);
    } else {
      displayErrorDialog(result.message);
    }
  };

  // Apply filters and pagination to stores
  const displayedStores = useMemo(() => {
    let filteredResult = [...filteredStores];

    // Apply search filter
    if (searchQuery.trim()) {
      filteredResult = filteredResult.filter(store =>
        store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply verification filter if we're on the verified tab
    if (activeTab === 'verified') {
      if (verificationFilter === 'approved') {
        filteredResult = filteredResult.filter(store => store.isVerified === true);
      } else if (verificationFilter === 'rejected') {
        filteredResult = filteredResult.filter(store => store.isVerified === false);
      }
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filteredResult.slice(startIndex, endIndex);
  }, [filteredStores, activeTab, verificationFilter, searchQuery, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    let filteredResult = [...filteredStores];

    // Apply search filter
    if (searchQuery.trim()) {
      filteredResult = filteredResult.filter(store =>
        store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply verification filter if we're on the verified tab
    if (activeTab === 'verified') {
      if (verificationFilter === 'approved') {
        filteredResult = filteredResult.filter(store => store.isVerified === true);
      } else if (verificationFilter === 'rejected') {
        filteredResult = filteredResult.filter(store => store.isVerified === false);
      }
    }

    return Math.ceil(filteredResult.length / itemsPerPage);
  }, [filteredStores, activeTab, verificationFilter, searchQuery, itemsPerPage]);

  // Reset pagination when tab, filter, or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, verificationFilter, searchQuery]);

  if (isLoading || reportsLoading) {
    return (
      <div className="py-8">
        <div className="admin-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="admin-header sm:flex sm:items-center">
            <div className="admin-header-content sm:flex-auto">
              <h1 className="admin-title text-2xl font-semibold text-gray-900">
                จัดการร้านค้า
              </h1>
              <p className="admin-description mt-2 text-sm text-gray-700">
                จัดการสถานะและตรวจสอบร้านค้าทั้งหมด
              </p>
              {reportsError && (
                <div className="mt-2 text-sm text-red-600">
                  เกิดข้อผิดพลาดในการโหลดรายงาน: {reportsError}
                </div>
              )}
            </div>
            <div className="admin-header-actions mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Button
                variant="primary"
                onClick={async () => {
                  await refreshStores();
                }}
              >
                <span>รีเฟรชข้อมูล</span>
              </Button>
            </div>
          </div>
          <div className="admin-page-loading flex justify-center items-center min-h-[calc(100vh-210px)]">
            <div className="loading-spinner animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <div className="ml-4 text-gray-600">
              กำลังโหลดข้อมูลร้านค้า
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if reports failed to load
  if (reportsError) {
    console.error('AdminPage: Reports error:', reportsError);
  }

  return (
    <>
      {/* Global Status Dialogs - Always available */}
      <StatusDialog
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        type="success"
        message={successMessage}
        title={successTitle}
        buttonText={successButtonText}
        onButtonClick={handleSuccessCloseWithRefresh}
      />

      <StatusDialog
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        type="error"
        message={errorMessage}
        title={errorTitle}
        buttonText={errorButtonText}
        onButtonClick={handleErrorClose}
      />

      <div className="admin-page py-8">
        <div className="admin-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="admin-header sm:flex sm:items-center">
            <div className="admin-header-content sm:flex-auto">
              <h1 className="admin-title text-2xl font-semibold text-gray-900">
                จัดการร้านค้า
              </h1>
              <p className="admin-description mt-2 text-sm text-gray-700">
                จัดการสถานะและตรวจสอบร้านค้าทั้งหมด
              </p>
              {reportsError && (
                <div className="mt-2 text-sm text-red-600">
                  เกิดข้อผิดพลาดในการโหลดรายงาน: {reportsError}
                </div>
              )}
            </div>
            <div className="admin-header-actions mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Button
                variant="primary"
                onClick={async () => {
                  await refreshStores();
                }}
              >
                รีเฟรชข้อมูล
              </Button>
            </div>
          </div>

          <div className="admin-content mt-8">
            <UnderlineTab
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="admin-main-content mt-6">
              {/* Show filter buttons only for verified stores tab */}
              <StoreFilter
                stores={filteredStores}
                activeTab={activeTab}
                activeFilter={verificationFilter}
                onFilterChange={setVerificationFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <div className="admin-stores-list bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="stores-list divide-y divide-gray-200">
                  {displayedStores.map((store) => (
                    <li key={store.id} className="store-item">
                      <StoreItem
                        store={store}
                        activeTab={activeTab}
                        reports={reports}
                        onViewStore={handleViewStore}
                        onViewReport={handleViewSingleReport}
                        onApproveStore={handleApproveStoreWithDialog}
                        onRejectStore={handleRejectStoreWithDialog}
                        onBanStore={handleBanStoreWithDialog}
                        onUnbanStore={handleUnbanStoreWithDialog}
                        onUpdateReportStatus={handleUpdateModalReportStatus}
                      />
                    </li>
                  ))}
                  {displayedStores.length === 0 && (
                    <li className="empty-state px-4 py-8 text-center text-gray-500">
                      ไม่พบร้านค้าในหมวดหมู่นี้
                    </li>
                  )}
                </ul>
              </div>

              {/* Pagination */}
              <StorePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>

        {/* Store Details Modal */}
        <div className="admin-store-modal">
          <StoreDetailDialog
            isOpen={isStoreModalOpen}
            onClose={handleCloseStoreModal}
            store={selectedStore}
            onApprove={handleApproveStoreWithDialog}
            onReject={handleRejectStoreWithDialog}
            onBan={handleBanStoreWithDialog}
            onUnban={handleUnbanStoreWithDialog}
            hideAdminActions={false}
          />
        </div>

        {/* Reports Modal */}
        <div className="admin-reports-modal">
          <ReportsModal
            isOpen={isReportModalOpen}
            onClose={handleCloseReport}
            selectedReport={selectedReport}
            onUpdateReportStatus={handleUpdateModalReportStatus}
            onBanStore={handleBanStoreWithDialog}
          />
        </div>

        {/* Report Detail Modal */}
        <div className="admin-report-detail-modal">
          <ReportDetailDialog
            isOpen={isReportDetailModalOpen}
            onClose={handleCloseReportDetailModal}
            report={selectedSingleReport}
            onUpdateStatus={handleUpdateModalReportStatus}
            onBanStore={(storeId) => handleBanStoreWithDialog(parseInt(storeId))}
            hideAdminActions={false}
          />
        </div>
      </div>
    </>
  );
} 