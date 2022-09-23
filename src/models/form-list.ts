import {FormError, FormGroupControls, FormGroupValue, FormGroupValueRaw, SmartFormUnion} from "../tools/form-types";
import {FormLayer} from "./form-layer";
import {asyncScheduler, BehaviorSubject, combineLatest, Observable, switchMap} from "rxjs";
import {distinctUntilChanged, map, throttleTime} from "rxjs/operators";
import {AbstractControl, FormArray, FormControlStatus} from "@angular/forms";
import {DeepPartial, hasId, SimpleObject} from "@consensus-labs/ts-tools";
import {cache} from "../tools/rxjs";
import {MoveModel} from "../tools/models";


export class FormList<TControls extends Record<string, SmartFormUnion>, TValue extends SimpleObject, TRaw extends SimpleObject> extends FormArray {

  protected readonly _status$: BehaviorSubject<FormControlStatus>;
  public readonly disabled$: Observable<boolean>;
  public readonly errors$: Observable<FormError[]>;

  readonly value!: TValue[];
  readonly valueChanges!: Observable<TValue[]>;
  private readonly _value$: BehaviorSubject<TValue[]>;
  public readonly value$: Observable<TValue[]>;
  public readonly throttledValue$: Observable<TValue[]>;

  public rawValue$: Observable<TRaw[]>;

  public controls!: FormLayer<TControls, TValue, TRaw>[];
  public _controls$: BehaviorSubject<FormLayer<TControls, TValue, TRaw>[]>;
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

  clear() {
    super.clear();
    this.updateControls();
  }

  reset(values: TValue[] = []) {
    this.scaleToSize(values.length);
    super.reset(values);
  }

  patchValue(values: TValue[] = []) {
    super.patchValue(values);
  }

  setValue(values: TRaw[]) {
    this.scaleToSize(values.length);
    super.setValue(values);
  }

  //<editor-fold desc="Mutations">
  push(control: FormLayer<TControls, TValue, TRaw>) {
    super.push(control);
    this.updateControls();
  }

  addElement(value?: TValue) {
    const layer = this.templateLayer.clone();
    if (value) layer.reset(value);
    this.push(layer);
    return layer;
  }

  setElement(filter: (x: TValue) => boolean, value: TValue) {
    const control = this.controls.find(x => filter(x.value));
    if (!control) return this.addElement(value);
    control.patchValue(value);
    return control;
  }

  updateElement(filter: (x: TValue) => boolean, value: TValue) {
    const control = this.controls.find(x => filter(x.value));
    if (!control) return null;
    control.patchValue(value);
    return control;
  }

  toggleElement(filter: (x: TValue) => boolean, value: TValue) {
    const removed = this.remove(filter);
    if (!removed) return this.addElement(value);
    return null;
  }

  remove(filter: (x: TValue) => boolean) {
    const index = this.controls.findIndex(x => filter(x.value));
    if (index < 0) return false;

    this.removeAt(index);
    return true;
  }

  removeElement(layer: AbstractControl) {
    const index = this.controls.findIndex(x => x === layer);
    if (index < 0) return false;

    this.removeAt(index);
    return true;
  }

  removeAt(index: number) {
    super.removeAt(index);
    this.updateControls();
  }
  //</editor-fold>

  //<editor-fold desc="Move Actions">
  moveSortableElement(data: MoveModel) {
    const oldIndex = this.value.findIndex(x => hasId(x) && x['id'] === data.id);
    this.moveElement(oldIndex, data.index);
  }

  moveCdkElement(data: {previousIndex: number, currentIndex: number}) {
    this.moveElement(data.previousIndex, data.currentIndex);
  }

  moveElement(oldIndex: number, newIndex: number) {
    const control = this.controls[oldIndex];
    super.removeAt(oldIndex);
    super.insert(newIndex, control);
    this.updateControls();
  }
  //</editor-fold>

  getRawValue(): TRaw[] {
    return super.getRawValue();
  }

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
