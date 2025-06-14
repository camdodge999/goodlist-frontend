import { z } from 'zod';

// Blog status enum
export const BlogStatusEnum = z.enum(['draft', 'published', 'archived', 'deleted']);

// Blog form validation schema
export const blogFormSchema = z.object({
  title: z
    .string()
    .min(1, 'หัวข้อบทความจำเป็นต้องระบุ')
    .min(3, 'หัวข้อบทความต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(200, 'หัวข้อบทความต้องไม่เกิน 200 ตัวอักษร')
    .trim(),
  
  slug: z
    .string()
    .min(1, 'Slug จำเป็นต้องระบุ')
    .min(3, 'Slug ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(100, 'Slug ต้องไม่เกิน 100 ตัวอักษร')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug ต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และเครื่องหมาย - เท่านั้น')
    .trim(),
  
  content: z
    .string()
    .min(1, 'เนื้อหาบทความจำเป็นต้องระบุ')
    .min(50, 'เนื้อหาบทความต้องมีอย่างน้อย 50 ตัวอักษร'),
  
  excerpt: z
    .string()
    .max(500, 'สรุปย่อต้องไม่เกิน 500 ตัวอักษร')
    .optional()
    .or(z.literal('')),
  
  status: BlogStatusEnum.default('draft'),
  
  tags: z
    .string()
    .max(200, 'แท็กต้องไม่เกิน 200 ตัวอักษร')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim() ?? ''),
  
  metaDescription: z
    .string()
    .max(160, 'คำอธิบายอื่นๆ ต้องไม่เกิน 160 ตัวอักษร')
    .optional()
    .or(z.literal('')),
  
  featured: z.boolean().default(false),
  
  uploadedImages: z
    .array(z.string())
    .optional()
    .default([])
});

// Type inference from schema
export type BlogFormInput = z.infer<typeof blogFormSchema>;

// Validation function
export const validateBlogForm = (data: unknown) => {
  return blogFormSchema.safeParse(data);
};

// Individual field validation helpers
export const validateTitle = (title: string) => {
  return z.string().min(1).min(3).max(200).safeParse(title);
};

export const validateSlug = (slug: string) => {
  return z.string()
    .min(1)
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .safeParse(slug);
};

export const validateContent = (content: string) => {
  return z.string().min(1).min(50).safeParse(content);
};

export const validateMetaDescription = (metaDescription: string) => {
  return z.string().max(160).safeParse(metaDescription);
};
