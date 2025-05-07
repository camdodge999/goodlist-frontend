export interface User {
  id: string;
  email?: string;
  phone?: string;
  address?: string;
  image?: string;
  role?: string;
  displayName?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
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
}

