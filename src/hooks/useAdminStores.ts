import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Report } from "@/types/report";
import { Tab } from "@/types/tabs";
import { Store } from "@/types/stores";
import { useReport } from "@/contexts/ReportContext";
import { useStore } from "@/contexts/StoreContext";

interface UseAdminStoresOptions {
  initialStores?: Store[];
}

export default function useAdminStores({ initialStores = [] }: UseAdminStoresOptions = {}) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [adminStores, setAdminStores] = useState<Store[]>(initialStores);
  const initialized = useRef<boolean>(initialStores.length > 0);

  // Use ReportContext for report management
  const {
    allReports,
    fetchAllReports,
    updateReportStatus: contextUpdateReportStatus,
    isLoading: reportsLoading,
    error: reportsError
  } = useReport();

  // Use StoreContext for store verification
  const { verifyStore, error: storeError } = useStore();

  // Enhanced fetch function with proper Bearer token authentication
  const fetchAdminStores = useCallback(async (): Promise<Store[]> => {
    if (!session?.user?.token) {
      console.warn('No authentication token available');
      return [];
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
        console.log('useAdminStores: Fetched admin stores:', data.data.length);
        setAdminStores(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch admin stores');
      }
    } catch (err) {
      console.error('Error fetching admin stores:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token]);

  // Enhanced update function with proper error handling
  // const updateStore = useCallback(async (storeId: number, updates: Partial<Store>): Promise<Store | null> => {
  //   if (!session?.user?.token) {
  //     console.error('No authentication token available for store update');
  //     return null;
  //   }

  //   try {
  //     setIsLoading(true);
      
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_URL || ''}/api/stores/${storeId.toString()}`,
  //       {
  //         method: 'PUT',
  //         headers: {
  //           'Authorization': `Bearer ${session.user.token}`,  
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(updates),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Error updating store: ${response.statusText}`);
  //     }

  //     const data = await response.json();
      
  //     if (data.statusCode === 200 && data.data) {
  //       // Update local state
  //       setAdminStores(prevStores => 
  //         prevStores.map(store => 
  //           store.id === storeId ? { ...store, ...data.data.storeDetail } : store
  //         )
  //       );
        
  //       return data.data.storeDetail;
  //     } else {
  //       throw new Error(data.message || 'Failed to update store');
  //     }
  //   } catch (err) {
  //     console.error('Error updating store:', err);
  //     return null;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [session?.user?.token]);

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
  }, [session?.user?.token]);



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
      count: adminStores.filter((s) => allReports.some((report) => report.storeId === s.id) && s.isBanned === false).length,
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
          return allReports.some((report) => report.storeId === store.id) && store.isBanned === false;
        case "verified":
          return store.isVerified !== null && store.isBanned === false;
        case "additional":
          return store.userId > 0 && store.isVerified === null && store.isBanned === false;
        case "banned":
          return store.isBanned === true;
        default:
          return true;
      }
    });
  }, [adminStores, activeTab, allReports]);

  // Get reports for a specific store
  const getStoreReports = useCallback((storeId: number): Report[] => {
    return allReports.filter((report) => report.storeId === storeId);
  }, [allReports]);



  // Handle report status updates using context
  const handleUpdateReportStatus = useCallback(async (reportId: string, newStatus: "valid" | "invalid"): Promise<{ success: boolean; message: string }> => {
    try {
      // Map "valid" to "reviewed" for the API
      const apiStatus = newStatus === "valid" ? "reviewed" : "invalid";
      const success = await contextUpdateReportStatus(reportId, apiStatus as "valid" | "invalid");
      if (success) {
        console.log(`Report ${reportId} status updated to ${newStatus}`);
        
        // Return success immediately for dialog display
        const response = { success: true, message: `อัปเดตสถานะรายงานสำเร็จ` };
        
        return response;
      } else {
        console.error(`Failed to update report ${reportId} status`);
        return { success: false, message: `ไม่สามารถอัปเดตสถานะรายงานได้ กรุณาลองใหม่อีกครั้ง` };
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      return { success: false, message: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }, [contextUpdateReportStatus]);

  const handleApproveStore = useCallback(async (storeId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await verifyStore(storeId, true, false);
      if (result) {
        // Return success immediately for dialog display
        const response = { success: true, message: "อนุมัติร้านค้าสำเร็จ" };
        
        return response;
      } else {
        // Get error from StoreContext if available
        const contextError = storeError || "ไม่สามารถอนุมัติร้านค้าได้ กรุณาลองใหม่อีกครั้ง";
        return { success: false, message: contextError };
      }
    } catch (error) {
      console.error("Error approving store:", error);
      return { success: false, message: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }, [verifyStore, storeError]);

  const handleRejectStore = useCallback(async (storeId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await verifyStore(storeId, false, false);
      if (result) {
        // Return success immediately for dialog display
        const response = { success: true, message: "ปฏิเสธร้านค้าสำเร็จ" };
        
        return response;
      } else {
        // Get error from StoreContext if available
        const contextError = storeError || "ไม่สามารถปฏิเสธร้านค้าได้ กรุณาลองใหม่อีกครั้ง";
        return { success: false, message: contextError };
      }
    } catch (error) {
      console.error("Error rejecting store:", error);
      return { success: false, message: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }, [verifyStore, storeError]);

  const handleBanStore = useCallback(async (storeId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await verifyStore(storeId, false, true);
      console.log("RESULT", result);
      if (result) {
        // Return success immediately for dialog display
        const response = { success: true, message: "แบนร้านค้าสำเร็จ" };
        
        return response;
      } else {
        // Get error from StoreContext if available
        const contextError = storeError || "ไม่สามารถแบนร้านค้าได้ กรุณาลองใหม่อีกครั้ง";
        return { success: false, message: contextError };
      }
    } catch (error) {
      console.error("Error banning store:", error);
      return { success: false, message: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }, [verifyStore, storeError]);

  const handleUnbanStore = useCallback(async (storeId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await verifyStore(storeId, true, false);
      if (result) {
        // Return success immediately for dialog display
        const response = { success: true, message: "ยกเลิกแบนร้านค้าสำเร็จ" };
        
        return response;
      } else {
        // Get error from StoreContext if available
        const contextError = storeError || "ไม่สามารถยกเลิกแบนร้านค้าได้ กรุณาลองใหม่อีกครั้ง";
        return { success: false, message: contextError };
      }
    } catch (error) {
      console.error("Error unbanning store:", error);
      return { success: false, message: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }, [verifyStore, storeError]);

  // Refresh function for manual data refresh
  const refreshStores = useCallback(async () => {
    console.log('useAdminStores: Manual refresh triggered');
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
    reportsError,
    storeError
  };
}; 