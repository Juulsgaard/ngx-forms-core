import {computed, signal, Signal, WritableSignal} from "@angular/core";
import {FormValidator, processFormValidators} from "../tools/form-validation";
import {AnonFormNode, FormNodeOptions, FormNodeType, InputTypes} from "./anon-form-node";
import {FormValidationData} from '../tools/form-types';
import {compareLists, compareValues} from "../tools/helpers";

export class FormNode<T> extends AnonFormNode {

  override readonly errors: Signal<string[]>;
  override readonly errorState: Signal<FormValidationData[]>;

  override readonly warnings: Signal<string[]>;
  override readonly warningState: Signal<FormValidationData[]>;

  override readonly changed: Signal<boolean>;

  private readonly _touched = signal(false);
  override readonly touched: Signal<boolean> = this._touched.asReadonly();

  override readonly valid = computed(() => !this.hasError());

  protected readonly _state: WritableSignal<T|undefined>;
  override readonly state: Signal<T|undefined>;
  override readonly rawValue: Signal<T|undefined>;
  override readonly value: Signal<T>;
  protected readonly resetValue: WritableSignal<T>;

  declare readonly nullable: undefined extends T ? boolean : false;
  declare readonly defaultValue: T;
  declare readonly initialValue: T;

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
    type: FormNodeType,
    nullable: undefined extends T ? boolean : false,
    defaultValue: T,
    initialValue?: T,
    readonly disabledDefault?: T,
    protected readonly errorValidators: FormValidator<T>[] = [],
    protected readonly warningValidators: FormValidator<T>[] = [],
    options: FormNodeOptions = {}
  ) {
    super(type, defaultValue, initialValue, nullable, options);

    this._state = signal(initialValue);
    this.state = this._state.asReadonly();
    this.rawValue = computed(() => this.getRawValue());
    this.value = computed(() => this.getValue());
    this.resetValue = signal(this.value());

    this.changed = computed(() => compareValues(this.resetValue(), this.value()));

    this.errors = computed(() => this.getErrors(), {equal: compareLists<string>});
    this.errorState = computed(() => this.errors().map(x => ({message: x, path: []})));

    this.warnings = computed(() => this.getWarnings(), {equal: compareLists<string>});
    this.warningState = computed(() => this.warnings().map(x => ({message: x, path: []})));
  }

  //<editor-fold desc="Actions">
  public override markAsTouched(): void {
    this._touched.set(true);
  }

  public override markAsUntouched(): void {
    this._touched.set(false);
  }

  public override toggle() {
    if (this.type !== InputTypes.Bool) {
      console.error('You cannot toggle a non boolean value');
      return;
    }

    this.setValue(!this.value as any);
  }
  //</editor-fold>

  //<editor-fold desc="Processing">
  private getRawValue() {
    if (this.disabled()) return this.defaultValue;
    return this.state();
  }

  private getValue(): T {
    const value = this.rawValue();
    if (value != null) return value;
    if (this.nullable) return value as T;
    return this.defaultValue;
  }

  override getDisabledValue(): T {
    const value = this.disabledDefault;
    if (value != null) return value;
    if (this.nullable) return value as T;
    return this.defaultValue;
  }

  private getErrors(): string[] {
    if (this.disabled()) return [];
    const value = this.rawValue();

    if (value == null) {
      if (this.required) return ['This field is required'];
      // If no value is present, don't process validators
      if (!this.nullable) return [];
    }

    return processFormValidators(this.errorValidators, value as T);
  }

  private getWarnings(): string[] {
    const value = this.rawValue();

    // If no value is present, don't process validators
    if (value == null && !this.nullable) return [];

    return processFormValidators(this.errorValidators, value as T);
  }
  //</editor-fold>

  //<editor-fold desc="Implementation">
  private getValueOrDefault(value: T|undefined): T {
    if (this.nullable) return value as T;
    return value ?? this.defaultValue;
  }

  private getValueOrInitial(value: T|undefined): T {
    if (this.nullable) return value as T;
    return value ?? this.initialValue;
  }

  /**
   * Update the value of the Node
   * @param value - The new value of the node
   */
  setValue(value: T|undefined) {
    this._state.set(value);
  }

  /**
   * Reset the node
   * @param value - An optional reset value
   */
  override reset(value?: T) {
    this._state.set(value ?? this.initialValue);
    super.reset();
    this.resetValue.set(this.value());
  }

  override clear() {
    this.setValue(this.initialValue);
  }

  //</editor-fold>

  /**
   * Clone the input
   * This creates a duplicate of the configuration
   * It does not clone the value
   */
  override clone(): FormNode<T> {
    return new FormNode<T>(
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
    this.setValue(this.resetValue());
  }
}
