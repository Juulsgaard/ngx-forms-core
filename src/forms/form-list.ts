import {FormLayer} from "./form-layer";
import {DeepPartial, SimpleObject} from "@juulsgaard/ts-tools";
import {computed, signal, Signal, untracked, WritableSignal} from "@angular/core";
import {FormUnit} from "./form-unit";
import {
  FormValidationContext, FormValidator, prependValidationPath, processFormValidators, validationData
} from "../tools/form-validation";
import {AnonFormList} from "./anon-form-list";
import {compareLists} from "../tools/helpers";
import {AnonFormLayer} from "./anon-form-layer";
import {FormGroupControls, FormGroupValue} from "../types";
import {RootListDisableConfig} from "../types/disable";
import {getAutoDisable} from "../tools/auto-disable";

export class FormList<TControls extends Record<string, FormUnit>, TValue extends SimpleObject|undefined, TNullable extends boolean> extends AnonFormList {

  readonly rawValue: Signal<DeepPartial<TValue>[] | undefined>;
  readonly value: Signal<TNullable extends true ? TValue[] | undefined : TValue[]>;

  readonly resetValue: Signal<TNullable extends true ? TValue[] | undefined : TValue[]>;

  readonly debouncedRawValue: Signal<DeepPartial<TValue>[] | undefined>;
  readonly debouncedValue: Signal<TNullable extends true ? TValue[] | undefined : TValue[]>;

  readonly touched: Signal<boolean>;
  readonly changed: Signal<boolean>;

  override readonly valid = computed(() => !this.hasError() && this.controls().every(x => x.valid()));

  readonly errorState: Signal<FormValidationContext[]>;
  readonly errors: Signal<string[]>;

  readonly warningState: Signal<FormValidationContext[]>;
  readonly warnings: Signal<string[]>;

  private readonly _controls: WritableSignal<FormLayer<TControls, TValue>[]>;
  override readonly controls: Signal<FormLayer<TControls, TValue>[]>;

  declare readonly nullable: TNullable;

  constructor(
    private template: FormLayer<TControls, TValue>,
    nullable: TNullable,
    private startLength = 0,
    readonly disabledDefaultValue?: TValue[],
    protected readonly disabledByDefault = false,
    protected readonly errorValidators: FormValidator<TNullable extends true ? TValue[] | undefined : TValue[]>[] = [],
    protected readonly warningValidators: FormValidator<TNullable extends true ? TValue[] | undefined : TValue[]>[] = [],
    autoDisabled: ((config: RootListDisableConfig<TValue, TNullable>) => void)[] = []
  ) {
    super(nullable, disabledByDefault);

    const initialControls = Array.from(Array(startLength)).map(() => this.template.clone());
    this._controls = signal(initialControls);
    this.controls = this._controls.asReadonly();

    this.rawValue = computed(() => this.getRawValue(x => x.rawValue));
    this.value = computed(() => this.getValue(x => x.value));

    this.debouncedRawValue = computed(() => this.getRawValue(x => x.debouncedRawValue));
    this.debouncedValue = computed(() => this.getValue(x => x.debouncedValue));

    this.resetValue = computed(() => this.controls().map(x => x.resetValue()));

    this.touched = computed(() => this.controls().some(x => x.touched()));
    this.changed = computed(() => this.controls().some(x => x.changed()));

    this.errors = computed(() => Array.from(this.getErrors(this.debouncedValue)), {equal: compareLists<string>});
    this.errorState = computed(() => {
      const result = this.controls()
        .flatMap((control, i) => control.errorState()
          .map(x => prependValidationPath(x, `[${i}]`))
        );

      result.push(...this.errors().map(msg => validationData(msg, this)));

      return result;
    });

    this.warnings = computed(() => Array.from(this.getWarnings(this.debouncedValue)), {equal: compareLists<string>});
    this.warningState = computed(() => {
      const result = this.controls()
        .flatMap((control, i) => control.warningState()
          .map(x => prependValidationPath(x, `[${i}]`))
        );

      result.push(...this.warnings().map(msg => validationData(msg, this)));

      return result;
    });

    if (autoDisabled.length > 0) {
      const autoDisable = getAutoDisable(this);
      autoDisabled.forEach(f => f(autoDisable));
    }
  }

  private getRawValue(getVal: (unit: FormUnit) => Signal<unknown>): DeepPartial<TValue>[]|undefined {
    if (this.disabled()) return this.disabledDefaultValue as DeepPartial<TValue>[] | undefined;
    return this.controls().map(x => getVal(x)() as DeepPartial<TValue>);
  }

  private getValue(getVal: (unit: FormUnit) => Signal<unknown>): TNullable extends true ? TValue[] | undefined : TValue[] {
    if (this.disabled()) return this.getDisabledValue();
    return this.controls().map(x => getVal(x)()) as TValue[];
  }

  private *getErrors(value: Signal<TNullable extends true ? TValue[] | undefined : TValue[]>): Generator<string> {
    if (this.disabled()) return [];
    yield* processFormValidators(this.errorValidators, value());
  }

  private *getWarnings(value: Signal<TNullable extends true ? TValue[] | undefined : TValue[]>): Generator<string> {
    if (this.disabled()) return [];
    yield* processFormValidators(this.warningValidators, value());
  }

  //<editor-fold desc="Helpers">

  private scaleToSize(size: number): boolean {
    size = Math.max(0, size);
    const controls = this.controls();

    if (controls.length === size) return false;

    if (size === 0) {
      return this.clear();
    }

    if (size < controls.length) {
      this._controls.set(controls.slice(0, size));
      return true;
    }

    if (size > controls.length) {
      const diff = size - controls.length;
      this._controls.set([
        ...controls,
        ...Array.from(Array(diff)).map(() => this.template.clone())
      ]);
      return true;
    }

    return false;
  }

  //</editor-fold>

  override clear() {
    if (this.controls().length <= 0) return false;
    this._controls.set([]);
    return true;
  }

  override reset(values?: TValue[]) {
    if (values == null) {
      this.clear();
      super.reset();
      return;
    }

    this.scaleToSize(values.length);
    const controls = this.controls();

    for (let i = 0; i < controls.length && i < values.length; i++) {
      controls[i]?.reset(values[i]);
    }

    super.reset();
  }

  patchValue(values: (DeepPartial<TValue> | TValue)[] | undefined) {
    if (values == null) return;

    this.scaleToSize(values.length);
    const controls = this.controls();

    for (let i = 0; i < controls.length && i < values.length; i++) {
      controls[i]?.patchValue(values[i]);
    }
  }

  setValue(values: TValue[]) {
    this.scaleToSize(values.length);
    const controls = this.controls();

    for (let i = 0; i < controls.length && i < values.length; i++) {
      controls[i]?.patchValue(values[i]);
    }
  }

  //<editor-fold desc="Mutations">

  /**
   * Add a form layer to the end of the list
   * @param layers - The layers to add
   */
  addLayers(...layers: FormLayer<TControls, TValue>[]) {
    this._controls.update(x => [...x, ...layers]);
    return layers;
  }

  setLayers(layers: FormLayer<TControls, TValue>[]) {
    this._controls.set([...layers]);
    return layers;
  }

  /**
   * Add a value to the end of the list.
   * The value is converted to a Form Layer and appended.
   * @param value - The value to add
   */
  addElement(value?: TValue) {
    const layer = this.template.clone();
    layer.reset(value);
    this.addLayers(layer);
    return layer;
  }

  /**
   * Add a value to the end of the list.
   * The value is converted to a Form Layer and appended.
   * @param values - The values to add
   */
  appendElements(...values: TValue[]) {
    return this.addLayers(...values.map(x => {
      const layer = this.template.clone();
      layer.reset(x);
      return layer;
    }));
  }

  /**
   * Update the value of the first match in the list.
   * If no match is found, add the item.
   * @param filter - The search filter
   * @param value - The value to update with
   */
  setElement(filter: (x: TValue) => boolean, value: TValue) {
    const control = this.controls().find(x => filter(x.value()));
    if (!control) return this.addElement(value);
    control.patchValue(value);
    return control;
  }

  /**
   * Update the value of the first match in the list
   * @param filter - The search filter
   * @param value - The value to update with
   */
  updateElement(filter: (x: TValue) => boolean, value: TValue) {
    const control = this.controls().find(x => filter(x.value()));
    if (!control) return null;
    control.patchValue(value);
    return control;
  }

  /**
   * Toggle the presence of an item based on the filter.
   * If a match is found it will be removed.
   * If no match is found the value will be added.
   * @param filter - The search filter
   * @param value - The value to add if applicable
   */
  toggleElement(filter: (x: TValue) => boolean, value: TValue) {
    const removed = this.removeElement(filter);
    if (!removed) return this.addElement(value);
    return null;
  }

  /**
   * Remove the first item matching the predicate
   * @param filter - The match predicate
   */
  removeElement(filter: (x: TValue) => boolean): FormLayer<TControls, TValue>|undefined {
    const index = this.controls().findIndex(x => filter(x.value()));
    return this.removeAt(index);
  }

  /**
   * Remove the given form layer
   * @param layer - The layer to remove
   */
  remove(layer: AnonFormLayer): FormLayer<TControls, TValue> | undefined {
    const index = this.controls().findIndex(x => x === layer);
    return this.removeAt(index);
  }

  /**
   * Remove a layer at a specified index
   * @param index - The index at which to remove the item
   */
  removeAt(index: number): FormLayer<TControls, TValue> | undefined {
    if (index < 0) return undefined;
    let controls = this.controls();
    if (index >= controls.length) return undefined;

    controls = [...controls];
    const removed = controls.splice(index, 1);
    this._controls.set(controls);
    return removed[0];
  }

  //</editor-fold>

  //<editor-fold desc="Move Actions">

  /**
   * Move an item the list based on the Material CDK payload
   * @param data - The CDK move data
   */
  moveCdkElement(data: { previousIndex: number, currentIndex: number }) {
    this.moveElement(data.previousIndex, data.currentIndex);
  }

  /**
   * Move an element in the list
   * @param oldIndex - The Index of the element to move
   * @param newIndex - The target index for the element
   */
  moveElement(oldIndex: number, newIndex: number) {
    if (newIndex < 0) return false;

    const controls = [...this.controls()];
    if (newIndex >= controls.length) return false;

    const removed = controls.splice(oldIndex, 1);
    if (removed.length <= 0) return false;

    controls.splice(newIndex, 0, ...removed);

    this._controls.set(controls);
    return true;
  }

  //</editor-fold>

  /**
   * Clone the list based on its configuration.
   * No values are moved over.
   */
  override clone(): FormList<TControls, TValue, TNullable> {
    return new FormList<TControls, TValue, TNullable>(
      this.template.clone(),
      this.nullable,
      this.startLength,
      this.disabledDefaultValue,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
    );
  }

  override getDisabledValue(): TNullable extends true ? TValue[] | undefined : TValue[] {
    const value = this.disabledDefaultValue;
    if (value != null) return value;
    if (this.nullable) return value as TNullable extends true ? TValue[] | undefined : TValue[];
    return this.controls().map(x => x.getDisabledValue());
  }

  override markAsTouched(): void {
    this.controls().forEach(x => x.markAsTouched());
  }

  override markAsUntouched(): void {
    this.controls().forEach(x => x.markAsUntouched());
  }

  override rollback() {
    this.controls().forEach(x => x.rollback());
  }

  private _isValid = computed(() => {
    const hasError = this.getErrors(this.value).next().done !== true;
    if (hasError) return false;

    for (let control of this.controls()) {
      if (!control.isValid()) return false;
    }

    return true;
  })

  isValid(): boolean {
    return untracked(this._isValid);
  }

  getValidValue(): TNullable extends true ? TValue[] | undefined : TValue[] {
    if (this.isValid()) throw Error('The value is invalid');
    return this.value();
  }

  getValidValueOrDefault<TDefault>(defaultVal: TDefault): (TNullable extends true ? TValue[] | undefined : TValue[]) | TDefault;
  getValidValueOrDefault(): TValue[] | undefined;
  getValidValueOrDefault<TDefault>(defaultVal?: TDefault): TValue[] | TDefault | undefined {
    if (!this.isValid()) return defaultVal;
    return this.value();
  }
}

export type ModelFormList<TModel extends SimpleObject, TNullable extends boolean = false> = FormList<FormGroupControls<TModel>, TModel, TNullable>;
export type ControlFormList<TControls extends Record<string, FormUnit>, TNullable extends boolean = false> = FormList<TControls, FormGroupValue<TControls>, TNullable>;
