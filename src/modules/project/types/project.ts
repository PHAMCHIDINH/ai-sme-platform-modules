import { z } from "zod";

export const standardizeBriefSchema = z.object({
  description: z.string().trim().min(1, "Vui lòng nhập mô tả dự án."),
});

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tên dự án."),
  description: z.string().trim().min(1, "Vui lòng nhập mô tả bài toán."),
  standardizedBrief: z.string().trim().optional().or(z.literal("")),
  expectedOutput: z.string().trim().min(1, "Vui lòng nhập kết quả bàn giao."),
  requiredSkills: z.string().trim().min(1, "Vui lòng nhập kỹ năng cần có."),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  duration: z.string().trim().min(1, "Vui lòng nhập thời gian dự kiến."),
  budget: z.string().trim().optional().or(z.literal("")),
});

export type StandardizeBriefInput = z.infer<typeof standardizeBriefSchema>;
export type ProjectFormInput = z.infer<typeof projectFormSchema>;
