import { z } from "zod";

export const smeProfileSchema = z.object({
  companyName: z.string().trim().min(1, "Vui lòng nhập tên công ty."),
  industry: z.string().trim().min(1, "Vui lòng nhập ngành nghề."),
  companySize: z.string().trim().min(1, "Vui lòng nhập quy mô công ty."),
  description: z.string().trim().min(1, "Vui lòng nhập mô tả doanh nghiệp."),
});

export type SmeProfileInput = z.infer<typeof smeProfileSchema>;
