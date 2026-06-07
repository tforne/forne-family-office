import "server-only";

const retryableNeedles = [
  "too many requests",
  "too_many_requests",
  "429",
  "rate limit",
  "econnreset",
  "etimedout",
  "fetch failed",
  "timeout"
];

const nonRetryableNeedles = [
  "unauthorized",
  "forbidden",
  "validation",
  "bad request",
  "no se pudo resolver el portaluserid",
  "portal_user",
  "session_missing_user"
];

export type AIRetryAttempt = {
  attempt: number;
  retryable: boolean;
  delayMs: number;
  errorMessage: string;
};

export type RetryWithBackoffOptions<T> = {
  maxAttempts?: number;
  baseDelaysMs?: number[];
  onAttemptFailure?: (attempt: AIRetryAttempt) => void;
  run: (attempt: number) => Promise<T>;
};

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message || error.name || "Unknown AI error";
  return String(error || "Unknown AI error");
}

export function isRetryableAIError(error: unknown) {
  const message = normalizeErrorMessage(error).toLowerCase();

  if (nonRetryableNeedles.some((needle) => message.includes(needle))) {
    return false;
  }

  return retryableNeedles.some((needle) => message.includes(needle));
}

function jitterMs() {
  return Math.floor(Math.random() * 251);
}

function wait(delayMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export async function retryWithBackoff<T>({
  maxAttempts = 4,
  baseDelaysMs = [0, 1000, 2000, 4000],
  onAttemptFailure,
  run
}: RetryWithBackoffOptions<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await run(attempt);
    } catch (error) {
      lastError = error;
      const retryable = isRetryableAIError(error);
      const hasNextAttempt = attempt < maxAttempts;
      const retryDelayMs = retryable && hasNextAttempt ? (baseDelaysMs[attempt] ?? baseDelaysMs[baseDelaysMs.length - 1] ?? 0) + jitterMs() : 0;

      onAttemptFailure?.({
        attempt,
        retryable,
        delayMs: retryDelayMs,
        errorMessage: normalizeErrorMessage(error)
      });

      if (!retryable || !hasNextAttempt) {
        throw error;
      }

      await wait(retryDelayMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(normalizeErrorMessage(lastError));
}
