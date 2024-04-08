import {lastValueFrom, Observable} from "rxjs";
import {DeepPartial, SimpleObject} from "@juulsgaard/ts-tools";
import {ILoadingState} from "@juulsgaard/rxjs-tools";
import {InputTypes, ModelFormRoot} from "../forms";
import {FormDialogOptions} from "./form-dialog-config";
import {signal, Signal} from "@angular/core";
import {formRoot} from "../constructors";
import {FormGroupControls} from "../types";
import {FormValidator} from "../tools";

export class FormDialog<TValue extends SimpleObject> {

  /** The form of the dialog */
  readonly form: ModelFormRoot<TValue>;

  /** The value of the dialog form */
  readonly value: Signal<TValue>;

  /** The dialog form controls */
  readonly controls: Signal<FormGroupControls<TValue>>;

  private readonly _show = signal(false);
  /** Whether the dialog should be shown */
  readonly show: Signal<boolean> = this._show.asReadonly();

  private readonly _working = signal(false);
  /** Whether the submission is currently in progress */
  readonly working: Signal<boolean> = this._working.asReadonly();

  private readonly onSubmit: (data: TValue) => Promise<any>|Observable<any>|ILoadingState|void;
  private readonly createForm: boolean;

  /** The title of the Dialog */
  readonly title: string;
  /** The description text for the dialog */
  readonly description?: string;
  /** The text for the submit button */
  readonly buttonText: string;
  /** Whether the form should submit when enter is hit */
  readonly submitOnEnter: boolean;

  readonly valid: Signal<boolean>;
  readonly canSubmit: Signal<boolean>;


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
    type: 'create'|'update',
    options: FormDialogOptions<TValue>,
    submitOnEnter?: boolean,
    buttonText?: string,
    errorValidators: FormValidator<TValue>[] = [],
    warningValidators: FormValidator<TValue>[] = [],
  ) {

    this.form = formRoot.model<TValue>(controls, {
      errors: errorValidators,
      warnings: warningValidators,
    });

    this.createForm = type === 'create';
    this.onSubmit = options.onSubmit;
    this.title = options.title;
    this.description = options.description;
    this.buttonText = buttonText ?? (this.createForm ? 'Create' : 'Save');
    this.submitOnEnter = submitOnEnter ?? this.shouldSubmitOnEnter();

    this.controls = this.form.controls;
    this.value = this.form.value;
    this.valid = this.form.valid;
    this.canSubmit = this.createForm ? this.form.canCreate : this.form.canUpdate;
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

