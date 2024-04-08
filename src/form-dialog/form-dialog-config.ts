import {FormDialog} from "./form-dialog";
import {Observable} from "rxjs";
import {ILoadingState} from "@juulsgaard/rxjs-tools";
import {FormGroupControls} from "../types";
import {FormValidator} from "../tools";

export interface FormDialogOptions<T> {
  /** The title of the dialog */
  title: string;
  /** The description for the dialog */
  description?: string;
  /** The action to perform when submitting the form */
  onSubmit: (data: T) => Promise<any> | Observable<any> | ILoadingState | void;
}

export class FormDialogConfig<TValue extends Record<string, any>> {

  protected buttonText?: string;
  protected errorValidators: FormValidator<TValue>[] = [];
  protected warningValidators: FormValidator<TValue>[] = [];
  protected shouldSubmitOnEnter?: boolean;

  constructor(private type: 'create' | 'update', private controls: FormGroupControls<TValue>) {

  }

  /**
   * Add validators to the form
   * @param validators
   */
  public withErrors(...validators: FormValidator<TValue>[]): this {
    this.errorValidators = [...this.errorValidators, ...validators];
    return this;
  }

  /**
   * Add warning validators to the form
   * @param validators
   */
  public withWarnings(...validators: FormValidator<TValue>[]): this {
    this.warningValidators = [...this.warningValidators, ...validators];
    return this;
  }

  /**
   * Toggle whether the form should submit when the user hits enter
   * @param submitOnEnter
   */
  public submitOnEnter(submitOnEnter: boolean): this {
    this.shouldSubmitOnEnter = submitOnEnter;
    return this;
  }

  /**
   * Set custom submit button text
   * @param buttonText
   */
  public withButtonText(buttonText: string): this {
    this.buttonText = buttonText;
    return this;
  }

  /**
   * Configure the dialog
   * @param settings
   */
  configure(settings: FormDialogOptions<TValue>): FormDialog<TValue> {
    return new FormDialog<TValue>(this.controls, this.type, settings)
  }
}
