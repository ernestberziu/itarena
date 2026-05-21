/** Parse localized error from API JSON body. */
export function parseApiErrorBody(
  body: unknown,
  fallback: string
): string {
  if (body && typeof body === "object" && "error" in body) {
    const err = (body as { error?: unknown }).error;
    if (typeof err === "string" && err.trim()) return err;
  }
  return fallback;
}
