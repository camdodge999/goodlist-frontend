import { StoreAudit } from "@/types/stores";

// Mock data - would be replaced with actual API calls
const mockStoreAudits: StoreAudit[] = [
  {
    id: 1,
    storeId: 1,
    action: "created",
    details: "Store created by user",
    createdAt: "2023-02-15T08:30:00Z",
  },
  {
    id: 2,
    storeId: 1,
    action: "verified",
    details: "Store verified by admin",
    adminId: 2,
    createdAt: "2023-02-17T10:45:00Z",
  },
  // Add more mock audits as needed
];

/**
 * Get all store audits
 * 
 * @returns Promise that resolves to array of store audits
 */
export async function getAllStoreAudits(): Promise<StoreAudit[]> {
  // In production this would be an API call
  return Promise.resolve(mockStoreAudits);
}

/**
 * Get store audits by store ID
 * 
 * @param storeId - Store ID
 * @returns Promise that resolves to array of store audits
 */
export async function getStoreAudits(storeId: number): Promise<StoreAudit[]> {
  // In production this would be an API call
  return Promise.resolve(mockStoreAudits.filter(audit => audit.storeId === storeId));
}

/**
 * Create a store audit
 * 
 * @param auditData - Audit data
 * @returns Promise that resolves to created audit
 */
export async function createStoreAudit(auditData: Omit<StoreAudit, 'id' | 'createdAt'>): Promise<StoreAudit> {
  // In production this would be an API call
  const newAudit: StoreAudit = {
    ...auditData,
    id: Math.max(...mockStoreAudits.map(a => a.id)) + 1,
    createdAt: new Date().toISOString(),
  };
  
  mockStoreAudits.push(newAudit);
  return Promise.resolve(newAudit);
} 