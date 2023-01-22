import {DeepPartial, isObject, SimpleObject} from "@consensus-labs/ts-tools";
import {BehaviorSubject, distinctUntilChanged, Observable, of, Subscribable, switchMap} from "rxjs";
import {ILoadingState, latestValueFromOrDefault, Loading} from "@consensus-labs/rxjs-tools";
import {inject} from "@angular/core";
import {FormGroupControls} from "../tools/form-types";
import {formUpdated} from "../tools/form-population";
import {FormRootConstructors, ModelFormRoot} from "../forms/form-root";
import {FormPageFactory} from "./form-page-factory";
import {FormConfirmService} from "./form-confirm.service";
import {FormPageAction, FormPageOptions, WarningDialog} from "./form-page-config";

export class FormPage<TVal extends SimpleObject> {

  public static Edit<T extends Record<string, any>>(): FormPageFactory<T> {
    return new FormPageFactory<T>('update');
  }

  public static Create<T extends Record<string, any>>(): FormPageFactory<T> {
    return new FormPageFactory<T>('create');
  }

  form: ModelFormRoot<TVal>;

  private _submitting$ = new BehaviorSubject<ILoadingState>(Loading.Empty());
  readonly submitting$ = this._submitting$.pipe(switchMap(x => x.loading$), distinctUntilChanged());

  get submitting() {
    return this._submitting$.value.loading
  }

  submitError$ = this._submitting$.pipe(switchMap(x => x.error$), distinctUntilChanged());

  private _deleting$ = new BehaviorSubject<ILoadingState>(Loading.Empty());
  readonly deleting$ = this._deleting$.pipe(switchMap(x => x.loading$), distinctUntilChanged());

  get deleting() {
    return this._deleting$.value.loading
  }

  readonly hasSubmit: boolean;
  readonly showSubmit$: Subscribable<boolean>;
  readonly canSubmit$: Observable<boolean>;
  private readonly getCanSubmit: () => boolean;

  get canSubmit() {
    return this.getCanSubmit()
  }

  readonly hasDelete: boolean;
  readonly showDelete$: Subscribable<boolean>;

  //<editor-fold desc="Options">
  private readonly onSubmit?: FormPageAction<TVal>;
  public readonly submitBtnText: string;
  private readonly submitWarning?: (value: TVal) => WarningDialog;
  private readonly canEdit$?: Subscribable<boolean>;

  private readonly onDelete?: FormPageAction<TVal>;
  public readonly deleteBtnText: string;
  private readonly deleteWarning?: (value: TVal) => WarningDialog;
  private readonly canDelete$?: Subscribable<boolean>;

  private readonly getError?: (value: DeepPartial<TVal>) => string | void;
  private readonly getWarning?: (value: DeepPartial<TVal>) => string | void;

  private readonly warningService?: FormConfirmService;

  //</editor-fold>

  constructor(
    type: 'create' | 'update',
    controls: FormGroupControls<TVal>,
    options: FormPageOptions<TVal>
  ) {
    this.form = FormRootConstructors.Model<TVal>(controls);

    this.hasSubmit = !!options.onSubmit;
    this.hasDelete = !!options.onDelete;

    this.canSubmit$ = !this.hasSubmit
      ? of(false)
      : type === 'update'
        ? this.form.canSubmit$
        : this.form.canCreate$;

    this.showSubmit$ = !this.hasSubmit
      ? of(false)
      : options.canEdit$ ?? of(true);

    this.getCanSubmit = !this.hasSubmit
      ? () => false
      : type === 'update'
        ? () => this.form.canSubmit
        : () => this.form.canCreate;

    this.showDelete$ = !this.hasDelete
      ? of(false)
      : options.canDelete$ ?? of(true);

    this.onSubmit = options.onSubmit;
    this.submitBtnText = options.submitBtnText;
    this.submitWarning = options.submitWarning;
    this.canEdit$ = options.canEdit$;
    this.onDelete = options.onDelete;
    this.deleteBtnText = options.deleteBtnText;
    this.deleteWarning = options.deleteWarning;
    this.canDelete$ = options.canDelete$;
    this.getError = options.getError;
    this.getWarning = options.getWarning;

    // If needed, get warning rendering service
    if (this.submitWarning || this.deleteWarning) {
      this.warningService = options.warningService;

      // If not provided, try to inject the service
      if (!this.warningService) {
        try {
          this.warningService = inject(FormConfirmService);
          if (!this.warningService) {

          }
        } catch (e: unknown) {
          if (isObject(e) && 'name' in e) {

            if (e.name === 'NullInjectorError') {
              console.error('Form warning rendering could not be injected, and was not provided to config');
              return;
            }

          }

          console.error(
            'Form Page warnings can only be setup in a constructor, initializer or by manually providing a confirmation renderer using `renderWarnings`');
        }
      }
    }
  }

  update(value: DeepPartial<TVal> | undefined) {
    const changed = formUpdated(this.form, value);
    if (!changed) return;
    this.form.reset(value);
  }

  async submit() {
    if (!this.canSubmit) return;
    if (this.submitting) return;
    if (!this.onSubmit) return;

    if (this.canEdit$) {
      const canEdit = latestValueFromOrDefault(this.canEdit$, undefined);
      if (canEdit === false) return;
    }

    const value = this.form.getRawValue();

    if (this.submitWarning) {
      if (!this.warningService) {
        console.error('Could not render submission warning');
        return;
      }

      const warning = this.submitWarning(value)

      const confirmed = this.warningService.confirmSubmit(
        warning.title,
        warning.text,
        warning.btnText ?? this.submitBtnText
      );
      if (!confirmed) return;
    }

    const submit = this.onSubmit;
    const state = execute(() => submit(value));
    this._submitting$.next(state);
    await state;
  }

  async delete() {
    if (this.deleting) return;
    if (!this.onDelete) return;

    if (this.canDelete$) {
      const canDelete = latestValueFromOrDefault(this.canDelete$, undefined);
      if (canDelete === false) return;
    }

    const value = this.form.getRawValue();

    if (this.deleteWarning) {
      if (!this.warningService) {
        console.error('Could not render deletion warning');
        return;
      }

      const warning = this.deleteWarning(value);

      const confirmed = await this.warningService.confirmDelete(
        warning.title,
        warning.text,
        warning.btnText ?? this.deleteBtnText
      );
      if (!confirmed) return;
    }

    const doDelete = this.onDelete;
    const state = execute(() => doDelete(value));
    this._deleting$.next(state);
    await state;
  }
}

function execute(action: () => Promise<any> | Subscribable<any> | void): ILoadingState {
  try {
    const result = action();
    if (!result) return Loading.Empty();
    return Loading.Async(result);
  } catch (e: unknown) {
    return Loading.FromError(e instanceof Error ? e : Error(e?.toString()));
  }
}

