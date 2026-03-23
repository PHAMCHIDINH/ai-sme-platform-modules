import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().url().safeParse(value).success,
    "URL không hợp lệ.",
  );

export const studentProfileSchema = z.object({
  university: z.string().trim().min(1, "Vui lòng nhập trường học."),
  major: z.string().trim().min(1, "Vui lòng nhập chuyên ngành."),
  skills: z.string().trim().min(1, "Vui lòng nhập kỹ năng chuyên môn."),
  technologies: z.string().trim().min(1, "Vui lòng nhập công nghệ hoặc công cụ."),
  githubUrl: optionalUrlSchema,
  portfolioUrl: optionalUrlSchema,
  availability: z.string().trim().min(1, "Vui lòng nhập khả năng đáp ứng thời gian."),
  description: z.string().trim(),
  interests: z.string().trim(),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
