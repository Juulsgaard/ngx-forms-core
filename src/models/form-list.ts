import {FormError, FormGroupControls, FormGroupValue, FormGroupValueRaw, SmartFormUnion} from "../tools/form-types";
import {FormLayer} from "./form-layer";
import {asyncScheduler, BehaviorSubject, combineLatest, Observable, of, switchMap} from "rxjs";
import {distinctUntilChanged, map, throttleTime} from "rxjs/operators";
import {AbstractControl, FormArray, FormControlStatus} from "@angular/forms";
import {DeepPartial, SimpleObject} from "@consensus-labs/ts-tools";
import {cache} from "@consensus-labs/rxjs-tools";


export class FormList<TControls extends Record<string, SmartFormUnion>, TValue extends SimpleObject, TRaw extends SimpleObject> extends FormArray {

  protected readonly _status$: BehaviorSubject<FormControlStatus>;
  /** Observable denoting when the list is disabled */
  public readonly disabled$: Observable<boolean>;
  /** Observable containing all the current errors of the list */
  public readonly errors$: Observable<FormError[]>;

  /** @inheritDoc */
  readonly value!: TValue[];
  /** @inheritDoc */
  readonly valueChanges!: Observable<TValue[]>;
  private readonly _value$: BehaviorSubject<TValue[]>;
  public readonly value$: Observable<TValue[]>;
  public readonly throttledValue$: Observable<TValue[]>;

  /** An observable containing the computed raw values of the list */
  public rawValue$: Observable<TRaw[]>;

  /** A list of all the Form Layers making up the list */
  public controls!: FormLayer<TControls, TValue, TRaw>[];
  private _controls$: BehaviorSubject<FormLayer<TControls, TValue, TRaw>[]>;
  /** An observable containing the current controls of the list */
  public controls$: Observable<FormLayer<TControls, TValue, TRaw>[]>;

  private templateLayer: FormLayer<TControls, TValue, TRaw>;

  constructor(
    private template: TControls,
    private startLength = 0
  ) {
    super([]);

    this.templateLayer = new FormLayer<TControls, TValue, TRaw>(template);

    for (let i = 0; i < startLength; i++) {
      super.push(this.templateLayer.clone());
    }

    this._controls$ = new BehaviorSubject(this.controls);
    this.controls$ = this._controls$.asObservable();

    this._status$ = new BehaviorSubject(this.status);
    this.statusChanges.subscribe(this._status$);
    this.disabled$ = this._status$.pipe(
      map(x => x === 'DISABLED')
    );

    this._value$ = new BehaviorSubject(this.value);
    this.valueChanges.subscribe(this._value$);
    this.value$ = this._value$.asObservable();

    this.throttledValue$ = this.value$.pipe(
      throttleTime(200, asyncScheduler, {trailing: true}),
      cache()
    );

    this.rawValue$ = this.throttledValue$.pipe(
      map(() => this.getRawValue()),
      cache()
    );

    //<editor-fold desc="Errors">
    this.errors$ = this.controls$.pipe(
      distinctUntilChanged(),
      switchMap(controls => {
        if (!controls.length) return of([]);
        const errorLists = controls.map(
          (x, i) => x.errors$.pipe(
            map(errors => errors.map(
              ({error, path}) => ({path: [`[${i}]`, ...path], error})
            ))
          )
        );

        return combineLatest(errorLists).pipe(
          throttleTime(100, asyncScheduler, {leading: true, trailing: true}),
          map(arr => ([] as FormError[]).concat(...arr)),
          cache()
        );
      })
    );
    //</editor-fold>
  }

  //<editor-fold desc="Helpers">

  private updateControls() {
    this._controls$.next(this.controls);
  }

  private scaleToSize(size: number) {
    size = Math.max(0, size);
    if (this.controls.length === size) return;
    if (size === 0) {
      this.clear();
      return;
    }

    if (size < this.controls.length) {
      while (size < this.controls.length) {
        super.removeAt(this.controls.length - 1);
      }
      this.updateControls();
      return;
    }

    if (size > this.controls.length) {
      while (size > this.controls.length) {
        super.push(this.templateLayer.clone());
      }
      this.updateControls();
    }
  }

  //</editor-fold>

  /** @inheritDoc */
  clear() {
    super.clear();
    this.updateControls();
  }

  /** @inheritDoc */
  reset(values: TValue[] = []) {
    this.scaleToSize(values.length);
    super.reset(values);
  }

  /** @inheritDoc */
  patchValue(values: TValue[] = []) {
    super.patchValue(values);
  }

  /** @inheritDoc */
  setValue(values: TRaw[]) {
    this.scaleToSize(values.length);
    super.setValue(values);
  }

  //<editor-fold desc="Mutations">

  /**
   * Add a form layer to the end of the list
   * @param control - The layer
   */
  push(control: FormLayer<TControls, TValue, TRaw>) {
    super.push(control);
    this.updateControls();
  }

  /**
   * Add a value to the end of the list.
   * The value is converted to a Form Layer and appended.
   * @param value - The value to add
   */
  addElement(value?: TValue) {
    const layer = this.templateLayer.clone();
    if (value) layer.reset(value);
    this.push(layer);
    return layer;
  }

  /**
   * Update the value of the first match in the list.
   * If no match is found, add the item.
   * @param filter - The search filter
   * @param value - The value to update with
   */
  setElement(filter: (x: TValue) => boolean, value: TValue) {
    const control = this.controls.find(x => filter(x.value));
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
    const control = this.controls.find(x => filter(x.value));
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
  removeElement(filter: (x: TValue) => boolean) {
    const index = this.controls.findIndex(x => filter(x.value));
    if (index < 0) return false;

    this.removeAt(index);
    return true;
  }

  /**
   * Remove the given form layer
   * @param layer - The layer to remove
   */
  remove(layer: AbstractControl) {
    const index = this.controls.findIndex(x => x === layer);
    if (index < 0) return false;

    this.removeAt(index);
    return true;
  }

  /**
   * Remove a layer at a specified index
   * @param index - The index at which to remove the item
   */
  removeAt(index: number) {
    super.removeAt(index);
    this.updateControls();
  }
  //</editor-fold>

  //<editor-fold desc="Move Actions">

  /**
   * Move an item the list based on the Material CDK payload
   * @param data - The CDK move data
   */
  moveCdkElement(data: {previousIndex: number, currentIndex: number}) {
    this.moveElement(data.previousIndex, data.currentIndex);
  }

  /**
   * Move an element in the list
   * @param oldIndex - The Index of the element to move
   * @param newIndex - The target index for the element
   */
  moveElement(oldIndex: number, newIndex: number) {
    const control = this.controls[oldIndex];
    super.removeAt(oldIndex);
    super.insert(newIndex, control);
    this.updateControls();
  }

  //</editor-fold>

  /** @inheritDoc */
  getRawValue(): TRaw[] {
    return super.getRawValue();
  }

  /**
   * Clone the list based on its configuration.
   * No values are moved over.
   */
  clone(): FormList<TControls, TValue, TRaw> {
    return new FormList<TControls, TValue, TRaw>(
      this.templateLayer.clone().controls,
      this.startLength
    );
  }
}

export class FormListConstructors {
  static Controls<TControls extends Record<string, SmartFormUnion>>(controls: TControls, startLength?: number): ControlFormList<TControls> {
    return new FormList(controls, startLength);
  }

  static Model<TModel extends Record<string, any>>(controls: FormGroupControls<TModel>, startLength?: number): ModelFormList<TModel> {
    return new FormList(controls);
  }
}

export type ModelFormList<TModel extends Record<string, any>> = FormList<FormGroupControls<TModel>, DeepPartial<TModel>, TModel>;
export type ControlFormList<TControls extends Record<string, SmartFormUnion>> = FormList<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>>;
export type AnyControlFormList<TControls extends Record<string, SmartFormUnion>> = FormList<TControls, any, any>;
