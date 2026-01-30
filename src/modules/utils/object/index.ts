/**
 * Safely gets a property from an object, returning null if the object or property is null/undefined
 * @param obj The source object
 * @param key The property key to access
 * @returns The property value or null if not accessible
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
): T[K] | null {
  if (!obj) return null;
  return obj[key] ?? null;
}
