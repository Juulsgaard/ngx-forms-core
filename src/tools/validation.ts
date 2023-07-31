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

  static url = NodeValidators.patternValidator(
    /^(https:\/\/)?[-a-z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-z0-9@:%_+.~#?&/=]*)?$/i,
    { error: 'Invalid URL' }
  );

  static guid = NodeValidators.patternValidator(
    /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    { error: 'Invalid GUID' }
  );
}
