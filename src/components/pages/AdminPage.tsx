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
    allReports, 
    fetchAllReports, 
    isLoading: reportsLoading,
    error: reportsError 
  } = useReport();

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
    reports
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
        console.log('AdminPage: Fetching reports...');
        await fetchAllReports();
        console.log('AdminPage: Reports fetched successfully', allReports.length);
      } catch (error) {
        console.error('AdminPage: Error fetching reports:', error);
      }
    };

    initializeReports();
  }, [fetchAllReports]);

  // Debug effect to log reports changes
  useEffect(() => {
    console.log('AdminPage: Reports updated:', {
      allReportsCount: allReports.length,
      reportsFromHook: reports.length,
      reportsLoading,
      reportsError
    });
  }, [allReports, reports, reportsLoading, reportsError]);

  const handleViewSingleReport = (report: Report) => {
    setSelectedSingleReport(report);
    setIsReportDetailModalOpen(true);
  };

  const handleUpdateModalReportStatus = async (reportId: string, newStatus: "valid" | "invalid") => {
    await handleUpdateReportStatus(reportId, newStatus);
    
    // Update selected report to reflect changes
    if (selectedReport) {
      setSelectedReport({
        ...selectedReport,
        reports: selectedReport.reports.map(r => 
          r.id === reportId ? {...r, status: newStatus} : r
        )
      });
    }

    // Update single report if it's currently selected
    if (selectedSingleReport && selectedSingleReport.id === reportId) {
      setSelectedSingleReport({
        ...selectedSingleReport,
        status: newStatus
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
      <div className="admin-page-loading flex justify-center items-center h-screen">
        <div className="loading-spinner animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-gray-600">
          {isLoading && "กำลังโหลดข้อมูลร้านค้า..."}
          {reportsLoading && "กำลังโหลดข้อมูลรายงาน..."}
        </div>
      </div>
    );
  }

  // Show error if reports failed to load
  if (reportsError) {
    console.error('AdminPage: Reports error:', reportsError);
  }

  return (
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
            <button
              type="button"
              onClick={async () => {
                console.log('Manual refresh triggered');
                await fetchAllReports();
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              รีเฟรชรายงาน ({allReports.length})
            </button>
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
            {activeTab === 'verified' && (
              <StoreFilter 
                stores={filteredStores}
                activeFilter={verificationFilter}
                onFilterChange={setVerificationFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}
            
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
                      onApproveStore={handleApproveStore}
                      onRejectStore={handleRejectStore}
                      onBanStore={handleBanStore}
                      onUnbanStore={handleUnbanStore}
                      onUpdateReportStatus={handleUpdateReportStatus}
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
          onApprove={handleApproveStore}
          onReject={handleRejectStore}
          onBan={handleBanStore}
          onUnban={handleUnbanStore}
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
          onBanStore={handleBanStore}
        />
      </div>

      {/* Report Detail Modal */}
      <div className="admin-report-detail-modal">
        <ReportDetailDialog
          isOpen={isReportDetailModalOpen}
          onClose={handleCloseReportDetailModal}
          report={selectedSingleReport}
          onUpdateStatus={handleUpdateModalReportStatus}
          onBanStore={(storeId) => handleBanStore(parseInt(storeId))}
          hideAdminActions={false}
        />
      </div>
    </div>
  );
} 