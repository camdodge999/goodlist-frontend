import { StoreReport, ReportReason } from "@/types/stores";

// Mock data - would be replaced with actual API calls
const mockReports: StoreReport[] = [
  {
    id: "r1",
    storeId: 1,
    reason: "inappropriate",
    details: "This store has inappropriate content",
    evidenceUrl: "/uploads/report-evidence-1.jpg",
    evidenceFilename: "report_1_1234567890.jpg",
    createdAt: "2023-03-10T14:20:00Z",
    status: "resolved",
  },
  // Add more mock reports as needed
];

/**
 * Get all reports
 * 
 * @returns Promise that resolves to array of reports
 */
export async function getReports(): Promise<StoreReport[]> {
  // In production this would be an API call
  return Promise.resolve(mockReports);
}

/**
 * Get reports by store ID
 * 
 * @param storeId - Store ID
 * @returns Promise that resolves to array of reports
 */
export async function getReportsByStoreId(storeId: number): Promise<StoreReport[]> {
  // In production this would be an API call
  return Promise.resolve(mockReports.filter(report => report.storeId === storeId));
}

/**
 * Create a report
 * 
 * @param reportData - Report data without id and createdAt
 * @param evidenceFile - Evidence file to upload
 * @returns Promise that resolves to created report
 */
export async function createReport(
  reportData: {
    storeId: number;
    reason: ReportReason;
    details: string;
    evidenceFilename: string;
  },
  evidenceFile: File
): Promise<StoreReport> {
  // In production, this would upload the file to a server or cloud storage
  // and create the report record

  // For mock, we'll create a temporary URL and a new report
  const evidenceUrl = URL.createObjectURL(evidenceFile);
  
  const newReport: StoreReport = {
    id: `r${mockReports.length + 1}`,
    storeId: reportData.storeId,
    reason: reportData.reason,
    details: reportData.details,
    evidenceUrl,
    evidenceFilename: reportData.evidenceFilename,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  
  mockReports.push(newReport);
  return Promise.resolve(newReport);
}

/**
 * Update a report status
 * 
 * @param reportId - Report ID
 * @param status - New status
 * @returns Promise that resolves to updated report
 */
export async function updateReportStatus(
  reportId: string,
  status: "pending" | "reviewing" | "resolved" | "dismissed"
): Promise<StoreReport | null> {
  // In production this would be an API call
  const reportIndex = mockReports.findIndex(r => r.id === reportId);
  
  if (reportIndex === -1) {
    return Promise.resolve(null);
  }
  
  mockReports[reportIndex] = {
    ...mockReports[reportIndex],
    status,
  };
  
  return Promise.resolve(mockReports[reportIndex]);
} 