import {lastValueFrom, Observable} from "rxjs";
import {DeepPartial, SimpleObject} from "@juulsgaard/ts-tools";
import {ILoadingState} from "@juulsgaard/rxjs-tools";
import {FormRoot, FormUnit, InputTypes, ModelFormRoot} from "../forms";
import {FormDialogOptions} from "./form-dialog-config";
import {signal, Signal} from "@angular/core";
import {formRoot} from "../constructors";
import {FormGroupControls} from "../types";
import {FormValidationContext, FormValidator} from "../tools";

export abstract class BaseFormDialog<TControls extends Record<string, FormUnit>, TValue extends SimpleObject> {

  /** The form of the dialog */
  abstract readonly form: FormRoot<TControls, TValue>;

  /** The value of the dialog form */
  abstract readonly value: Signal<TValue>;

  /** The dialog form controls */
  abstract readonly controls: Signal<TControls>;

  private readonly _show = signal(false);
  /** Whether the dialog should be shown */
  readonly show: Signal<boolean> = this._show.asReadonly();

  private readonly _working = signal(false);
  /** Whether the submission is currently in progress */
  readonly working: Signal<boolean> = this._working.asReadonly();

  private readonly onSubmit: (data: TValue) => Promise<any>|Observable<any>|ILoadingState|void;
  protected readonly createForm: boolean;

  /** The title of the Dialog */
  readonly title: string;
  /** The description text for the dialog */
  readonly description?: string;
  /** The text for the submit button */
  readonly buttonText: string;
  /** Whether the form should submit when enter is hit */
  readonly submitOnEnter: boolean;

  abstract readonly valid: Signal<boolean>;
  abstract readonly canSubmit: Signal<boolean>;

  abstract readonly errors: Signal<string[]>;
  abstract readonly errorState: Signal<FormValidationContext[]>;

  abstract readonly warnings: Signal<string[]>;
  abstract readonly warningState: Signal<FormValidationContext[]>;

  protected constructor(
    type: 'create'|'update',
    options: FormDialogOptions<TValue>,
    submitOnEnter?: boolean,
    buttonText?: string
  ) {
    this.createForm = type === 'create';
    this.onSubmit = options.onSubmit;
    this.title = options.title;
    this.description = options.description;
    this.buttonText = buttonText ?? (this.createForm ? 'Create' : 'Save');
    this.submitOnEnter = submitOnEnter ?? this.shouldSubmitOnEnter();
  }

  private shouldSubmitOnEnter() {
    const count = this.form.nodes().length;
    if (count <= 0) return true;
    if (count > 1) return false;

    const type = this.form.nodes().at(0)!.type;
    if (type == InputTypes.LongText || type == InputTypes.HTML) return false;
    return true;
  }

  /**
   * Start the dialog.
   * This will reset and show the dialog.
   * @param reset - Optional reset data
   */
  start(reset?: DeepPartial<TValue>) {
    this.form.reset(reset);
    this._show.set(true);
  }

  /**
   * Close the dialog
   */
  close() {
    this._show.set(false);
  }

  /**
   * Submit the form Dialog with the current values
   */
  async submit() {
    if (this.working()) return;
    if (!this.form.isValid()) return;

    this._working.set(true);

    try {
      const value = this.form.getValidValue();
      let result = this.onSubmit(value);

      if (result instanceof ILoadingState) {
        await result;
      } else if (result instanceof Observable) {
        await lastValueFrom(result);
      } else if (result instanceof Promise) {
        await result;
      }

      this._show.set(false);

    } finally {
      this._working.set(false);
    }

  }

}

export class FormDialog<TValue extends SimpleObject> extends BaseFormDialog<FormGroupControls<TValue>, TValue> {

  readonly form: ModelFormRoot<TValue>;

  readonly canSubmit: Signal<boolean>;
  readonly controls: Signal<FormGroupControls<TValue>>;
  readonly errorState: Signal<FormValidationContext[]>;
  readonly errors: Signal<string[]>;
  readonly valid: Signal<boolean>;
  readonly value: Signal<TValue>;
  readonly warningState: Signal<FormValidationContext[]>;
  readonly warnings: Signal<string[]>;

  /**
   * Manually create a Form Dialog.
   * It is recommended to the `formDialog.create<T>()` or `formDialog.update<T>()` when creating a Form Dialog.
   * @param controls - The Form Template
   * @param type - The type of dialog
   * @param options - Settings
   * @param submitOnEnter
   * @param buttonText
   * @param errorValidators
   * @param warningValidators
   */
  constructor(
    controls: FormGroupControls<TValue>,
    type: "create" | "update",
    options: FormDialogOptions<TValue>,
    submitOnEnter?: boolean,
    buttonText?: string,
    errorValidators: FormValidator<TValue>[] = [],
    warningValidators: FormValidator<TValue>[] = []
  ) {
    super(type, options, submitOnEnter, buttonText);

    this.form = formRoot.model<TValue>(controls, {
      errors: errorValidators,
      warnings: warningValidators,
    });

    this.controls = this.form.controls;
    this.value = this.form.value;
    this.valid = this.form.valid;

    this.errors = this.form.errors;
    this.errorState = this.form.errorState;

    this.warnings = this.form.warnings;
    this.warningState = this.form.warningState;

    this.canSubmit = this.createForm ? this.form.canCreate : this.form.canUpdate;
  }
}
