export interface ContactInfo {
  line?: string;
  facebook?: string;
  phone?: string;
  address?: string;
};

export interface Store {
  id: number;
  userId: number;
  email: string;
  storeName: string;
  bankAccount: string;
  contactInfo: ContactInfo | string;
  description: string;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  imageStore: string;
} 

// Define types
export type StoreRequest = {
  id: string;
  storeName: string;
  contactInfo: ContactInfo;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  documentUrls: string;
};

// Store audit types
export interface StoreAudit {
  id: number;
  storeId: number;
  action: 'created' | 'verified' | 'banned' | 'unbanned' | 'updated';
  details: string;
  adminId?: number;
  createdAt: string;
}

// User type
export interface User {
  id: number;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Report types
export type ReportReason = 'scam' | 'fake' | 'inappropriate' | 'other';

export interface StoreReport {
  id: string;
  storeId: number;
  reason: ReportReason;
  details: string;
  evidenceUrl: string;
  evidenceFilename: string;
  createdAt: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
}

// Auth type
export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}