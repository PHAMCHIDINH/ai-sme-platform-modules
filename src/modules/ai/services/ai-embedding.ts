export const MAX_EMBEDDING_TEXT_LENGTH = 4000;
export const EMBEDDING_TIMEOUT_MS = 10_000;

export class TimeoutError extends Error {
  constructor(message = "Embedding request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

export function normalizeEmbeddingText(text: string) {
  return text.trim();
}

export function validateEmbeddingText(text: string) {
  const normalized = normalizeEmbeddingText(text);

  if (!normalized) {
    return { ok: false as const, error: "Text đầu vào không hợp lệ." };
  }

  if (normalized.length > MAX_EMBEDDING_TEXT_LENGTH) {
    return {
      ok: false as const,
      error: `Text quá dài. Tối đa ${MAX_EMBEDDING_TEXT_LENGTH} ký tự.`,
    };
  }

  return { ok: true as const, value: normalized };
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs = EMBEDDING_TIMEOUT_MS) {
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new TimeoutError()), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
