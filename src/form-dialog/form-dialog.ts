import {IFormDialog} from "./form-dialog.interface";
import {IFormRoot} from "../units/root/form-root.interface";
import {signal, Signal} from "@angular/core";
import {FormLayerControls} from "../units/controls";
import {lastValueFrom, Observable} from "rxjs";
import {ILoadingState} from "@juulsgaard/rxjs-tools";
import {FormValidationContext, FormValidator} from "../tools/form-validation";
import {FormDialogOptions} from "./form-dialog.types";
import {formRoot} from "../units/root/form-root.ctor";
import {InputTypes} from "../units/input/form-input.types";
import {DeepPartial} from "@juulsgaard/ts-tools";


export class FormDialog<T> implements IFormDialog<T> {

  /** The form of the dialog */
  readonly form: IFormRoot<T>;

  /** The value of the dialog form */
  readonly value: Signal<T>;

  /** The dialog form controls */
  readonly controls: Signal<FormLayerControls<T>>;

  private readonly _show = signal(false);
  /** Whether the dialog should be shown */
  readonly show: Signal<boolean> = this._show.asReadonly();

  private readonly _working = signal(false);
  /** Whether the submission is currently in progress */
  readonly working: Signal<boolean> = this._working.asReadonly();

  private readonly onSubmit: (data: T) => Promise<any>|Observable<any>|ILoadingState|void;
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

  readonly errors: Signal<string[]>;
  readonly errorState: Signal<FormValidationContext[]>;

  readonly warnings: Signal<string[]>;
  readonly warningState: Signal<FormValidationContext[]>;

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
    controls: FormLayerControls<T>,
    type: "create" | "update",
    options: FormDialogOptions<T>,
    submitOnEnter?: boolean,
    buttonText?: string,
    errorValidators: FormValidator<T>[] = [],
    warningValidators: FormValidator<T>[] = []
  ) {
    this.form = formRoot.build(controls)
      .withErrors(...errorValidators)
      .withWarnings(...warningValidators)
      .done();

    this.createForm = type === 'create';
    this.onSubmit = options.onSubmit;
    this.title = options.title;
    this.description = options.description;
    this.buttonText = buttonText ?? (this.createForm ? 'Create' : 'Save');

    this.controls = this.form.controls;
    this.value = this.form.value;
    this.valid = this.form.valid;

    this.errors = this.form.errors;
    this.errorState = this.form.errorState;

    this.warnings = this.form.warnings;
    this.warningState = this.form.warningState;

    this.canSubmit = this.createForm ? this.form.canCreate : this.form.canUpdate;

    this.submitOnEnter = submitOnEnter ?? this.shouldSubmitOnEnter();
  }

  private shouldSubmitOnEnter() {
    const nodes = this.form.inputs().filter(x => !x.readonly);
    const count = nodes.length;
    if (count <= 0) return true;
    if (count > 1) return false;

    const type = nodes.at(0)!.type;

    switch (type) {
      case InputTypes.LongText:
      case InputTypes.HTML:
      case InputTypes.Select:
      case InputTypes.SelectMany:
      case InputTypes.Generic:
      case InputTypes.Search:
        return false;
      default:
        return true;
    }
  }

  /**
   * Start the dialog.
   * This will reset and show the dialog.
   * @param reset - Optional reset data
   */
  start(reset?: DeepPartial<T>) {
    this.form.reset(reset);
    this.form.markAsUntouched();
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
