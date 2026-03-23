import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Tên phải có ít nhất 2 ký tự."),
  role: z.enum(["SME", "STUDENT"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
