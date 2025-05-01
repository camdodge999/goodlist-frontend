export interface ContactInfo {
  line: string;
  facebook: string;
  phone: string;
  address: string;
}

export interface VerificationFormData {
  storeName: string;
  email: string;
  bankAccount: string;
  taxId: string;
  contactInfo: ContactInfo;
}

export interface FileInputProps {
  id: string;
  label: string;
  description: string;
  acceptTypes: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileRef: React.RefObject<HTMLInputElement>;
  selectedFile: File | null;
}

export interface VerificationStatus {
  status: "not_started" | "pending" | "verified" | "banned";
  message: string;
}

export type VerificationStatusType = "not_started" | "pending" | "verified" | "banned"; 