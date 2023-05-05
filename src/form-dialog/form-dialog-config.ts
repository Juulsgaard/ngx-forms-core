import {FormGroupControls, FormGroupValueRaw} from "../tools/form-types";
import {FormDialog} from "./form-dialog";
import {Observable} from "rxjs";
import {DeepPartial} from "@consensus-labs/ts-tools";
import {AbstractControl} from "@angular/forms";

export interface FormDialogOptions<T> {
  /** The action to perform when submitting the form */
  onSubmit: (data: T) => Promise<any> | Observable<any> | void;
  /** The title of the dialog */
  title: string;
  /** The description for the dialog */
  description?: string;
  /** The text to show on the submit button. Defaults to 'Submit' */
  buttonText?: string;
  /** Optional validation for the form. Return a string when an error is present */
  validate?: (data: DeepPartial<T>) => string | void;
  /** Whether to have enter submit the form */
  submitOnEnter?: boolean;
}

export class FormDialogConfig<TValue extends Record<string, any>> {

  static FromControls<T extends Record<string, AbstractControl>>(
    type: 'create' | 'update',
    controls: T
  ): FormDialogConfig<FormGroupValueRaw<T>> {
    return new FormDialogConfig<FormGroupValueRaw<T>>(type, controls as unknown as FormGroupControls<FormGroupValueRaw<T>>);
  }

  constructor(private type: 'create' | 'update', private controls: FormGroupControls<TValue>) {

  }

  /**
   * Configure the dialog
   * @param settings
   */
  configure(settings: FormDialogOptions<TValue>) {
    return new FormDialog<TValue>(this.controls, this.type, settings)
  }
}
