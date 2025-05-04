import * as z from 'zod';

export const contactInfoSchema = z.object({
  line: z.string().min(1, "Line ID is required"),
  facebook: z.string().min(1, "Facebook page is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
});

export const verificationFormSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  email: z.string().email("Invalid email address"),
  bankAccount: z.string().min(1, "Bank account is required"),
  taxId: z.string().optional(),
  contactInfo: contactInfoSchema,
});

export type ContactInfoSchema = z.infer<typeof contactInfoSchema>;
export type VerificationFormSchema = z.infer<typeof verificationFormSchema>;

export const fileValidationSchema = z.object({
  storeImage: z.instanceof(File, { message: "Store image is required" }),
  registrationDoc: z.instanceof(File).optional(),
  idCard: z.instanceof(File, { message: "ID card is required" }),
});

