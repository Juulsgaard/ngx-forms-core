import {FormValidator} from "./form-validation";

const EMAIL_REGEXP =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export class FormValidators {

  patternValidator(regex: RegExp, error: string|string[]): FormValidator<string|undefined> {
    return (value: string|undefined) => {
      if (!value) return null;

      // test the value of the control against the regex supplied
      const valid = regex.test(value);

      // if true, return null (no error), else return error passed to validator
      return valid ? null : error;
    };
  }

  hexColor(error?: string): FormValidator<string|undefined> {
    return this.patternValidator(/^#[\da-f]{6}([\da-f]{2})?$/i, error ?? 'Invalid hex format');
  }

  url(allowHttp = false, error?: string): FormValidator<string|undefined> {
    return (value: string|undefined): string|null => {
      if (!value) return null;

      const match = value.match(/^([a-z][-.+a-z\d]*):\/\//i);

      if (!match || match[1] === 'https') {

        const valid = value.match(/^(https:\/\/)?[-a-z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-z0-9@:%_+.~#?&/=]*)?$/i);
        if (!valid) return error ?? 'Invalid Website URL';

        return null;
      }

      if (!allowHttp && match[1] === 'http') {
        return error ?? 'http URLs are not supported';
      }

      const valid = value.match(/^([a-z][-.+a-z\d]*):\/\/[-a-z0-9@:%_+.~#?&/=]*$/i);
      if (!valid) return error ?? 'Invalid URL';

      return null;
    };
  }

  guid(error?: string): FormValidator<string|undefined> {
    return this.patternValidator(
      /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      error ?? 'Invalid GUID'
    );
  }

  email(error?: string): FormValidator<string|undefined> {
    return this.patternValidator(
      EMAIL_REGEXP,
      error ?? 'Invalid Email'
    );
  }

  min(min: number, error?: string): FormValidator<number|undefined> {
    return (value: number|undefined) => {
      if (value == null) return null;
      value = Number(value);
      if (Number.isNaN(value)) return null;
      if (value >= min) return null;
      return error ?? `The minimum value is ${min}`;
    }
  }

  max(max: number, error?: string): FormValidator<number|undefined> {
    return (value: number|undefined) => {
      if (value == null) return null;
      value = Number(value);
      if (Number.isNaN(value)) return null;
      if (value <= max) return null;
      return error ?? `The maximum value is ${max}`;
    }
  }

  minLength(minLength: number, error?: string): FormValidator<unknown|undefined> {
    return (value: unknown|undefined) => {
      if (value == null) return null;
      const length = value.toString().length;

      if (length >= minLength) return null;
      return error ?? `A minimum length of ${minLength} is required [${length}/${minLength}]`;
    }
  }

  maxLength(maxLength: number, error?: string): FormValidator<unknown|undefined> {
    return (value: unknown|undefined) => {
      if (value == null) return null;
      const length = value.toString().length;

      if (length <= maxLength) return null;
      return error ?? `Maximum length of ${maxLength} ${length}/${maxLength}]`;
    }
  }
}

export const Validators = new FormValidators();
