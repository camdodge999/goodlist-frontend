import { useState, useEffect, useRef, useMemo } from "react";
import { Report } from "@/types/report";
import { Tab } from "@/types/tabs";
import { useStore } from "@/contexts/StoreContext";

export default function useAdminStores() {
  const { updateStore, isLoading: storesLoading, adminStores, fetchAdminStores } = useStore();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const initialized = useRef<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch if not already initialized or if forceUpdate has changed
        if (!initialized.current || forceUpdate > 0) {
          await fetchAdminStores();
          // Fetch reports - in a real app, this would be from an API
          setReports([]);
          setIsLoading(false);
          initialized.current = true;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
    // This effect should only run when forceUpdate changes or when the component mounts
  }, [forceUpdate, fetchAdminStores]);

  const tabs: Tab[] = useMemo(() => [
    {
      id: "pending",
      name: "ร้านค้าที่รอการตรวจสอบ",
      count: adminStores.filter((s) => s.isVerified === null && !s.isBanned).length,
    },
    {
      id: "reported",
      name: "ร้านค้าที่ถูกรายงาน",
      count: reports.length,
    },
    {
      id: "verified",
      name: "ร้านค้าที่ตรวจสอบแล้ว",
      count: adminStores.filter((s) => s.isVerified !== null && s.isBanned === false).length,
    },
    {
      id: "additional",
      name: "คำขอเพิ่มร้านค้า",
      count: adminStores.filter(
        (s) => s.userId > 0 && s.isVerified === null && s.isBanned === false
      ).length,
    },
    {
      id: "banned",
      name: "ร้านค้าที่ถูกแบน",
      count: adminStores.filter((s) => s.isBanned === true).length,
    },
  ], [adminStores, reports.length]);

  const filteredStores = adminStores.filter((store) => {
    switch (activeTab) {
      case "pending":
        return store.isVerified === null && !store.isBanned;
      case "reported":
        return reports.some((report) => report.storeId === store.id.toString());
      case "verified":
        return store.isVerified !== null && !store.isBanned;
      case "additional":
        return store.userId > 0 && store.isVerified === null && !store.isBanned;
      case "banned":
        return store.isBanned === true;
      default:
        return true;
    }
  });

  const getStoreReports = (storeId: number): Report[] => {
    return reports.filter((report) => report.storeId === storeId.toString());
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

  const handleUpdateReportStatus = (reportId: string, newStatus: "valid" | "invalid") => {
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      // In a real app, this would be an API call
      setReports(prevReports => 
        prevReports.map(r => r.id === reportId ? {...r, status: newStatus} : r)
      );
    }
  };

  return {
    tabs,
    activeTab,
    setActiveTab,
    filteredStores,
    isLoading: isLoading || storesLoading,
    getStoreReports,
    handleApproveStore,
    handleRejectStore,
    handleBanStore,
    handleUnbanStore,
    handleUpdateReportStatus,
    reports,
    setReports
  };
}; 