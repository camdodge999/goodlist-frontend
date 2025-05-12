"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { mockStores, mockAdminUser, mockReports } from "@/data/mockData";
import { updateMockData } from "@/utils/mockDataUtils";
import { 
  StoreItem, 
  StoreDetailsModal, 
  ReportsModal, 
  type Store,
  type Report
} from "@/components/admin";
import UnderlineTab from "@/components/ui/underline-tab";
import { Tab } from "@/types/tabs";
// Define types
type User = {
  id: number;
  name: string;
  role: string;
};

interface SelectedReport {
  store: Store;
  reports: Report[];
}

export default function AdminPage() {
  const { user } = useAuth() as { user: User | null };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  const tabs: Tab[] = [
    {
      id: "pending",
      name: "ร้านค้าที่รอการตรวจสอบ",
      count: mockStores.filter((s) => !s.is_verified && !s.is_banned).length,
    },
    {
      id: "reported",
      name: "ร้านค้าที่ถูกรายงาน",
      count: mockReports.length,
    },
    {
      id: "verified",
      name: "ร้านค้าที่ตรวจสอบแล้ว",
      count: mockStores.filter((s) => s.is_verified && !s.is_banned).length,
    },
    {
      id: "additional",
      name: "คำขอเพิ่มร้านค้า",
      count: mockStores.filter(
        (s) => s.is_additional_store && !s.is_verified && !s.is_banned
      ).length,
    },
    {
      id: "banned",
      name: "ร้านค้าที่ถูกแบน",
      count: mockStores.filter((s) => s.is_banned).length,
    },
  ];

  const filteredStores = mockStores.filter((store) => {
    switch (activeTab) {
      case "pending":
        return !store.is_verified && !store.is_banned;
      case "reported":
        return mockReports.some((report) => report.store_id === store.id);
      case "verified":
        return store.is_verified && !store.is_banned;
      case "additional":
        return (
          store.is_additional_store && !store.is_verified && !store.is_banned
        );
      case "banned":
        return store.is_banned;
      default:
        return true;
    }
  });

  const getStoreReports = (storeId: string): Report[] => {
    return mockReports.filter((report) => report.store_id === storeId);
  };

  const handleViewReport = (store: Store) => {
    const reports = getStoreReports(store.id);
    setSelectedReport({ store, reports });
    setIsReportModalOpen(true);
  };

  const handleUpdateReportStatus = (reportId: string, newStatus: "valid" | "invalid") => {
    const report = mockReports.find((r) => r.id === reportId);
    if (report) {
      report.status = newStatus;
      // Force a re-render
      setSelectedReport({ ...selectedReport! });
    }
  };

  const handleCloseReport = () => {
    setSelectedReport(null);
    setIsReportModalOpen(false);
  };

  const handleApproveStore = (storeId: string) => {
    updateMockData.updateStore(storeId, {
      is_verified: true,
      updated_at: new Date().toISOString(),
    });
    setForceUpdate((prev) => prev + 1);
  };

  const handleRejectStore = (storeId: string) => {
    updateMockData.deleteStore(storeId);
    setForceUpdate((prev) => prev + 1);
  };

  const handleBanStore = (storeId: string) => {
    updateMockData.updateStore(storeId, {
      is_banned: true,
      is_verified: false,
      updated_at: new Date().toISOString(),
    });
    setForceUpdate((prev) => prev + 1);
  };

  const handleUnbanStore = (storeId: string) => {
    updateMockData.updateStore(storeId, {
      is_banned: false,
      updated_at: new Date().toISOString(),
    });
    setForceUpdate((prev) => prev + 1);
  };

  const handleViewStore = (store: Store) => {
    setSelectedStore(store);
    setIsStoreModalOpen(true);
  };

  const handleCloseStoreModal = () => {
    setSelectedStore(null);
    setIsStoreModalOpen(false);
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    setIsLoading(false);
  }, [user, router]);

  if (isLoading) {
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
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {filteredStores.map((store) => (
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
                {filteredStores.length === 0 && (
                  <li className="px-4 py-8 text-center text-gray-500">
                    ไม่พบร้านค้าในหมวดหมู่นี้
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Store Details Modal */}
      <StoreDetailsModal
        isOpen={isStoreModalOpen}
        onClose={handleCloseStoreModal}
        store={selectedStore}
        onApprove={handleApproveStore}
        onReject={handleRejectStore}
        onBan={handleBanStore}
        onUnban={handleUnbanStore}
      />

      {/* Reports Modal */}
      <ReportsModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReport}
        selectedReport={selectedReport}
        onUpdateReportStatus={handleUpdateReportStatus}
        onBanStore={handleBanStore}
      />
    </div>
  );
} 