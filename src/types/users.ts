export interface User {
  id: number;
  displayName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}


export interface UserResponse {
  displayName: string;
  email: string;
  refNumber: string;
  otpToken: string;
}
