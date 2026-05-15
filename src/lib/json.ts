/**
 * SQL Server has no native JSON column type.
 * These helpers serialize/deserialize JSON stored as NVarChar(Max).
 */

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function parseJsonArray<T>(value: string | null | undefined): T[] {
  return parseJson<T[]>(value, []);
}

export function parseJsonObject<T extends object>(
  value: string | null | undefined
): T {
  return parseJson<T>(value, {} as T);
}
