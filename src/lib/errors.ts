import type { AxiosError } from "axios";

/**
 * Backend error envelope produced by NestJS `HttpExceptionFilter`.
 * See CLAUDE.md §5 — Backend response shape.
 */
type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
  };
};

/**
 * Extracts a server-provided error message from an Axios error.
 * Falls back to the supplied user-facing string when the server did not
 * surface a message (network failure, non-Axios error, malformed payload).
 *
 * Usage in a mutation `onError`:
 *   onError: (err) => toast.error(extractErrorMessage(err, "Xatolik yuz berdi"))
 */
export function extractErrorMessage(
  err: unknown,
  fallback = "Xatolik yuz berdi",
): string {
  const e = err as AxiosError<ApiErrorEnvelope>;
  return e?.response?.data?.error?.message ?? fallback;
}
