export function isMissing(value: unknown, api: string): boolean {
  if (typeof value === 'string' && value.length > 0) return false;
  console.error(`OneSignal: ${api} is required`);
  return true;
}

export function hasMissingEntries(
  values: Record<string, unknown> | null | undefined,
  api: string,
  allowEmptyValue = false,
): boolean {
  if (values === null || values === undefined) return isMissing(values, api);
  for (const key of Object.keys(values)) {
    if (isMissing(key, `${api}: key`)) return true;
    const item = values[key];
    if (!allowEmptyValue) {
      if (isMissing(item, `${api}: value`)) return true;
    } else if (item === null || item === undefined) {
      console.error(`OneSignal: ${api}: value is required`);
      return true;
    }
  }
  return false;
}

export function hasMissingItems(values: unknown, api: string, item: string): boolean {
  if (!Array.isArray(values)) {
    console.error(`OneSignal: ${api}: ${item}s must be an array of strings`);
    return true;
  }
  return values.some((value) => isMissing(value, `${api}: ${item}`));
}

/**
 * Removes a listener from an array of listeners.
 * @param array The array of listeners
 * @param listener The listener to remove
 */
export function removeListener<T>(
  array: ((event: T) => void)[],
  listener: (event: T) => void,
): void {
  const index = array.indexOf(listener);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

/**
 * Returns true if the value is a JSON-serializable object.
 */
export function isObjectSerializable(value: unknown): boolean {
  if (!(typeof value === 'object' && value !== null && !Array.isArray(value))) {
    return false;
  }
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}
