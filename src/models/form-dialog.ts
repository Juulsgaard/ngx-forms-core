import {BehaviorSubject, firstValueFrom, lastValueFrom, Observable, of, switchMap} from "rxjs";
import {map} from "rxjs/operators";
import {DeepPartial} from "@consensus-labs/ts-tools";
import {persistentCache} from "@consensus-labs/rxjs-tools";
import {FormGroupControls, FormGroupTemplate, FormGroupTemplateValue, FormGroupValueRaw} from "../tools/form-types";
import {FormRootConstructors, ModelFormRoot} from "./form-root";
import {formTemplateToControls} from "../tools/templates";

export class FormDialog<TValue extends Record<string, any>> {

  /**
   * Create a new creation Form Dialog.
   * Use this when the dialog is used for creating something.
   * @constructor
   */
  static Create<TForm extends Record<string, any>>(): FormDialogFactory<TForm> {
    return new FormDialogFactory('create');
  }

  /**
   * Create a new update Form Dialog.
   * Use this when the dialog is modifying data.
   * @constructor
   */
  static Update<TForm extends Record<string, any>>(): FormDialogFactory<TForm> {
    return new FormDialogFactory('update');
  }

  private readonly _form: ModelFormRoot<TValue>;
  /** The form of the dialog */
  get form(): ModelFormRoot<TValue> {return this._form}

  /** The value of the dialog form */
  get value(): TValue {return this.form.getRawValue()}
  /** The dialog form controls */
  get controls(): FormGroupControls<TValue> {return this._form.controls};

  private _show$ = new BehaviorSubject(false);
  /** An observable denoting when to show the dialog */
  show$ = this._show$.asObservable();
  /** Whether the dialog should be shown */
  get show(): boolean {return this._show$.value}

  private _working$ = new BehaviorSubject(false);
  /** An observable denoting that the submission is in progress */
  working$ = this._working$.asObservable();
  /** Whether the submission is currently in progress */
  get working(): boolean {return this._working$.value}

  private readonly onSubmit: (data: TValue) => Promise<any>|Observable<any>|void;
  private readonly createForm: boolean;

  /** The title of the Dialog */
  readonly title: string;
  /** The description text for the dialog */
  readonly description?: string;
  /** The text for the submit button */
  readonly buttonText: string;
  /** Whether the form should submit when enter is hit */
  readonly submitOnEnter: boolean;

  /** An observable denoting when the form is valid for submission */
  valid$: Observable<boolean>;
  /** An observable containing a display string for the error state when errors are present */
  error$: Observable<string|undefined>;

  /**
   * Manually create a Form Dialog.
   * It is recommended to the `FormDialog.Create<T>()` or `FormDialog.Update<T>()` when creating a Form Dialog.
   * @param template - The Form Template
   * @param type - The type of dialog
   * @param settings - Settings
   */
  constructor(template: FormGroupControls<TValue>, type: 'create'|'update', settings: Settings<TValue>) {
    this._form = FormRootConstructors.Model<TValue>(template);
    this.createForm = type === 'create';
    this.onSubmit = settings.onSubmit;
    this.title = settings.title;
    this.description = settings.description;
    this.buttonText = settings.buttonText ?? (this.createForm ? 'Create' : 'Save');
    this.submitOnEnter = settings.submitOnEnter ?? true;

    const error$ = settings.validate
      ? this.form.throttledValue$.pipe(map(x => settings.validate!(x) ?? undefined))
      : of(undefined);
    this.error$ = error$.pipe(persistentCache());

    this.valid$ = this.error$.pipe(
      switchMap(error => error ? of(false) : this.createForm ? this.form.canCreate$ : this.form.canSubmit$),
      persistentCache()
    );
  }

  /**
   * Start the dialog.
   * This will reset and show the dialog.
   * @param reset - Optional reset data
   */
  start(reset?: DeepPartial<TValue>) {
    this.form.reset(reset);
    this._show$.next(true);
  }

  /**
   * Close the dialog
   */
  close() {
    this._show$.next(false);
  }

  /**
   * Submit the form Dialog with the current values
   */
  async submit() {
    if (this.working) return;
    const valid = await firstValueFrom(this.valid$);
    if (!valid) return;

    this._working$.next(true);

    try {

      let result = this.onSubmit(this.form.getRawValue());

      if (result instanceof Observable) {
        result = lastValueFrom(result);
      }

      if (result instanceof Promise) {
        await result;
      }

      this._show$.next(false);

    } finally {
      this._working$.next(false);
    }

  }

}

interface Settings<T> {
  /** The action to perform when submitting the form */
  onSubmit: (data: T) => Promise<any>|Observable<any>|void;
  /** The title of the dialog */
  title: string;
  /** The description for the dialog */
  description?: string;
  /** The text to show on the submit button. Defaults to 'Submit' */
  buttonText?: string;
  /** Optional validation for the form. Return a string when an error is present */
  validate?: (data: DeepPartial<T>) => string|void;
  /** Whether to have enter submit the form */
  submitOnEnter?: boolean;
}

class FormDialogFactory<TGuide extends Record<string, any>> {
  constructor(private type: 'create'|'update') {

  }

  /**
   * Define the dialog form using a strict template
    * @param template - The template
   */
  withTemplate(template: FormGroupTemplate<TGuide>): FormDialogConfig<TGuide> {
    return new FormDialogConfig(this.type, formTemplateToControls(template));
  }

  /**
   * Define the dialog form using a strict template with keys omitted
   * @param template - The template
   */
  withModifiedTemplate<TOmit extends keyof TGuide>(template: FormGroupTemplate<Omit<TGuide, TOmit>>): FormDialogConfig<Omit<TGuide, TOmit>> {
    return new FormDialogConfig(this.type, formTemplateToControls(template));
  }

  /**
   * Define the dialog form using a strict template
   * @param template - The template
   */
  withForm(template: FormGroupTemplate<TGuide>): FormDialogConfig<TGuide>;
  /**
   * Define the dialog form using a loose template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  withForm<TTemplate extends FormGroupTemplate<DeepPartial<TGuide>>>(template: TTemplate): FormDialogConfig<FormGroupTemplateValue<TTemplate>>;
  withForm<T extends Record<string, any>>(template: FormGroupTemplate<T>): FormDialogConfig<T> {
    return new FormDialogConfig<T>(
      this.type,
      formTemplateToControls(template)
    );
  }

  /**
   * Define the form controls for the Dialog strictly based on the type
   * @param controls - The controls
   */
  withControls(controls: FormGroupControls<TGuide>): FormDialogConfig<TGuide>;
  /**
   * Define the form controls for the Dialog loosely based on the type.
   * This sacrifices type conciseness for flexibility.
   * @param controls - The controls
   */
  withControls<TControls extends FormGroupControls<DeepPartial<TGuide>>>(controls: TControls): FormDialogConfig<FormGroupValueRaw<TControls>>;
  withControls<T extends Record<string, any>>(controls: FormGroupControls<T>): FormDialogConfig<T> {
    return new FormDialogConfig<T>(
      this.type,
      controls
    );
  }

}

class FormDialogConfig<TValue extends Record<string, any>> {

  constructor(private type: 'create'|'update', private controls: FormGroupControls<TValue>) {

  }

  /**
   * Configure the dialog
   * @param settings
   */
  configure(settings: Settings<TValue>) {
    return new FormDialog<TValue>(this.controls, this.type, settings)
  }
}
