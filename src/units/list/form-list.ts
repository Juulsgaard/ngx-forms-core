import {DeepPartial, isArray} from "@juulsgaard/ts-tools";
import {FormNode} from "../node/form-node";
import {IFormList} from "./form-list.interface";
import {computed, signal, Signal, untracked, WritableSignal} from "@angular/core";
import {
    FormValidationContext,
    FormValidator,
    prependValidationPath,
    processFormValidators,
    validationData
} from "../../tools/form-validation";
import {IFormLayer} from "../layer/form-layer.interface";
import {compareLists} from "../../tools/helpers";
import {IFormUnit} from "../unit/form-unit.interface";


export class FormList<T> extends FormNode<T[]> implements IFormList<T> {

  readonly rawValue: Signal<DeepPartial<T>[] | undefined>;
  readonly value: Signal<T[]>;

  /** The current amount of controls */
  readonly length: Signal<number> = computed(() => this.controls().length);

  /** True if the list has no controls */
  readonly empty: Signal<boolean> = computed(() => this.length() <= 0);

  readonly resetValue: Signal<T[]>;

  readonly debouncedRawValue: Signal<DeepPartial<T>[] | undefined>;
  readonly debouncedValue: Signal<T[]>;

  readonly touched: Signal<boolean>;
  readonly changed: Signal<boolean>;

  override readonly valid = computed(() => !this.hasError() && this.controls().every(x => x.valid()));

  readonly errorState: Signal<FormValidationContext[]>;
  readonly errors: Signal<string[]>;

  readonly warningState: Signal<FormValidationContext[]>;
  readonly warnings: Signal<string[]>;

  private readonly _controls: WritableSignal<IFormLayer<T>[]>;
  readonly controls: Signal<IFormLayer<T>[]>;

  constructor(
    private template: IFormLayer<T>,
    private startLength = 0,
    readonly disabledDefaultValue?: T[],
    protected readonly disabledByDefault = false,
    protected readonly errorValidators: FormValidator<T[]>[] = [],
    protected readonly warningValidators: FormValidator<T[]>[] = [],
    protected readonly postConfiguration: ((list: IFormList<T>) => void)[] = []
  ) {
    super(false, disabledByDefault);

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

      const errors = this.errors().map(msg => validationData(msg, this));

      this.controls().forEach((control, i) => {
        for (let error of control.errorState()) {
          errors.push(prependValidationPath(error, `[${i}]`))
        }
      });

      return errors;
    });

    this.warnings = computed(() => Array.from(this.getWarnings(this.debouncedValue)), {equal: compareLists<string>});
    this.warningState = computed(() => {

      const warnings = this.warnings().map(msg => validationData(msg, this));

      this.controls().forEach((control, i) => {
        for (let warning of control.warningState()) {
          warnings.push(prependValidationPath(warning, `[${i}]`))
        }
      });

      return warnings;
    });

    postConfiguration.forEach(f => f(this));
  }

  private getRawValue(getVal: (unit: IFormLayer<T>) => Signal<unknown>): DeepPartial<T>[]|undefined {
    if (this.disabled()) return this.disabledDefaultValue as DeepPartial<T>[] | undefined;
    return this.controls().map(x => getVal(x)() as DeepPartial<T>);
  }

  private getValue(getVal: (unit: IFormLayer<T>) => Signal<unknown>): T[] {
    if (this.disabled()) return this.getDisabledValue();
    return this.controls().map(x => getVal(x)()) as T[];
  }

  private *getErrors(value: Signal<T[]>): Generator<string> {
    if (this.disabled()) return [];
    yield* processFormValidators(this.errorValidators, value());
  }

  private *getWarnings(value: Signal<T[]>): Generator<string> {
    if (this.disabled()) return [];
    yield* processFormValidators(this.warningValidators, value());
  }

  //<editor-fold desc="Helpers">

  private scaleToSize(size: number): boolean {
    size = Math.max(0, size);
    const controls = untracked(this.controls);

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
    if (untracked(this.controls).length <= 0) return false;
    this._controls.set([]);
    return true;
  }

  override reset(values?: T[]) {
    if (values == null) {
      this.clear();
      super.reset();
      return;
    }

    this.scaleToSize(values.length);
    const controls = untracked(this.controls);

    for (let i = 0; i < controls.length && i < values.length; i++) {
      controls[i]?.reset(values[i]);
    }

    super.reset();
  }

  patchValue(values: DeepPartial<T[]> | T[] | undefined) {
    if (values == null) return;
    if (!isArray(values)) return;

    this.scaleToSize(values.length);
    const controls = untracked(this.controls);

    for (let i = 0; i < controls.length && i < values.length; i++) {
      controls[i]?.patchValue(values[i]);
    }
  }

  setValue(values: T[]) {
    if (!isArray(values)) return;
    this.scaleToSize(values.length);
    const controls = untracked(this.controls);

    for (let i = 0; i < controls.length && i < values.length; i++) {
      controls[i]?.patchValue(values[i]);
    }
  }

  //<editor-fold desc="Mutations">

  /**
   * Add a form layer to the end of the list
   * @param layers - The layers to add
   */
  addLayers(...layers: IFormLayer<T>[]) {
    this._controls.update(x => [...x, ...layers]);
    return layers;
  }

  setLayers(layers: IFormLayer<T>[]) {
    this._controls.set([...layers]);
    return layers;
  }

  /**
   * Add a value to the end of the list.
   * The value is converted to a Form Layer and appended.
   * @param value - The value to add
   */
  addElement(value?: T) {
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
  appendElements(...values: T[]) {
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
  setElement(filter: (x: T) => boolean, value: T) {
    const control = untracked(this.controls).find(x => filter(untracked(x.value)));
    if (!control) return this.addElement(value);
    control.patchValue(value);
    return control;
  }

  /**
   * Update the value of the first match in the list
   * @param filter - The search filter
   * @param value - The value to update with
   */
  updateElement(filter: (x: T) => boolean, value: T) {
    const control = untracked(this.controls).find(x => filter(untracked(x.value)));
    if (!control) return undefined;
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
  toggleElement(filter: (x: T) => boolean, value: T) {
    const removed = this.removeElement(filter);
    if (!removed) return this.addElement(value);
    return undefined;
  }

  /**
   * Remove the first item matching the predicate
   * @param filter - The match predicate
   */
  removeElement(filter: (x: T) => boolean): IFormLayer<T>|undefined {
    const index = untracked(this.controls).findIndex(x => filter(untracked(x.value)));
    return this.removeAt(index);
  }

  /**
   * Remove the given form layer
   * @param layer - The layer to remove
   */
  remove(layer: IFormUnit): IFormLayer<T> | undefined {
    const index = untracked(this.controls).findIndex(x => x === layer);
    return this.removeAt(index);
  }

  /**
   * Remove a layer at a specified index
   * @param index - The index at which to remove the item
   */
  removeAt(index: number): IFormLayer<T> | undefined {
    if (index < 0) return undefined;
    let controls = untracked(this.controls);
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

    const controls = [...untracked(this.controls)];
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
  override clone(): IFormList<T> {
    return new FormList<T>(
      this.template.clone(),
      this.startLength,
      this.disabledDefaultValue,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
      this.postConfiguration
    );
  }

  override getDisabledValue(): T[] {
    const value = this.disabledDefaultValue;
    if (value != null) return value;
    return this.controls().map(x => x.getDisabledValue());
  }

  override markAsTouched(): void {
    untracked(this.controls).forEach(x => x.markAsTouched());
  }

  override markAsUntouched(): void {
    untracked(this.controls).forEach(x => x.markAsUntouched());
  }

  override rollback() {
    untracked(this.controls).forEach(x => x.rollback());
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

  getValidValue(): T[] {
    if (!this.isValid()) throw Error('The value is invalid');
    return untracked(this.value);
  }

  getValidValueOrDefault<TDefault>(defaultVal: TDefault): (T[]) | TDefault;
  getValidValueOrDefault(): T[] | undefined;
  getValidValueOrDefault<TDefault>(defaultVal?: TDefault): T[] | TDefault | undefined {
    if (!this.isValid()) return defaultVal;
    return untracked(this.value);
  }
}
