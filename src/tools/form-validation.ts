import {isString} from "@juulsgaard/ts-tools";
import {FormUnit} from "../forms";

export type FormValidationData = { message: string, unit: FormUnit };
export type FormValidationContext = { path: (string|number)[], data: FormValidationData };

export function validationData(message: string, unit: FormUnit): FormValidationContext {
  return {
    data: {message, unit},
    path: []
  };
}

export function prependValidationPath(data: FormValidationContext, prefix: string|number): FormValidationContext {
  return {
    data: data.data,
    path: [prefix, ...data.path]
  };
}

export type FormValidator<T> = (value: T) => string|string[]|Iterable<string>|undefined|null;

export function *processFormValidators<T>(validators: FormValidator<T>[], value: T): Generator<string> {
  if (validators.length <= 0) return;

  for (let validator of validators) {
    const result = validator(value);
    if (result == null) continue;

    if (isString(result)) {
      yield result;
      continue;
    }

    for (const error of result) {
      yield error;
    }
  }
}
