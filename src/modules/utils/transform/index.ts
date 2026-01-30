/**
 * Copies all non-null and non-undefined fields from source to target object,
 * excluding specified keys
 * @param source The source object to copy from
 * @param target The target object to copy to
 * @param excludeKeys Array of keys to exclude from copying
 */
export function copyNonNullFields<T extends object>(
  source: T,
  target: any,
  excludeKeys: string[] = [],
) {
  // Guard against null or undefined source
  if (!source || typeof source !== 'object') {
    return;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (value !== null && value !== undefined && !excludeKeys.includes(key)) {
      target[key] = value;
    }
  });
}
