import {DeepPartial, isFunction, SimpleObject} from "@juulsgaard/ts-tools";
import {startWith, Subject, Subscribable, switchMap, Unsubscribable} from "rxjs";
import {ILoadingState, Loading} from "@juulsgaard/rxjs-tools";
import {
  assertInInjectionContext, computed, DestroyRef, effect, EffectRef, inject, Injector, isSignal, signal, Signal,
  untracked
} from "@angular/core";
import {willAlterForm} from "../tools";
import {FormRoot, FormUnit, ModelFormRoot} from "../forms";
import {FormConfirmService} from "./form-confirm.service";
import {FormPageAction, FormPageOptions, WarningDialog} from "./form-page-config";
import {formRoot} from "../constructors";
import {FormGroupControls} from "../types";
import {toSignal} from "@angular/core/rxjs-interop";

export abstract class BaseFormPage<TControls extends Record<string, FormUnit>, TVal extends SimpleObject> {

  abstract readonly form: FormRoot<TControls, TVal>;
  abstract readonly controls: Signal<TControls>;
  abstract readonly value: Signal<TVal>;

  private readonly _submitting$ = new Subject<ILoadingState>();
  readonly submitting: Signal<boolean>;
  readonly submitError: Signal<Error | undefined>;

  private readonly _deleting$ = new Subject<ILoadingState>();
  readonly deleting: Signal<boolean>;
  readonly deleteError: Signal<Error | undefined>;

  readonly hasSubmit: boolean;
  readonly showSubmit: Signal<boolean>;
  readonly canSubmit: Signal<boolean>;

  readonly hasDelete: boolean;
  readonly showDelete: Signal<boolean>;

  //<editor-fold desc="Options">
  private readonly onSubmit?: FormPageAction<TVal>;
  public readonly submitBtnText: string;
  private readonly submitWarning?: (value: TVal) => WarningDialog;

  private readonly onDelete?: FormPageAction<TVal>;
  public readonly deleteBtnText: string;
  private readonly deleteWarning?: (value: TVal) => WarningDialog;

  private readonly warningService?: FormConfirmService;
  private readonly injector?: Injector;

  private requireInjector(): Injector | undefined {
    if (this.injector) return this.injector;
    assertInInjectionContext(BaseFormPage);
    return undefined;
  }

  //</editor-fold>

  protected constructor(
    type: 'create' | 'update',
    options: FormPageOptions<TVal>
  ) {

    this.warningService = options.warningService;

    this.onSubmit = options.onSubmit;
    this.submitBtnText = options.submitBtnText;
    this.submitWarning = options.submitWarning;

    this.onDelete = options.onDelete;
    this.deleteBtnText = options.deleteBtnText;
    this.deleteWarning = options.deleteWarning;

    this.hasSubmit = !!this.onSubmit;
    this.canSubmit = computed(() => {
      if (!this.hasSubmit) return false;
      return type === 'update' ? this.form.canUpdate() : this.form.canCreate();
    });
    this.showSubmit = !this.hasSubmit ? signal(false) :
      options.canSubmit == null ? signal(true) :
        isSignal(options.canSubmit) ? options.canSubmit :
          toSignal(options.canSubmit, {injector: this.requireInjector(), initialValue: false});

    this.hasDelete = !!options.onDelete;
    this.showDelete = !this.hasDelete ? signal(false) :
      options.canDelete == null ? signal(true) :
        isSignal(options.canDelete) ? options.canDelete :
          toSignal(options.canDelete, {injector: this.requireInjector(), initialValue: false});

    this.submitting = toSignal(
      this._submitting$.pipe(switchMap(x => x.loading$)),
      {initialValue: false, manualCleanup: true}
    );
    this.submitError = toSignal(
      this._submitting$.pipe(switchMap(x => x.error$.pipe(startWith(undefined)))),
      {initialValue: undefined, manualCleanup: true}
    );

    this.deleting = toSignal(
      this._deleting$.pipe(switchMap(x => x.loading$)),
      {initialValue: false, manualCleanup: true}
    );
    this.deleteError = toSignal(
      this._deleting$.pipe(switchMap(x => x.error$.pipe(startWith(undefined)))),
      {initialValue: undefined, manualCleanup: true}
    );

    // If needed, get warning rendering service
    if (this.submitWarning || this.deleteWarning) {
      if (!this.warningService) {
        this.warningService = this.requireInjector()?.get(FormConfirmService) ?? inject(FormConfirmService);
      }
    }
  }

  update(value: DeepPartial<TVal> | TVal | undefined) {
    const changed = willAlterForm(this.form, value);
    if (!changed) return;
    this.form.reset(value);
  }

  /** Update the form from a signal */
  updateFrom(
    values: Signal<DeepPartial<TVal>|undefined> | Signal<TVal|undefined>,
    options?: FormPageUpdateOptions
  ): EffectRef;
  /** Update the form from a computation (tracked) */
  updateFrom(
    values: (() => DeepPartial<TVal>|undefined) | (() => TVal|undefined),
    options?: FormPageUpdateOptions
  ): EffectRef;
  /** Update the form from a subscribable */
  updateFrom(
    values: Subscribable<DeepPartial<TVal>|undefined> | Subscribable<TVal|undefined>,
    options?: FormPageUpdateOptions
  ): Unsubscribable;
  updateFrom(
    values: (() => DeepPartial<TVal>|undefined) | (() => TVal|undefined) | Subscribable<DeepPartial<TVal>|undefined> | Subscribable<TVal|undefined>,
    options?: FormPageUpdateOptions
  ): EffectRef | Unsubscribable {

    if (isFunction(values)) {
      if (!options?.injector) assertInInjectionContext(this.updateFrom);

      return effect(
        () => this.update(values()),
        {allowSignalWrites: true, injector: options?.injector, manualCleanup: options?.manualCleanup}
      );
    }

    if (options?.manualCleanup && !options?.injector) assertInInjectionContext(this.updateFrom);

    const sub = values.subscribe({next: v => this.update(v)});

    if (options?.manualCleanup) {
      const destroy = options.injector?.get(DestroyRef) ?? inject(DestroyRef);
      destroy.onDestroy(() => sub.unsubscribe());
    }

    return sub;
  }

  //<editor-fold desc="Submit">
  submit(): ILoadingState {
    if (!this.showSubmit()) return Loading.Empty();
    if (!this.canSubmit()) return Loading.Empty();
    if (this.submitting()) return Loading.Empty();

    if (!this.form.isValid()) return Loading.Empty();

    return Loading.Async(this.submitAsync());
  }

  private async submitAsync() {

    const value = this.form.getValidValue();

    const shouldSubmit = await this.shouldSubmit(value);
    if (!shouldSubmit) return;

    const submit = this.onSubmit!;
    const state = execute(() => submit(value));
    this._submitting$.next(state);

    await state;
  }

  private async shouldSubmit(value: TVal) {
    if (!this.submitWarning) return true;

    if (!this.warningService) {
      console.error('Could not render submission warning');
      throw Error('Could not render submission warning');
    }

    const warning = this.submitWarning(value)
    return await this.warningService.confirmSubmit(warning);
  }
  //</editor-fold>

  //<editor-fold desc="Delete">
  delete(): ILoadingState {
    if (!this.showDelete()) return Loading.Empty();
    if (this.deleting()) return Loading.Empty();

    return Loading.Async(this.deleteAsync());
  }

  private async deleteAsync() {
    const value = untracked(this.form.value);

    const shouldDelete = await this.shouldDelete(value);
    if (!shouldDelete) return;

    const doDelete = this.onDelete!;
    const state = execute(() => doDelete(value));
    this._deleting$.next(state);

    await state;
  }

  private async shouldDelete(value: TVal) {
    if (!this.deleteWarning) return true;

    if (!this.warningService) {
      console.error('Could not render deletion warning');
      throw Error('Could not render deletion warning');
    }

    const warning = this.deleteWarning(value);
    return await this.warningService.confirmDelete(warning);
  }
  //</editor-fold>
}

export class FormPage<TVal extends SimpleObject> extends BaseFormPage<FormGroupControls<TVal>, TVal> {

  readonly controls: Signal<FormGroupControls<TVal>>;
  readonly form: ModelFormRoot<TVal>;
  readonly value: Signal<TVal>;


  constructor(type: "create" | "update", controls: FormGroupControls<TVal>, options: FormPageOptions<TVal>) {
    super(type, options);

    this.form = formRoot.model<TVal>(
      controls,
      {
        errors: options.errorValidators,
        warnings: options.warningValidators
      }
    );

    this.controls = this.form.controls;
    this.value = this.form.value;
  }
}

function execute(action: () => Promise<any> | Subscribable<any> | ILoadingState | void): ILoadingState {
  try {
    const result = action();
    if (result instanceof ILoadingState) return result;
    if (!result) return Loading.Empty();
    return Loading.Async(result);
  } catch (e: unknown) {
    const error = e instanceof Error ? e : Error(e?.toString());
    return Loading.FromError(() => error);
  }
}

interface FormPageUpdateOptions {
  manualCleanup?: boolean;
  injector?: Injector;
}
