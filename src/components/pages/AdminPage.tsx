"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { 
  StoreItem, 
  ReportsModal
} from "@/components/admin";
import UnderlineTab from "@/components/ui/underline-tab";
import { Store } from "@/types/stores";
import { Report } from "@/types/report";
import useAdminStores from "@/hooks/useAdminStores";
import StoreDetailDialog from "@/components/store/StoreDetailDialog";
import StorePagination from "@/components/stores/StorePagination";
import StoreFilter, { VerificationFilter } from "@/components/admin/StoreFilter";

interface SelectedReport {
  store: Store;
  reports: Report[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use our custom hook for store and tab management
  const {
    tabs,
    activeTab,
    setActiveTab,
    filteredStores,
    isLoading,
    getStoreReports,
    handleApproveStore,
    handleRejectStore,
    handleBanStore,
    handleUnbanStore,
    handleUpdateReportStatus
  } = useAdminStores();

  // UI state
  const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter state for verified stores
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');

  // Check authentication first
  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user?.role !== "admin")) {
      router.push("/login");
    }
  }, [session, status, router]);

  const handleViewReport = (store: Store) => {
    const storeReports = getStoreReports(store.id);
    setSelectedReport({ store, reports: storeReports });
    setIsReportModalOpen(true);
  };

  const handleUpdateModalReportStatus = (reportId: string, newStatus: "valid" | "invalid") => {
    handleUpdateReportStatus(reportId, newStatus);
    
    // Update selected report to reflect changes
    if (selectedReport) {
      setSelectedReport({
        ...selectedReport,
        reports: selectedReport.reports.map(r => 
          r.id === reportId ? {...r, status: newStatus} : r
        )
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

  // Apply filters and pagination to stores
  const displayedStores = useMemo(() => {
    let filteredResult = [...filteredStores];
    
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
  }, [filteredStores, activeTab, verificationFilter, currentPage, itemsPerPage]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    let count = filteredStores.length;
    
    // Apply verification filter if we're on the verified tab
    if (activeTab === 'verified') {
      if (verificationFilter === 'approved') {
        count = filteredStores.filter(store => store.isVerified === true).length;
      } else if (verificationFilter === 'rejected') {
        count = filteredStores.filter(store => store.isVerified === false).length;
      }
    }
    
    return Math.ceil(count / itemsPerPage);
  }, [filteredStores, activeTab, verificationFilter, itemsPerPage]);
  
  // Reset pagination when tab or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, verificationFilter]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              จัดการร้านค้า
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              จัดการสถานะและตรวจสอบร้านค้าทั้งหมด
            </p>
          </div>
        </div>

        <div className="mt-8">
          <UnderlineTab
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          <div className="mt-6">
            {/* Show filter buttons only for verified stores tab */}
            {activeTab === 'verified' && (
              <StoreFilter 
                activeFilter={verificationFilter}
                onFilterChange={setVerificationFilter}
              />
            )}
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {displayedStores.map((store) => (
                  <li key={store.id}>
                    <StoreItem
                      store={store}
                      activeTab={activeTab}
                      onViewStore={handleViewStore}
                      onViewReport={handleViewReport}
                      onApproveStore={handleApproveStore}
                      onRejectStore={handleRejectStore}
                      onBanStore={handleBanStore}
                      onUnbanStore={handleUnbanStore}
                    />
                  </li>
                ))}
                {displayedStores.length === 0 && (
                  <li className="px-4 py-8 text-center text-gray-500">
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

      {/* Reports Modal */}
      <ReportsModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReport}
        selectedReport={selectedReport}
        onUpdateReportStatus={handleUpdateModalReportStatus}
        onBanStore={handleBanStore}
      />
    </div>
  );
} 