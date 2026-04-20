export type DeepPartial<T> = T extends Function
  ? T
  : T extends readonly (infer U)[]
    ? ReadonlyArray<DeepPartial<U>>
    : T extends (infer U)[]
      ? DeepPartial<U>[]
      : T extends object
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : T;

/**
 * Recursively merges a patch object into a target object.
 */
export function deepMerge<T>(target: T, patch: DeepPartial<T>): T {
  if (patch === undefined || patch === null) return target;

  const isObj = (v: unknown): v is Record<string, unknown> =>
    Object.prototype.toString.call(v) === '[object Object]';

  if (!isObj(target) || !isObj(patch)) {
    return patch as unknown as T;
  }

  const out: Record<string, unknown> = { ...(target as any) };

  for (const [k, v] of Object.entries(patch)) {
    const tk = (target as any)[k];

    if (Array.isArray(v)) {
      out[k] = v.slice();
    } else if (isObj(v) && isObj(tk)) {
      out[k] = deepMerge(tk, v as any);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }

  return out as T;
}
