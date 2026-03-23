import type { AuthActionErrorCode } from "../types/auth-action-errors";
import type { Result } from "@/modules/shared";

type AuthActionResult = Result<null, AuthActionErrorCode>;

export function getAuthActionErrorMessage(result: AuthActionResult | undefined): string | null {
  if (!result || result.ok) {
    return null;
  }

  return result.error;
}
