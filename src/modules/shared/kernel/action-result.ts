export type FormActionResult = {
  success?: true;
  error?: string;
};

export function actionSuccess(): FormActionResult {
  return { success: true };
}

export function actionFailure(error: string): FormActionResult {
  return { error };
}

export function hasActionError(result: FormActionResult): result is { error: string } {
  return typeof result.error === "string" && result.error.length > 0;
}
