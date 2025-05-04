import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .refine(
    (val) => {
      const validEmail = val.trim().length > 0 && val !== "";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      return validEmail && emailRegex.test(val.trim());
    },
    (val) => ({ 
      message: val.trim().length === 0 
        ? "กรุณากรอกอีเมล" 
        : "รูปแบบอีเมลไม่ถูกต้อง" 
    })
  )

// Password validation schema
export const passwordSchema = z
  .string()
  .min(1, { message: "กรุณากรอกรหัสผ่าน" })
  .min(8, { message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" })
  .regex(/[A-Z]/, { message: "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว" })
  .regex(/[a-z]/, { message: "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว" })
  .regex(/[0-9]/, { message: "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว" });

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" }),
});

// Registration schema
export const registrationSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "กรุณายืนยันรหัสผ่าน" }),
    acceptedTerms: z.boolean().refine((val) => val === true, {
      message: "กรุณายอมรับข้อกำหนดและเงื่อนไขการใช้งาน",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

// OTP validation schema
export const otpSchema = z
  .string()
  .length(6, { message: "กรุณากรอก OTP ให้ครบ 6 หลัก" });

// Types inferred from the schemas
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegistrationFormValues = z.infer<typeof registrationSchema>;
