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
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type PasswordFormSchema = z.infer<typeof passwordFormSchema>;

// Email Change Schema
export const emailChangeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// OTP Validation Schema
export const otpValidationSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits")
});
