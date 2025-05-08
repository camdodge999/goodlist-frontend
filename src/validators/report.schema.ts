import { z } from "zod";

export const reportFormSchema = z.object({
  storeId: z.number({
    required_error: "กรุณาเลือกร้านค้า",
    invalid_type_error: "รูปแบบข้อมูลไม่ถูกต้อง",
  }),
  reason: z.string({
    required_error: "กรุณาระบุเหตุผลในการรายงาน",
  })
  .min(10, "เหตุผลต้องมีความยาวอย่างน้อย 10 ตัวอักษร")
  .max(500, "เหตุผลต้องมีความยาวไม่เกิน 500 ตัวอักษร"),
  evidence: z.instanceof(File, {
    message: "กรุณาอัพโหลดหลักฐาน",
  }).refine(
    (file) => file.size <= 10 * 1024 * 1024,
    "ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 10MB"
  ).refine(
    (file) => ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
    "รองรับเฉพาะไฟล์ PNG, JPG และ PDF เท่านั้น"
  ),
});

export type ReportFormSchema = z.infer<typeof reportFormSchema>;


