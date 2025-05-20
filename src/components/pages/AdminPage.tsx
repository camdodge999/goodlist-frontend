"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useStore } from "@/contexts/StoreContext";
import { 
  StoreItem, 
  StoreDetailsModal, 
  ReportsModal
} from "@/components/admin";
import UnderlineTab from "@/components/ui/underline-tab";
import { Tab } from "@/types/tabs";
import { Store } from "@/types/stores";
import { Report } from "@/types/report";
import { useSession } from "next-auth/react";

interface SelectedReport {
  store: Store;
  reports: Report[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { stores, fetchStores, updateStore, isLoading: storesLoading } = useStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  // Add initialization ref to prevent repeated fetches
  const initialized = useRef(false);

  // Check authentication first
  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user?.role !== "admin")) {
      router.push("/login");
    }
  }, [session, status, router]);

  // Separate useEffect for data fetching to avoid infinite loops
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (status === "authenticated" && session?.user?.role === "admin") {
          // Only fetch if not already initialized or if forceUpdate has changed
          if (!initialized.current || forceUpdate > 0) {
            await fetchStores(true);
            // Fetch reports - in a real app, this would be from an API
            setReports([]);
            setIsLoading(false);
            initialized.current = true;
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
    // This effect should only run when forceUpdate changes or when the component mounts
  }, [forceUpdate, session, status, fetchStores]);

  const tabs: Tab[] = [
    {
      id: "pending",
      name: "ร้านค้าที่รอการตรวจสอบ",
      count: stores.filter((s) => s.isVerified === null && !s.isBanned).length,
    },
    {
      id: "reported",
      name: "ร้านค้าที่ถูกรายงาน",
      count: reports.length,
    },
    {
      id: "verified",
      name: "ร้านค้าที่ตรวจสอบแล้ว",
      count: stores.filter((s) => s.isVerified === true && !s.isBanned).length,
    },
    {
      id: "additional",
      name: "คำขอเพิ่มร้านค้า",
      // This would need a way to identify additional stores
      // For now, we'll use a placeholder logic
      count: stores.filter(
        (s) => s.userId > 0 && s.isVerified === null && !s.isBanned
      ).length,
    },
    {
      id: "banned",
      name: "ร้านค้าที่ถูกแบน",
      count: stores.filter((s) => s.isBanned).length,
    },
  ];

  const filteredStores = stores.filter((store) => {
    switch (activeTab) {
      case "pending":
        return store.isVerified === null && !store.isBanned;
      case "reported":
        return reports.some((report) => report.storeId === store.id.toString());
      case "verified":
        return store.isVerified === true && !store.isBanned;
      case "additional":
        // This would need a way to identify additional stores
        // For now, we'll use a placeholder logic
        return store.userId > 0 && store.isVerified === null && !store.isBanned;
      case "banned":
        return store.isBanned;
      default:
        return true;
    }
  });

  const getStoreReports = (storeId: number): Report[] => {
    return reports.filter((report) => report.storeId === storeId.toString());
  };

  const handleViewReport = (store: Store) => {
    const storeReports = getStoreReports(store.id);
    setSelectedReport({ store, reports: storeReports });
    setIsReportModalOpen(true);
  };

  const handleUpdateReportStatus = (reportId: string, newStatus: "valid" | "invalid") => {
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      // In a real app, this would be an API call
      setReports(prevReports => 
        prevReports.map(r => r.id === reportId ? {...r, status: newStatus} : r)
      );
      
      // Update selected report to reflect changes
      if (selectedReport) {
        setSelectedReport({
          ...selectedReport,
          reports: selectedReport.reports.map(r => 
            r.id === reportId ? {...r, status: newStatus} : r
          )
        });
      }
    }
  };

  const handleCloseReport = () => {
    setSelectedReport(null);
    setIsReportModalOpen(false);
  };

  const handleApproveStore = async (storeId: number) => {
    try {
      await updateStore(storeId, {
        isVerified: true,
        updatedAt: new Date().toISOString(),
      });
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error("Error approving store:", error);
    }
  };

  const handleRejectStore = async (storeId: number) => {
    try {
      // In a real app, you might want to set isVerified to false instead of deleting
      await updateStore(storeId, {
        isVerified: false,
        updatedAt: new Date().toISOString(),
        rejectionReason: "ไม่ผ่านการตรวจสอบ"
      });
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error("Error rejecting store:", error);
    }
  };

  const handleBanStore = async (storeId: number) => {
    try {
      await updateStore(storeId, {
        isBanned: true,
        isVerified: false,
        updatedAt: new Date().toISOString(),
      });
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error("Error banning store:", error);
    }
  };

  const handleUnbanStore = async (storeId: number) => {
    try {
      await updateStore(storeId, {
        isBanned: false,
        updatedAt: new Date().toISOString(),
      });
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error("Error unbanning store:", error);
    }
  };

  const handleViewStore = (store: Store) => {
    setSelectedStore(store);
    setIsStoreModalOpen(true);
  };

  const handleCloseStoreModal = () => {
    setSelectedStore(null);
    setIsStoreModalOpen(false);
  };

  if (status === "loading" || isLoading || storesLoading) {
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