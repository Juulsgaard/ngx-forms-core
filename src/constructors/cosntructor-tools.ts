export interface FormNodeCtorOptions<T> {
  fallback?: T;
  disabledFallback?: T | undefined;
}

export function parseOptions<T>(initial: T, options: FormNodeCtorOptions<T>): {
  fallback: T | undefined,
  disabled: T | undefined
};
export function parseOptions<T>(initial: T | undefined, options: FormNodeCtorOptions<T>, defaultFallback: T): {
  fallback: T,
  disabled: T | undefined
};
export function parseOptions<T>(initial: T | undefined, options: FormNodeCtorOptions<T>, defaultFallback?: T): {
  fallback: T | undefined,
  disabled: T | undefined
} {
  const fallback = 'fallback' in options ? options.fallback : initial;
  const disabled = 'disabledFallback' in options ? options.disabledFallback : fallback;
  return {fallback: fallback ?? defaultFallback, disabled};
}
