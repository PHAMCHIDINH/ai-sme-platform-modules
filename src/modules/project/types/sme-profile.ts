import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().url().safeParse(value).success,
    "URL không hợp lệ.",
  );

export const smeProfileSchema = z.object({
  companyName: z.string().trim().min(1, "Vui lòng nhập tên công ty."),
  avatarUrl: optionalUrlSchema,
  industry: z.string().trim().min(1, "Vui lòng nhập ngành nghề."),
  companySize: z.string().trim().min(1, "Vui lòng nhập quy mô công ty."),
  description: z.string().trim().min(1, "Vui lòng nhập mô tả doanh nghiệp."),
});

export type SmeProfileInput = z.infer<typeof smeProfileSchema>;
