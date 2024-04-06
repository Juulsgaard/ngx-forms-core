import {FormGroupControls, FormGroupValue, FormValidationData} from "../tools/form-types";
import {FormLayer} from "./form-layer";
import {DeepPartial, SimpleObject} from "@juulsgaard/ts-tools";
import {computed, signal, Signal, WritableSignal} from "@angular/core";
import {FormUnit} from "./form-unit";
import {FormValidator, processFormValidators} from "../tools/form-validation";
import {AnonFormList} from "./anon-form-list";
import {compareLists} from "../tools/helpers";
import {AnonFormLayer} from "./anon-form-layer";

export class FormList<TControls extends Record<string, FormUnit>, TValue extends SimpleObject, TNullable extends boolean> extends AnonFormList {

  readonly rawValue: Signal<DeepPartial<TValue>[] | undefined>;
  readonly value: Signal<TNullable extends true ? TValue[] | undefined : TValue[]>;

  readonly touched: Signal<boolean>;
  readonly changed: Signal<boolean>;

  override readonly valid = computed(() => !this.hasError() && this.controls().every(x => x.valid()));

  readonly errorState: Signal<FormValidationData[]>;
  readonly errors: Signal<string[]>;

  readonly warningState: Signal<FormValidationData[]>;
  readonly warnings: Signal<string[]>;

  private readonly _controls: WritableSignal<FormLayer<TControls, TValue>[]>;
  override readonly controls: Signal<FormLayer<TControls, TValue>[]>;

  private templateLayer: FormLayer<TControls, TValue>;

  declare readonly nullable: TNullable;

  constructor(
    template: TControls,
    nullable: TNullable,
    private startLength = 0,
    readonly disabledDefaultValue?: TValue[],
    protected readonly disabledByDefault = false,
    protected readonly errorValidators: FormValidator<TNullable extends true ? TValue[] | undefined : TValue[]>[] = [],
    protected readonly warningValidators: FormValidator<TNullable extends true ? TValue[] | undefined : TValue[]>[] = [],
  ) {
    super(nullable, disabledByDefault);

    this.templateLayer = new FormLayer<TControls, TValue>(template);

    const initialControls = Array.from(Array(startLength)).map(() => this.templateLayer.clone());
    this._controls = signal(initialControls);
    this.controls = this._controls.asReadonly();

    this.rawValue = computed(() => {
      if (this.disabled()) return this.disabledDefaultValue as DeepPartial<TValue>[] | undefined;
      return this.controls().map(x => x.rawValue() as DeepPartial<TValue>);
    });

    this.value = computed(() => {
      if (this.disabled()) return this.getDisabledValue();
      return this.controls().map(x => x.value());
    });

    this.touched = computed(() => this.controls().some(x => x.touched()));
    this.changed = computed(() => this.controls().some(x => x.changed()));

    this.errors = computed(() => this.getErrors(), {equal: compareLists<string>});
    this.errorState = computed(() => {
      const result = this.controls()
        .flatMap((control, i) => control.errorState()
          .map(x => (
            {path: [`[${i}]`, ...x.path], message: x.message}
          ))
        );

      result.push(...this.errors()
        .map(msg => (
          {path: [], message: msg}
        )));

      return result;
    });

    this.warnings = computed(() => this.getWarnings(), {equal: compareLists<string>});
    this.warningState = computed(() => {
      const result = this.controls()
        .flatMap((control, i) => control.warningState()
          .map(x => (
            {path: [`[${i}]`, ...x.path], message: x.message}
          ))
        );

      result.push(...this.warnings()
        .map(msg => (
          {path: [], message: msg}
        )));

      return result;
    });
  }

  private getErrors(): string[] {
    if (this.disabled()) return [];
    return processFormValidators(this.errorValidators, this.value());
  }

  private getWarnings(): string[] {
    if (this.disabled()) return [];
    return processFormValidators(this.warningValidators, this.value());
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
        ...Array.from(Array(diff)).map(() => this.templateLayer.clone())
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
    const layer = this.templateLayer.clone();
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
    const layers = this.addLayers(...values.map(x => {
      const layer = this.templateLayer.clone();
      layer.reset(x);
      return layer;
    }));
    return layers;
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
      this.templateLayer.clone().controls(),
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
}

export type ModelFormList<TModel extends SimpleObject, TNullable extends boolean = false> = FormList<FormGroupControls<TModel>, TModel, TNullable>;
export type ControlFormList<TControls extends Record<string, FormUnit>, TNullable extends boolean = false> = FormList<TControls, FormGroupValue<TControls>, TNullable>;
