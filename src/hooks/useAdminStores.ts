import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Report } from "@/types/report";
import { Tab } from "@/types/tabs";
import { Store } from "@/types/stores";
import { useReport } from "@/contexts/ReportContext";

interface UseAdminStoresOptions {
  initialStores?: Store[];
}

export default function useAdminStores({ initialStores = [] }: UseAdminStoresOptions = {}) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [adminStores, setAdminStores] = useState<Store[]>(initialStores);
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const initialized = useRef<boolean>(initialStores.length > 0);

  // Use ReportContext for report management
  const {
    allReports,
    fetchAllReports,
    updateReportStatus: contextUpdateReportStatus,
    isLoading: reportsLoading,
    error: reportsError
  } = useReport();

  // Enhanced fetch function with proper Bearer token authentication
  const fetchAdminStores = useCallback(async (): Promise<Store[]> => {
    if (!session?.user?.token) {
      console.warn('No authentication token available');
      return adminStores;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ''}/api/stores`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching admin stores: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        setAdminStores(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch admin stores');
      }
    } catch (err) {
      console.error('Error fetching admin stores:', err);
      return adminStores;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, adminStores]);

  // Enhanced update function with proper error handling
  const updateStore = useCallback(async (storeId: number, updates: Partial<Store>): Promise<Store | null> => {
    if (!session?.user?.token) {
      console.error('No authentication token available for store update');
      return null;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ''}/api/stores/${storeId.toString()}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.user.token}`,  
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating store: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.statusCode === 200 && data.data) {
        // Update local state
        setAdminStores(prevStores => 
          prevStores.map(store => 
            store.id === storeId ? { ...store, ...data.data.storeDetail } : store
          )
        );
        
        return data.data.storeDetail;
      } else {
        throw new Error(data.message || 'Failed to update store');
      }
    } catch (err) {
      console.error('Error updating store:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token]);

  // Initialize data if not already done
  useEffect(() => {
    const initializeData = async () => {
      if (!initialized.current && session?.user?.token) {
        console.log('useAdminStores: Initializing data...');
        try {
          await Promise.all([
            fetchAdminStores(),
            fetchAllReports()
          ]);
          console.log('useAdminStores: Data initialization complete');
          initialized.current = true;
        } catch (error) {
          console.error('useAdminStores: Error during initialization:', error);
        }
      }
    };

    initializeData();
  }, [session?.user?.token, fetchAdminStores, fetchAllReports]);

  // Force refresh when forceUpdate changes
  useEffect(() => {
    if (forceUpdate > 0) {
      Promise.all([
        fetchAdminStores(),
        fetchAllReports()
      ]);
    }
  }, [forceUpdate, fetchAdminStores, fetchAllReports]);

  // Calculate tabs with report counts
  const tabs: Tab[] = useMemo(() => [
    {
      id: "pending",
      name: "ร้านค้าที่รอการตรวจสอบ",
      count: adminStores.filter((s) => s.isVerified === null && !s.isBanned).length,
    },
    {
      id: "reported",
      name: "ร้านค้าที่ถูกรายงาน",
      count: allReports.length,
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
  ], [adminStores, allReports.length]);

  // Filter stores based on active tab and join with reports
  const filteredStores = useMemo(() => {
    return adminStores.filter((store) => {
      switch (activeTab) {
        case "pending":
          return store.isVerified === null && !store.isBanned;
        case "reported":
          // Show stores that have reports
          return allReports.some((report) => report.storeId === store.id);
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
  }, [adminStores, activeTab, allReports]);

  // Get reports for a specific store
  const getStoreReports = useCallback((storeId: number): Report[] => {
    return allReports.filter((report) => report.storeId === storeId.toString());
  }, [allReports]);

  // Handle report status updates using context
  const handleUpdateReportStatus = useCallback(async (reportId: string, newStatus: "valid" | "invalid") => {
    try {
      const success = await contextUpdateReportStatus(reportId, newStatus);
      if (success) {
        console.log(`Report ${reportId} status updated to ${newStatus}`);
      } else {
        console.error(`Failed to update report ${reportId} status`);
      }
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  }, [contextUpdateReportStatus]);

  const handleApproveStore = useCallback(async (storeId: number) => {
    try {
      await updateStore(storeId, {
        isVerified: true,
        updatedAt: new Date().toISOString(),
      });
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error("Error approving store:", error);
    }
  }, [updateStore]);

  const handleRejectStore = useCallback(async (storeId: number) => {
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
  }, [updateStore]);

  const handleBanStore = useCallback(async (storeId: number) => {
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
  }, [updateStore]);

  const handleUnbanStore = useCallback(async (storeId: number) => {
    try {
      await updateStore(storeId, {
        isBanned: false,
        updatedAt: new Date().toISOString(),
      });
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error("Error unbanning store:", error);
    }
  }, [updateStore]);

  // Refresh function for manual data refresh
  const refreshStores = useCallback(async () => {
    setForceUpdate(prev => prev + 1);
    const [stores] = await Promise.all([
      fetchAdminStores(),
      fetchAllReports()
    ]);
    return stores;
  }, [fetchAdminStores, fetchAllReports]);

  return {
    tabs,
    activeTab,
    setActiveTab,
    filteredStores,
    isLoading: isLoading || reportsLoading,
    getStoreReports,
    handleApproveStore,
    handleRejectStore,
    handleBanStore,
    handleUnbanStore,
    handleUpdateReportStatus,
    reports: allReports,
    refreshStores,
    adminStores,
    reportsError
  };
}; 