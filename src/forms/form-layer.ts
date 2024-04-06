import {DeepPartial, mapObj, objToArr, SimpleObject} from "@juulsgaard/ts-tools";
import {FormNode} from "./form-node";
import {computed, signal, Signal, WritableSignal} from "@angular/core";
import {FormUnit} from "./form-unit";
import {compareLists} from "../tools/helpers";
import {FormValidator, processFormValidators} from "../tools/form-validation";
import {FormList} from "./form-list";
import {AnonFormLayer} from "./anon-form-layer";
import {FormGroupControls, FormGroupValue} from "../types/controls";
import {FormValidationData} from "../types";

export class FormLayer<TControls extends Record<string, FormUnit>, TValue extends SimpleObject|undefined> extends AnonFormLayer {

  override readonly value: Signal<TValue>;
  override readonly rawValue: Signal<DeepPartial<TValue> | undefined>;

  override readonly changed: Signal<boolean>;
  override readonly touched: Signal<boolean>;

  override readonly valid = computed(() => !this.hasError() && Object.values(this.controls()).every(x => x.valid()));

  override readonly errorState: Signal<FormValidationData[]>;
  override readonly errors: Signal<string[]>;

  override readonly warningState: Signal<FormValidationData[]>;
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
  ) {
    super(nullable, disabledByDefault);

    this._controls = signal(controls);
    this.controls = this._controls.asReadonly();

    this.rawValue = computed(() => {
      if (this.disabled()) return this.disabledDefaultValue as DeepPartial<TValue>|undefined;
      return this.processControls(x => x.rawValue()) as DeepPartial<TValue>;
    });

    this.value = computed(() => {
      if (this.disabled()) return this.getDisabledValue();
      return this.processControls(x => x.value()) as TValue;
    });

    this.changed = computed(() => Object.values(this.controls()).some(x => x.changed()));
    this.touched = computed(() => Object.values(this.controls()).some(x => x.touched()));

    this.errors = computed(() => this.getErrors(), {equal: compareLists<string>});
    this.errorState = computed(() => {
      const children = this.processControls(x => x.errorState());
      const result = objToArr(
        children,
        (values, key) => values.map(x => ({path: [key, ...x.path], message: x.message}))
      ).flatMap(x => x);

      result.push(...this.errors().map(msg => ({path: [], message: msg})));

      return result;
    });

    this.warnings = computed(() => this.getWarnings(), {equal: compareLists<string>});
    this.warningState = computed(() => {
      const children = this.processControls(x => x.warningState());
      const result = objToArr(
        children,
        (values, key) => values.map(x => ({path: [key, ...x.path], message: x.message}))
      ).flatMap(x => x);

      result.push(...this.warnings().map(msg => ({path: [], message: msg})));

      return result;
    });
  }

  override getDisabledValue(): TValue {
    const value = this.disabledDefaultValue;
    if (value != null) return value;
    if (this.nullable) return value as TValue;
    return this.processControls(x => x.getDisabledValue()) as TValue;
  }

  private getErrors(): string[] {
    if (this.disabled()) return [];
    return processFormValidators(this.errorValidators, this.value());
  }

  private getWarnings(): string[] {
    if (this.disabled()) return [];
    return processFormValidators(this.warningValidators, this.value());
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
  /**
   * Remove a nullable control from the layer
   * @param name - The property key for the control
   */
  removeControl<K extends Extract<keyof TControls, string>>(name: K) {
    const controls = {...this.controls()};
    const existing = controls[name];
    if (!existing) return;
    if (!existing.nullable) throw new Error("You can only remove nullable controls");
    delete controls[name];
    this._controls.set(controls);
  }

  /**
   * Add a control to the layer.
   * Throws an exception if a control already exists
   * @param name - The property key for the control
   * @param control - The control to add
   */
  addControl<K extends Extract<keyof TControls, string>>(name: K, control: Required<TControls>[K]) {
    const controls = {...this.controls()};
    if (controls[name]) throw new Error(`A control with the name '${name}' already exists`);
    controls[name] = control;
    this._controls.set(controls);
  }

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
}

export type ModelFormLayer<TModel extends SimpleObject|undefined> = FormLayer<FormGroupControls<NonNullable<TModel>>, TModel>;
export type ControlFormLayer<TControl extends Record<string, FormUnit>> = FormLayer<TControl, FormGroupValue<TControl>>;
export type NullableControlFormLayer<TControl extends Record<string, FormUnit>> = FormLayer<TControl, FormGroupValue<TControl>|undefined>;


