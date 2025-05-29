"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ReportFormSchema } from "@/validators/report.schema";
import { useRouter } from "next/navigation";
import { StoreReport, ReportReason } from "@/types/stores";
import { Report } from "@/types/report";

interface ReportContextProps {
  submitReport: (reportData: ReportFormSchema) => Promise<{ success: boolean; message: string; report?: Report }>;
  userReports: StoreReport[];
  allReports: Report[];
  isLoading: boolean;
  error: string | null;
  fetchUserReports: () => Promise<StoreReport[]>;
  fetchAllReports: () => Promise<Report[]>;
  updateReportStatus: (reportId: string, newStatus: "valid" | "invalid") => Promise<boolean>;
  clearReportError: () => void;
}

interface ReportProviderProps {
  children: ReactNode;
}

const ReportContext = createContext<ReportContextProps | undefined>(undefined);

export function ReportProvider({ children }: ReportProviderProps) {
  const [userReports, setUserReports] = useState<StoreReport[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  // Clear error state
  const clearReportError = useCallback(() => {
    setError(null);
  }, []);

  // Submit a new report
  const submitReport = useCallback(async (reportData: ReportFormSchema): Promise<{ success: boolean; message: string; report?: Report }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Create form data for file upload
      const formData = new FormData();
      formData.append('storeId', reportData.storeId.toString());
      formData.append('reason', reportData.reason);
      formData.append('evidence', reportData.evidence);

      // Set up headers based on authentication status
      const headers: Record<string, string> = {};
      if (session?.user?.token) {
        headers['Authorization'] = `Bearer ${session.user.token}`;
      }
      
      // Make API request
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL || ''}/api/report`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // If unauthorized and not already on login page, redirect to login
        if (response.status === 401 && !window.location.pathname.includes('/auth/signin')) {
          router.push('/auth/signin?callbackUrl=/report');
          return { 
            success: false, 
            message: "กรุณาเข้าสู่ระบบก่อนทำรายการ" 
          };
        }
        throw new Error(data.message || "เกิดข้อผิดพลาดในการส่งรายงาน");
      }

      // Check if the response contains the expected data
      if ((data.statusCode === 201 || data.statusCode === 200) && data.data) {
        // Add the new report to the user reports list
        const newReport: Report = data.data;
        
        // Convert Report to StoreReport for state update
        const storeReport: StoreReport = {
          id: newReport.id,
          storeId: Number(newReport.storeId),
          reason: 'other' as ReportReason, // Default to 'other' as ReportReason type
          details: newReport.reason,
          evidenceUrl: newReport.evidenceUrl,
          createdAt: newReport.createdAt,
          status: newReport.status === 'pending' ? 'pending' : 
                 newReport.status === 'reviewed' ? 'reviewed' : 'rejected'   
        };
        
        setUserReports(prev => [storeReport, ...prev]);
        
        // Also add to allReports if admin
        if (session?.user?.role === 'admin') {
          setAllReports(prev => [newReport, ...prev]);
        }
        
        return { 
          success: true, 
          message: "ส่งรายงานสำเร็จ", 
          report: newReport 
        };
      } else {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการส่งรายงาน");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, session?.user?.role, router]);

  // Fetch reports submitted by the current user
  const fetchUserReports = useCallback(async (): Promise<StoreReport[]> => {
    try {
      setIsLoading(true);
      setError(null);

      // If no session, we can't fetch user reports
      if (!session?.user?.token) {
        return [];
      }

      // Set up headers with authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (session.user.token) {
        headers['Authorization'] = `Bearer ${session.user.token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL || ''}/api/report`, {
        method: 'GET',
        headers,
      });

      // Handle unauthorized response
      if (response.status === 401) {
        if (!window.location.pathname.includes('/auth/signin')) {
          router.push('/auth/signin?callbackUrl=/user/reports');
        }
        return [];
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน");
      }

      if (data.statusCode === 200 && data.data) {
        setUserReports(data.data);
        return data.data;
      } else {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, router]);

  // Fetch all reports (admin only)
  const fetchAllReports = useCallback(async (): Promise<Report[]> => {
    try {
      setIsLoading(true);
      setError(null);

      // Only admins can fetch all reports
      if (!session?.user?.token || session.user.role !== 'admin') {
        console.warn('ReportContext: Only admins can fetch all reports', {
          hasToken: !!session?.user?.token,
          role: session?.user?.role
        });
        return [];
      }

      // Set up headers with authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL || ''}/api/report`, {
        method: 'GET',
        headers,
      });

      // Handle unauthorized response
      if (response.status === 401) {
        if (!window.location.pathname.includes('/auth/signin')) {
          router.push('/auth/signin?callbackUrl=/admin');
        }
        return [];
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน");
      }

      if (data.statusCode === 200 && data.data) {
        setAllReports(data.data);
        return data.data;
      } else {
        // If no reports found, return empty array
        setAllReports([]);
        return [];
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, session?.user?.role, router]);

  // Update report status (admin only)
  const updateReportStatus = useCallback(async (reportId: string, newStatus: "valid" | "invalid"): Promise<boolean> => {
    try {
      // Only admins can update report status
      if (!session?.user?.token || session.user.role !== 'admin') {
        // console.warn('Only admins can update report status');
        return false;
      }

      setIsLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL || ''}/api/report/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ status: newStatus, reviewedById: session.user.id }),
      });

      if (!response.ok) {
        throw new Error(`Error updating report status: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.statusCode === 200) {
        return true;
      } else {
        throw new Error(data.message || 'Failed to update report status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, session?.user?.role]);

  const value = {
    submitReport,
    userReports,
    allReports,
    isLoading,
    error,
    fetchUserReports,
    fetchAllReports,
    updateReportStatus,
    clearReportError,
  };

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function useReport() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
} 