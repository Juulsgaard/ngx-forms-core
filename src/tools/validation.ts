import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";
import {isString} from "@juulsgaard/ts-tools";

export class NodeValidators {

  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl) => {

      if (!control.value) return null;
      if (!isString(control.value)) return null;

      // test the value of the control against the regex supplied
      const valid = regex.test(control.value);

      // if true, return null (no error), else return error passed to validator
      return valid ? null : error;
    };
  }

  static hexColor = NodeValidators.patternValidator(/^#[\da-f]{6}([\da-f]{2})?$/i, { error: 'Invalid hex format' });

  static url(control: AbstractControl): ValidationErrors|null {
    const url = control.value;
    if (!url || !isString(url)) return null;

    const match = url.match(/^([a-z][-.+a-z\d]*):\/\//i);

    if (!match || match[1] === 'https') {

      const valid = url.match(/^(https:\/\/)?[-a-z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-z0-9@:%_+.~#?&/=]*)?$/i);
      if (!valid) return { error: 'Invalid Website URL' };

      return null;
    }

    if (match[1] === 'http') {
      return {error: 'http URLs are not supported'};
    }

    const valid = url.match(/^([a-z][-.+a-z\d]*):\/\/[-a-z0-9@:%_+.~#?&/=]*$/i);
    if (!valid) return { error: 'Invalid URL' };

    return null;
  }

  static guid = NodeValidators.patternValidator(
    /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    { error: 'Invalid GUID' }
  );
}
