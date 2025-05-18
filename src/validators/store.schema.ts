// Re-export all from verify.schema.ts for backward compatibility
export * from './verify.schema';

// The content below is kept for backward compatibility but will be deprecated
import * as z from 'zod';

// These schemas are deprecated, please use the ones from verify.schema.ts
const contactInfoSchema = z.object({
  line: z.string().min(1, "Line ID is required"),
  facebook: z.string().min(1, "Facebook page is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
});

const verificationFormSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  email: z.string().email("Invalid email address"),
  bankAccount: z.string().min(1, "Bank account is required"),
  taxId: z.string().optional(),
  contactInfo: contactInfoSchema,
});

const fileValidationSchema = z.object({
  storeImage: z.instanceof(File, { message: "Store image is required" }),
  registrationDoc: z.instanceof(File).optional(),
  idCard: z.instanceof(File, { message: "ID card is required" }),
});

