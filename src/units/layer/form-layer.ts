import {computed, signal, Signal, untracked, WritableSignal} from "@angular/core";
import {FormNode} from "../node/form-node";
import {IFormLayer} from "./form-layer.interface";
import {DeepPartial, isArray, Mutable} from "@juulsgaard/ts-tools";
import {
  FormValidationContext,
  FormValidator,
  prependValidationPath,
  processFormValidators,
  validationData
} from "../../tools/form-validation";
import {FormLayerControls} from "../controls";
import {IAnonFormInput} from "../input/form-input.interface";
import {compareLists} from "../../tools/helpers";
import {IAnonFormNode} from "../node/form-node.interface";
import {isFormNode} from "../../predicates/is-form-node";
import {isFormInput} from "../../predicates/is-form-input";
import {isFormLayer} from "../../predicates/is-form-layer";
import {isFormList} from "../../predicates/is-form-list";


export class FormLayer<T> extends FormNode<T> implements IFormLayer<T> {

  readonly value: Signal<T>;
  readonly rawValue: Signal<DeepPartial<T> | undefined>;

  readonly resetValue: Signal<T>;

  readonly debouncedValue: Signal<T>;
  readonly debouncedRawValue: Signal<DeepPartial<T> | undefined>;

  override readonly changed: Signal<boolean>;
  override readonly touched: Signal<boolean>;

  override readonly valid = computed(() => !this.hasError() && !this.anyControl(x => !x.valid()));

  override readonly errorState: Signal<FormValidationContext[]>;
  override readonly errors: Signal<string[]>;

  override readonly warningState: Signal<FormValidationContext[]>;
  override readonly warnings: Signal<string[]>;

  private readonly _controls: WritableSignal<FormLayerControls<T>>;
  readonly controls: Signal<FormLayerControls<T>>;

  /** A list of all the Form Inputs in the layer */
  readonly inputs: Signal<IAnonFormInput[]> = computed(
    () => Object.values(this.controls()).filter(isFormInput)
  );

  constructor(
    controls: FormLayerControls<T>,
    nullable: boolean,
    readonly disabledDefaultValue?: T,
    protected readonly disabledByDefault = false,
    protected readonly errorValidators: FormValidator<T>[] = [],
    protected readonly warningValidators: FormValidator<T>[] = [],
    protected readonly postConfiguration: ((config: IFormLayer<T>) => void)[] = []
  ) {
    super(nullable, disabledByDefault);

    this._controls = signal(controls);
    this.controls = this._controls.asReadonly();

    this.rawValue = computed(() => this.getRawValue(x => x.rawValue));
    this.value = computed(() => this.getValue(x => x.value));

    this.debouncedRawValue = computed(() => this.getRawValue(x => x.debouncedRawValue));
    this.debouncedValue = computed(() => this.getValue(x => x.debouncedValue));

    this.resetValue = computed(() => this.processControls(x => x.resetValue()) as T);

    this.changed = computed(() => this.anyControl(x => x.changed()));
    this.touched = computed(() => this.anyControl(x => x.touched()));

    this.errors = computed(() => Array.from(this.getErrors(this.debouncedValue)), {equal: compareLists<string>});
    this.errorState = computed(() => {

      const errors = this.errors().map(msg => validationData(msg, this));

      for (let [control, key] of this.iterateControls()) {
        for (let error of control.errorState()) {
          errors.push(prependValidationPath(error, key))
        }
      }

      return errors;
    });

    this.warnings = computed(() => Array.from(this.getWarnings(this.debouncedValue)), {equal: compareLists<string>});
    this.warningState = computed(() => {

      const warnings = this.warnings().map(msg => validationData(msg, this));

      for (let [control, key] of this.iterateControls()) {
        for (let warning of control.warningState()) {
          warnings.push(prependValidationPath(warning, key))
        }
      }

      return warnings;
    });

    untracked(() => postConfiguration.forEach(f => f(this)));
  }

  override getDisabledValue(): T {
    const value = this.disabledDefaultValue;
    if (value != null) return value;
    if (this.nullable) return value as T;
    return this.processControls(x => x.getDisabledValue()) as T;
  }

  private getRawValue(getVal: (unit: IAnonFormNode) => Signal<unknown>): DeepPartial<T> | undefined {
    if (this.disabled()) return this.disabledDefaultValue as DeepPartial<T> | undefined;
    return this.processControls(x => getVal(x)()) as DeepPartial<T>;
  }

  private getValue(getVal: (unit: IAnonFormNode) => Signal<unknown>): T {
    if (this.disabled()) return this.getDisabledValue();
    return this.processControls(x => getVal(x)()) as T;
  }

  private* getErrors(value: Signal<T>): Generator<string> {
    if (this.disabled()) return [];
    yield* processFormValidators(this.errorValidators, value());
  }

  private* getWarnings(value: Signal<T>): Generator<string> {
    if (this.disabled()) return [];
    yield* processFormValidators(this.warningValidators, value());
  }

  private processControls<T>(process: (unit: IAnonFormNode) => T): Record<string, T> {
    const out: Record<string, T> = {};

    for (const [control, key] of this.iterateControls()) {
      out[key] = process(control);
    }

    return out;
  }

  private anyControl(check: (unit: IAnonFormNode) => boolean): boolean {

    for (const [control] of this.iterateControls()) {
      if (check(control)) return true;
    }

    return false;
  }

  private* iterateControls(): Generator<[unit: IAnonFormNode, key: Extract<keyof NonNullable<T>, string>]> {
    const controls = this.controls();
    for (let key in controls) {
      const control = controls[key];
      if (!control) continue;
      yield [control, key];
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
  setControl<K extends Extract<keyof T, string>>(name: K, control: FormLayerControls<T>[K]) {
    const controls: Mutable<FormLayerControls<T>> = {...this.controls()};
    controls[name] = control;
    this._controls.set(controls);
  }

  //</editor-fold>

  //<editor-fold desc="Value update">

  setValue(value: T | undefined) {
    untracked(() => {
      for (let [control, key] of this.iterateControls()) {
        if (!isFormNode(control)) continue;
        const val = value?.[key];
        control.setValue(val);
      }
    });
  }

  patchValue(value: DeepPartial<T> | T | undefined) {
    if (value == null) return;

    untracked(() => {
      for (let [control, key] of this.iterateControls()) {

        if (!value.hasOwnProperty(key)) continue;
        const val = (value as NonNullable<T>)[key];

        if (isFormLayer(control)) {
          control.patchValue(val);
          continue;
        }

        if (isFormList(control)) {
          if (!isArray(val)) continue;
          control.patchValue(val);
          continue;
        }

        if (!isFormNode(control)) continue;
        control.setValue(val);
      }
    });
  }

  override reset(value?: DeepPartial<T> | T) {

    untracked(() => {
      for (let [control, key] of this.iterateControls()) {
        if (!isFormNode(control)) continue;
        const val = (
          value as T | undefined
        )?.[key];
        control.reset(val);
      }
    });

    super.reset();
  }

  //</editor-fold>

  /**
   * Create a clone of the layer and all it's controls.
   * This does not clone over any values.
   */
  clone(): IFormLayer<T> {
    return new FormLayer<T>(
      this.cloneControls(),
      this.nullable,
      this.disabledDefaultValue,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
      this.postConfiguration
    );
  }

  private cloneControls(): FormLayerControls<T> {
    return untracked(() => {
      const controls = {} as Mutable<FormLayerControls<T>>;

      for (let [control, key] of this.iterateControls()) {
        controls[key] = control.clone() as FormLayerControls<T>[typeof key];
      }

      return controls;
    });
  }

  override clear(): void {
    untracked(() => this.processControls(x => x.clear()));
  }

  override markAsTouched(): void {
    untracked(() => this.processControls(x => x.markAsTouched()));
  }

  override markAsUntouched(): void {
    untracked(() => this.processControls(x => x.markAsUntouched()));
  }

  override rollback() {
    untracked(() => this.processControls(x => x.rollback()));
  }

  private _isValid = computed(() => {
    const hasError = this.getErrors(this.value).next().done !== true;
    if (hasError) return false;

    const invalid = this.anyControl(c => !c.isValid());
    return !invalid;
  });

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


