"use server";

import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

import { registerUserAndProfile } from "../services/register";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
});

export async function registerAction(formData: FormData) {
  const payload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "") as Role,
  };

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    redirect("/register?error=invalid_input");
  }

  const result = await registerUserAndProfile(parsed.data);
  if (!result.ok && result.code === "EMAIL_EXISTS") {
    redirect("/register?error=email_exists");
  }

  redirect("/login?registered=1");
}
