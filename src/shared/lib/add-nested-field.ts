/**
 * Sets a nested value in an object using dot notation path.
 * Creates intermediate objects if they don't exist.
 *
 * @example
 * setNestedValue({client: {name: "John"}}, "client.birth", "")
 * // Returns: {client: {name: "John", birth: ""}}
 *
 * @example
 * setNestedValue({}, "company.address.city", "")
 * // Returns: {company: {address: {city: ""}}}
 */
export function setNestedValue<T extends Record<string, any>>(
  obj: T,
  path: string,
  value: any = '',
): T {
  const result = JSON.parse(JSON.stringify(obj)); // Deep clone
  const keys = path.split('.');

  let current: Record<string, any> = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  const lastKey = keys[keys.length - 1];
  // Only set if the key doesn't already exist
  if (!(lastKey in current)) {
    current[lastKey] = value;
  }

  return result;
}

/**
 * Checks if a nested path exists in an object.
 */
export function hasNestedValue(obj: Record<string, any>, path: string): boolean {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return false;
    }
    current = current[key];
  }

  return true;
}
