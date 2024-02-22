import {BehaviorSubject, firstValueFrom, lastValueFrom, Observable, of, switchMap} from "rxjs";
import {map} from "rxjs/operators";
import {DeepPartial} from "@juulsgaard/ts-tools";
import {ILoadingState, persistentCache} from "@juulsgaard/rxjs-tools";
import {FormGroupControls} from "../tools/form-types";
import {FormRootConstructors, ModelFormRoot} from "../forms/form-root";
import {FormDialogOptions} from "./form-dialog-config";
import {subjectToSignal} from "../tools/signals";
import {computed, Signal} from "@angular/core";

export class FormDialog<TValue extends Record<string, any>> {

  private readonly _form: ModelFormRoot<TValue>;
  /** The form of the dialog */
  get form(): ModelFormRoot<TValue> {return this._form}

  /** The value of the dialog form */
  get value(): TValue {return this.form.getRawValue()}
  /** The dialog form controls */
  get controls(): FormGroupControls<TValue> {return this.form.controls};

  private _show$ = new BehaviorSubject(false);
  /** An observable denoting when to show the dialog */
  show$ = this._show$.asObservable();
  /** A signal denoting when to show the dialog */
  showSignal = subjectToSignal(this._show$);
  /** Whether the dialog should be shown */
  get show(): boolean {return this._show$.value}

  private _working$ = new BehaviorSubject(false);
  /** An observable denoting that the submission is in progress */
  working$ = this._working$.asObservable();
  /** A signal denoting that the submission is in progress */
  workingSignal = subjectToSignal(this._working$);
  /** Whether the submission is currently in progress */
  get working(): boolean {return this._working$.value}

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

  /** An observable containing a display string for the error state when errors are present */
  error$: Observable<string|undefined>;
  /** A signal containing a display string for the error state when errors are present */
  errorSignal: Signal<string|undefined>;

  /** An observable denoting when the form is valid for submission */
  valid$: Observable<boolean>;
  /** A signal denoting when the form is valid for submission */
  validSignal: Signal<boolean>;


  /**
   * Manually create a Form Dialog.
   * It is recommended to the `FormDialog.Create<T>()` or `FormDialog.Update<T>()` when creating a Form Dialog.
   * @param template - The Form Template
   * @param type - The type of dialog
   * @param settings - Settings
   */
  constructor(template: FormGroupControls<TValue>, type: 'create'|'update', settings: FormDialogOptions<TValue>) {
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

    this.errorSignal = computed(() => {
      if(!settings.validate) return undefined;
      return settings.validate(this.form.valueSignal()) ?? undefined;
    });

    this.validSignal = computed(() => {
      if (this.errorSignal()) return false;
      return this.createForm ? this.form.canCreateSignal() : this.form.canSubmitSignal();
    });
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

      if (result instanceof ILoadingState) {
        await result;
        return;
      }

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

