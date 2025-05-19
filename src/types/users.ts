export interface User {
  id: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  role?: string;
  displayName?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  verificationStatus?: "not_started" | "pending" | "verified" | "banned";
  verifiedAt?: string;
  storeId?: number;
}


export interface UserResponse {
  displayName: string;
  email: string;
  refNumber: string;
  otpToken: string;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  VERIFIED = "verified",
  PENDING = "pending",
  BANNED = "banned",
}

