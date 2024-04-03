import {isString} from "@juulsgaard/ts-tools";

export type FormValidator<T> = (value: T) => string|string[]|Iterable<string>|undefined|null;

export function processFormValidators<T>(validators: FormValidator<T>[], value: T): string[] {
  if (validators.length <= 0) return [];

  const errors: string[] = [];

  for (let validator of validators) {
    const result = validator(value);
    if (result == null) continue;

    if (isString(result)) {
      errors.push(result);
      continue;
    }

    errors.push(...result);
  }

  return errors;
}
