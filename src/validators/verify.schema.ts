import { z } from "zod";

// Schema for contact info
const contactInfoSchema = z.object({
  line: z.string().min(1, "กรุณาระบุ Line ID"),
  facebook: z.string().min(1, "กรุณาระบุ Facebook Page"),
  phone: z.string().min(9, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก"),
  address: z.string().min(1, "กรุณาระบุที่อยู่"),
});

// Main verification form schema
export const verificationFormSchema = z.object({
  storeName: z.string().min(1, "กรุณาระบุชื่อร้านค้า"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  bankAccount: z.string().min(10, "กรุณาระบุเลขบัญชีธนาคาร"),
  taxPayerId: z.string().optional(),
  description: z.string().min(1, "กรุณาระบุรายละเอียด"),
  contactInfo: contactInfoSchema,
});

// File validation schema
export const fileValidationSchema = z.object({
  imageStore: z.instanceof(File, { message: "กรุณาอัพโหลดรูปร้านค้า" }),
  imageIdCard: z.instanceof(File, { message: "กรุณาอัพโหลดบัตรประชาชน" }),
  certIncorp: z.instanceof(File).optional(),
});

// Export the type for typescript usage
export type VerificationFormSchema = z.infer<typeof verificationFormSchema>;
export type VerificationFileSchema = z.infer<typeof fileValidationSchema>;
