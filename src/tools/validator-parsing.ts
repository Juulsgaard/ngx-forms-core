import {AbstractControl, NgControl} from "@angular/forms";

/**
 * Detects if a control is set as required
 * @param abstractControl
 */
export function hasRequiredField(abstractControl: AbstractControl|NgControl): boolean {
  if (abstractControl.validator) {
    const validator = abstractControl.validator({} as AbstractControl);
    if (validator && validator['required']) {
      return true;
    }
  }
  return false;
}
