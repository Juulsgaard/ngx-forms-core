import {FormUnit} from "./form-unit";
import {DeepPartial, mapObj, SimpleObject} from "@juulsgaard/ts-tools";
import {AnonFormLayer} from "./anon-form-layer";
import {computed, signal, Signal, untracked, WritableSignal} from "@angular/core";
import {compareLists} from "../tools/helpers";
import {
  FormValidationContext, FormValidator, prependValidationPath, processFormValidators, validationData
} from "../tools/form-validation";
import {FormNode} from "./form-node";
import {FormList} from "./form-list";
import {FormGroupControls, FormGroupValue} from "../types";


export class FormLayer<TControls extends Record<string, FormUnit>, TValue extends SimpleObject|undefined> extends AnonFormLayer {

  override readonly value: Signal<TValue>;
  override readonly rawValue: Signal<DeepPartial<TValue> | undefined>;

  override readonly resetValue: Signal<TValue>;

  override readonly debouncedValue: Signal<TValue>;
  override readonly debouncedRawValue: Signal<DeepPartial<TValue> | undefined>;

  override readonly changed: Signal<boolean>;
  override readonly touched: Signal<boolean>;

  override readonly valid = computed(() => !this.hasError() && Object.values(this.controls()).every(x => x.valid()));

  override readonly errorState: Signal<FormValidationContext[]>;
  override readonly errors: Signal<string[]>;

  override readonly warningState: Signal<FormValidationContext[]>;
  override readonly warnings: Signal<string[]>;

  private readonly _controls: WritableSignal<TControls>;
  override readonly controls: Signal<TControls>;

  declare readonly nullable: undefined extends TValue ? boolean : false;

  constructor(
    controls: TControls,
    nullable: undefined extends TValue ? boolean : false = false,
    readonly disabledDefaultValue?: TValue,
    protected readonly disabledByDefault = false,
    protected readonly errorValidators: FormValidator<TValue>[] = [],
    protected readonly warningValidators: FormValidator<TValue>[] = [],
    protected readonly postConfiguration: ((config: FormLayer<TControls, TValue>) => void)[] = []
  ) {
    super(nullable, disabledByDefault);

    this._controls = signal(controls);
    this.controls = this._controls.asReadonly();

    this.rawValue = computed(() => this.getRawValue(x => x.rawValue));
    this.value = computed(() => this.getValue(x => x.value));

    this.debouncedRawValue = computed(() => this.getRawValue(x => x.debouncedRawValue));
    this.debouncedValue = computed(() => this.getValue(x => x.debouncedValue));

    this.resetValue = computed(() => this.processControls(x => x.resetValue()) as TValue);

    this.changed = computed(() => Object.values(this.controls()).some(x => x.changed()));
    this.touched = computed(() => Object.values(this.controls()).some(x => x.touched()));

    this.errors = computed(() => Array.from(this.getErrors(this.debouncedValue)), {equal: compareLists<string>});
    this.errorState = computed(() => {

      const errors = this.errors().map(msg => validationData(msg, this));

      this.iterateControls((control, key) => {
        for (let error of control.errorState()) {
          errors.push(prependValidationPath(error, key))
        }
      });

      return errors;
    });

    this.warnings = computed(() => Array.from(this.getWarnings(this.debouncedValue)), {equal: compareLists<string>});
    this.warningState = computed(() => {

      const warnings = this.warnings().map(msg => validationData(msg, this));

      this.iterateControls((control, key) => {
        for (let warning of control.warningState()) {
          warnings.push(prependValidationPath(warning, key))
        }
      });

      return warnings;
    });

    postConfiguration.forEach(f => f(this));
  }

  override getDisabledValue(): TValue {
    const value = this.disabledDefaultValue;
    if (value != null) return value;
    if (this.nullable) return value as TValue;
    return this.processControls(x => x.getDisabledValue()) as TValue;
  }

  private getRawValue(getVal: (unit: FormUnit) => Signal<unknown>): DeepPartial<TValue>|undefined {
    if (this.disabled()) return this.disabledDefaultValue as DeepPartial<TValue>|undefined;
    return this.processControls(x => getVal(x)()) as DeepPartial<TValue>;
  }

  private getValue(getVal: (unit: FormUnit) => Signal<unknown>): TValue {
    if (this.disabled()) return this.getDisabledValue();
    return this.processControls(x => getVal(x)()) as TValue;
  }

  private *getErrors(value: Signal<TValue>): Generator<string> {
    if (this.disabled()) return [];
    yield* processFormValidators(this.errorValidators, value());
  }

  private *getWarnings(value: Signal<TValue>): Generator<string> {
    if (this.disabled()) return [];
    yield* processFormValidators(this.warningValidators, value());
  }

  private processControls<T>(process: (unit: FormUnit) => T): Record<string, T> {
    const out: Record<string, T> = {};

    this.iterateControls((control, key) => {
      out[key] = process(control);
    });

    return out;
  }

  private iterateControls(action: (unit: FormUnit, key: Extract<keyof TControls, string>) => void): void {
    const controls = this.controls();
    for (let key in controls) {
      const control = controls[key];
      if (!control) continue;
      action(control, key);
    }
  }

  //<editor-fold desc="Control Mutation">
  // /**
  //  * Remove a nullable control from the layer
  //  * @param name - The property key for the control
  //  */
  // removeControl<K extends Extract<keyof TControls, string>>(name: K) {
  //   const controls = {...this.controls()};
  //   const existing = controls[name];
  //   if (!existing) return;
  //   if (!existing.nullable) throw new Error("You can only remove nullable controls");
  //   delete controls[name];
  //   this._controls.set(controls);
  // }

  // /**
  //  * Add a control to the layer.
  //  * Throws an exception if a control already exists
  //  * @param name - The property key for the control
  //  * @param control - The control to add
  //  */
  // addControl<K extends Extract<keyof TControls, string>>(name: K, control: Required<TControls>[K]) {
  //   const controls = {...this.controls()};
  //   if (controls[name]) throw new Error(`A control with the name '${name}' already exists`);
  //   controls[name] = control;
  //   this._controls.set(controls);
  // }

  /**
   * Set a control in the layer (Will override existing)
   * @param name - The property key for the control
   * @param control - The control to add
   */
  setControl<K extends Extract<keyof TControls, string>>(name: K, control: TControls[K]) {
    const controls = {...this.controls()};
    controls[name] = control;
    this._controls.set(controls);
  }
  //</editor-fold>

  //<editor-fold desc="Value update">

  setValue(value: NonNullable<TValue>) {
    this.iterateControls((control, prop) => {
      const val = (value as SimpleObject)[prop];

      if (control instanceof FormNode) {
        control.setValue(val);
        return;
      }

      if (control instanceof FormLayer) {
        control.setValue(val);
        return;
      }

      if (control instanceof FormList) {
        if (!Array.isArray(val)) return;
        control.setValue(val);
        return;
      }
    });
  }

  patchValue(value: DeepPartial<TValue>|TValue|undefined) {
    if (value == null) return;
    this.iterateControls((control, prop) => {
      if (!value.hasOwnProperty(prop)) return;
      const val = (value as SimpleObject)[prop];

      if (control instanceof FormNode) {
        control.setValue(val);
        return;
      }

      if (control instanceof FormLayer) {
        control.patchValue(val);
        return;
      }

      if (control instanceof FormList) {
        if (!Array.isArray(val)) return;
        control.patchValue(val);
        return;
      }
    });
  }

  override reset(value?: DeepPartial<TValue>|TValue) {
    this.iterateControls((control, prop) => {
      const val = (value as SimpleObject)[prop];

      if (control instanceof FormNode) {
        control.reset(val);
        return;
      }

      if (control instanceof FormLayer) {
        control.reset(val);
        return;
      }

      if (control instanceof FormList) {
        if (val !== undefined && !Array.isArray(val)) return;
        control.reset(val);
        return;
      }
    });

    super.reset();
  }

  //</editor-fold>

  /**
   * Create a clone of the layer and all it's controls.
   * This does not clone over any values.
   */
  clone(): FormLayer<TControls, TValue> {
    return new FormLayer<TControls, TValue>(
      mapObj(this.controls(), x => x.clone()) as TControls,
      this.nullable,
      this.disabledDefaultValue,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
      this.postConfiguration
    );
  }

  override clear(): void {
    this.processControls(x => x.clear());
  }

  override markAsTouched(): void {
    this.processControls(x => x.markAsTouched());
  }

  override markAsUntouched(): void {
    this.processControls(x => x.markAsUntouched());
  }

  override rollback() {
    this.processControls(x => x.rollback());
  }

  private _isValid = computed(() => {
    const hasError = this.getErrors(this.value).next().done !== true;
    if (hasError) return false;

    for (let control of Object.values(this.controls())) {
      if (!control.isValid()) return false;
    }

    return true;
  });

  isValid(): boolean {
    return untracked(this._isValid);
  }

  getValidValue(): TValue {
    if (this.isValid()) throw Error('The value is invalid');
    return this.value();
  }

  getValidValueOrDefault<TDefault>(defaultVal: TDefault): TValue | TDefault;
  getValidValueOrDefault(): TValue | undefined;
  getValidValueOrDefault<TDefault>(defaultVal?: TDefault): TValue | TDefault | undefined {
    if (this.isValid()) return defaultVal;
    return this.value();
  }
}

export type ModelFormLayer<TModel extends SimpleObject|undefined> = FormLayer<FormGroupControls<NonNullable<TModel>>, TModel>;
export type ControlFormLayer<TControl extends Record<string, FormUnit>> = FormLayer<TControl, FormGroupValue<TControl>>;
export type NullableControlFormLayer<TControl extends Record<string, FormUnit>> = FormLayer<TControl, FormGroupValue<TControl>|undefined>;


