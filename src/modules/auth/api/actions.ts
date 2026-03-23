"use server";

import { authActionErrorMessage, type AuthActionErrorCode } from "../types/auth-action-errors";
import { registerSchema } from "../types/auth";
import { registerUserAndProfile } from "../services/register";
import { err, ok, type Result } from "@/modules/shared";

type AuthActionResult = Result<null, AuthActionErrorCode>;

function success(): AuthActionResult {
  return ok(null);
}

function failure(code: AuthActionErrorCode, overrideMessage?: string): AuthActionResult {
  return err(code, overrideMessage ?? authActionErrorMessage(code));
}

function authErrorType(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("type" in error)) {
    return null;
  }

  const type = (error as { type?: unknown }).type;
  return typeof type === "string" ? type : null;
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const { signIn } = await import("@/auth");
    await signIn("credentials", formData);
    return success();
  } catch (error) {
    const type = authErrorType(error);
    if (type === "CredentialsSignin") {
      return failure("INVALID_CREDENTIALS");
    }
    if (type) {
      return failure("LOGIN_FAILED");
    }

    throw error;
  }
}

export async function register(prevState: string | undefined, formData: FormData): Promise<AuthActionResult> {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
      return failure("REGISTER_INVALID_INPUT", parsed.error.issues[0].message);
    }

    const result = await registerUserAndProfile(parsed.data);
    if (!result.ok && result.code === "EMAIL_EXISTS") {
      return failure("EMAIL_EXISTS", result.error);
    }

    return success();
  } catch (error) {
    console.error("Register Error:", error);
    return failure("REGISTER_FAILED");
  }
}
