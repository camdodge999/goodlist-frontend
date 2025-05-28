import * as z from "zod";

// Profile Form Schema
export const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  logo_url: z.string().nullable().optional(),
});

export type ProfileFormSchema = z.infer<typeof profileFormSchema>;

// Password Form Schema
export const passwordFormSchema = z.object({
  oldPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
  newPassword: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"),
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่านใหม่"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

export type PasswordFormSchema = z.infer<typeof passwordFormSchema>;

// Email Change Schema
export const emailChangeSchema = z.object({
  newEmail: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
});

export type EmailChangeSchema = z.infer<typeof emailChangeSchema>;

// OTP Validation Schema
export const otpValidationSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits")
});
