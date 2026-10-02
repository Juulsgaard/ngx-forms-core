import {computed, signal, Signal, untracked, WritableSignal} from "@angular/core";
import {
    FormInputEvent,
    FormInputOptions,
    FormInputType,
    InputEvents,
    InputFocusOptions,
    InputTypes
} from "./form-input.types";
import {compareLists, compareValues} from "../../tools/helpers";
import {asapScheduler, asyncScheduler, Observable, Subject, Subscription} from "rxjs";
import {FormValidationContext, FormValidator, processFormValidators, validationData} from "../../tools/form-validation";
import {IFormInput} from "./form-input.interface";
import {FormNode} from "../node/form-node";

export class FormInput<T> extends FormNode<T> implements IFormInput<T> {

  readonly label?: string;
  readonly autocomplete?: string;
  readonly tooltip?: string;
  readonly readonly?: boolean;
  readonly autoFocus?: boolean;
  readonly showDisabledField?: boolean;
  readonly required: boolean;

  private readonly _actions$ = new Subject<FormInputEvent>();
  /** An observable emitting input actions */
  readonly actions$: Observable<FormInputEvent> = this._actions$.asObservable();

  override readonly errors: Signal<string[]>;
  override readonly errorState: Signal<FormValidationContext[]>;

  override readonly warnings: Signal<string[]>;
  override readonly warningState: Signal<FormValidationContext[]>;

  override readonly changed: Signal<boolean>;

  private readonly _touched = signal(false);
  override readonly touched: Signal<boolean> = this._touched.asReadonly();

  override readonly valid = computed(() => !this.hasError());

  private readonly _state: WritableSignal<T|undefined>;
  readonly state: Signal<T|undefined>;
  readonly rawValue: Signal<T|undefined>;
  readonly value: Signal<T>;

  readonly empty: Signal<boolean> = computed(() => this.state() == null);

  private readonly _resetState: WritableSignal<T|undefined>;
  readonly resetState: Signal<T|undefined>;

  private readonly _resetValue: WritableSignal<T>;
  readonly resetValue: Signal<T>;

  private readonly _debouncedState: WritableSignal<T|undefined>;
  readonly debouncedState: Signal<T|undefined>;
  readonly debouncedRawValue: Signal<T|undefined>;
  readonly debouncedValue: Signal<T>;

  /**
   * Create a Form Node manually.
   * It is recommended to use the `Form.xxx` constructors for configuring Form Nodes.
   * @param type - The type of the input
   * @param defaultValue - The default value of the input.
   * This input is used as a fallback for missing values.
   * @param initialValue - The initial value of the input.
   * This is used for initial setup and resetting the input.
   * Defaults to defaultValue.
   * @param nullable - Whether the input is nullable
   * @param disabledDefault - A default value for when the input is disabled
   * @param errorValidators - Error validators
   * @param warningValidators - Warning validators
   * @param options - Additional options
   */
  constructor(
    readonly type: FormInputType,
    nullable: boolean,
    readonly defaultValue: T,
    readonly initialValue?: T,
    readonly disabledDefault?: T,
    protected readonly errorValidators: FormValidator<T>[] = [],
    protected readonly warningValidators: FormValidator<T>[] = [],
    protected readonly options: FormInputOptions = {}
  ) {
    super(nullable, !!options.disabled);

    this.required = !!options.required;
    this.label = options.label;
    this.autocomplete = options.autocomplete;
    this.tooltip = options.tooltip;
    this.readonly = options.readonly;
    this.autoFocus = options.autoFocus;
    this.showDisabledField = options.showDisabledField;

    this._state = signal(initialValue);
    this.state = this._state.asReadonly();
    this.rawValue = computed(() => this.getRawValue(this.state));
    this.value = computed(() => this.getValue(this.rawValue));

    this._debouncedState = signal(initialValue);
    this.debouncedState = this._debouncedState.asReadonly();
    this.debouncedRawValue = computed(() => this.getRawValue(this.debouncedState));
    this.debouncedValue = computed(() => this.getValue(this.debouncedRawValue));

    this._resetState = signal(untracked(this.state));
    this.resetState = this._resetState.asReadonly();

    this._resetValue = signal(untracked(this.value));
    this.resetValue = this._resetValue.asReadonly();

    this.changed = computed(() => !compareValues(this.resetValue(), this.value()));

    this.errors = computed(() => Array.from(this.getErrors(this.debouncedRawValue)), {equal: compareLists<string>});
    this.errorState = computed(() => this.errors().map(x => validationData(x, this)));

    this.warnings = computed(() => Array.from(this.getWarnings(this.debouncedRawValue)), {equal: compareLists<string>});
    this.warningState = computed(() => this.warnings().map(x => validationData(x, this)));
  }

  //<editor-fold desc="Actions">
  public override markAsTouched(): void {
    this._touched.set(true);
  }

  public override markAsUntouched(): void {
    this._touched.set(false);
  }

  /**
   * Focus the input
   * @param options - Additional options
   */
  focus(options?: InputFocusOptions) {
    setTimeout(() => {
      this._actions$.next(InputEvents.Focus);
      if (options?.selectValue) this._actions$.next(InputEvents.Select);
      if (options?.scroll) this._actions$.next(InputEvents.ScrollTo);
    }, 0);
  }

  scrollTo() {
    this._actions$.next(InputEvents.ScrollTo);
  }

  /** Toggle the input value if boolean */
  public toggle() {
    if (this.type !== InputTypes.Bool) {
      console.error('You cannot toggle a non boolean value');
      return;
    }

    this.setValue(!untracked(this.value) as any);
  }
  //</editor-fold>

  //<editor-fold desc="Processing">
  private getRawValue(state: Signal<T|undefined>) {
    if (this.disabled()) return this.defaultValue;
    return state();
  }

  private getValue(rawValue: Signal<T|undefined>): T {
    const value = rawValue();
    if (value != null) return value;
    if (this.nullable) return value as T;
    return this.defaultValue;
  }

  getDisabledValue(): T {
    const value = this.disabledDefault;
    if (value != null) return value;
    if (this.nullable) return value as T;
    return this.defaultValue;
  }

  private *getErrors(rawValue: Signal<T|undefined>): Generator<string> {
    if (this.disabled()) return [];
    const value = rawValue();

    if (value == null) {
      if (this.required) return yield 'This field is required';
      // If no value is present, don't process validators
      if (!this.nullable) return;
    }

    yield* processFormValidators(this.errorValidators, value as T);
  }

  private *getWarnings(rawValue: Signal<T|undefined>): Generator<string> {
    const value = rawValue();

    // If no value is present, don't process validators
    if (value == null && !this.nullable) return;

    yield* processFormValidators(this.warningValidators, value as T);
  }
  //</editor-fold>

  //<editor-fold desc="State Update">
  private static debounceTimeout = 200;
  private _grace?: Subscription;
  private _timeout?: Subscription;
  private _pendingValue?: {value: T|undefined};

  private resetTimeout() {
    this._grace?.unsubscribe();
    this._grace = undefined;
    this._timeout?.unsubscribe();
    this._timeout = undefined;
    this._pendingValue = undefined;
  }

  /** Update the internal state of the Node */
  protected updateState(value: T|undefined, instant = false) {
    this._state.set(value);

    // If update is instant then update signal immediately and cancel timeouts
    if (instant) {
      this._debouncedState.set(value);
      this.resetTimeout();
      return;
    }

    // If timeout is active, store value and reset timer (debounce)
    if (this._timeout) {
      this._pendingValue = {value};
      this.startTimeout();
      return;
    }

    // If there is no timeout then update the state
    this._debouncedState.set(value);
    if (this._grace) return;

    // If there is no active grace period (time for sync updates before the timeout starts), create one
    this._grace = asapScheduler.schedule(() => {
      this.startTimeout();
      this._grace = undefined;
    });
  }

  private startTimeout() {
    this._timeout?.unsubscribe();

    this._timeout = asyncScheduler.schedule(() => {
      this._timeout = undefined;

      if (!this._pendingValue) return;
      this._debouncedState.set(this._pendingValue.value);

      this.startTimeout();
    }, FormInput.debounceTimeout);
  }
  //</editor-fold>

  //<editor-fold desc="Mutation">

  /**
   * Update the value of the Node
   * @param value - The new value of the node
   */
  setValue(value: T|undefined) {
    this.updateState(value);
  }

  /**
   * Reset the node
   * @param value - An optional reset value
   */
  override reset(value?: T) {
    this.updateState(value ?? this.initialValue, true);
    super.reset();
    this._resetState.set(untracked(this.state));
    this._resetValue.set(untracked(this.value));
  }

  override clear() {
    this.updateState(this.initialValue, true);
  }

  //</editor-fold>

  /**
   * Clone the input
   * This creates a duplicate of the configuration
   * It does not clone the value
   */
  override clone(): IFormInput<T> {
    return new FormInput<T>(
      this.type,
      this.nullable,
      this.defaultValue,
      this.initialValue,
      this.disabledDefault,
      this.errorValidators,
      this.warningValidators,
      {...this.options}
    )
  }

  override rollback() {
    this.updateState(untracked(this.resetState), true);
  }

  private _isValid = computed(() => this.getErrors(this.rawValue).next().done === true);
  isValid(): boolean {
    return untracked(this._isValid);
  }

  getValidValue(): T {
    if (!this.isValid()) throw Error('The value is invalid');
    return untracked(this.value);
  }

  getValidValueOrDefault<TDefault>(defaultVal: TDefault): T | TDefault;
  getValidValueOrDefault(): T | undefined;
  getValidValueOrDefault<TDefault>(defaultVal?: TDefault): T | TDefault | undefined {
    if (!this.isValid()) return defaultVal;
    return untracked(this.value);
  }
}
