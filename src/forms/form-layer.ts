import {FormControlStatus, FormGroup} from "@angular/forms";
import {asyncScheduler, BehaviorSubject, combineLatest, mergeWith, Observable, skip, Subject} from "rxjs";
import {distinctUntilChanged, map, throttleTime} from "rxjs/operators";
import {FormError, FormGroupControls, FormGroupValue, FormGroupValueRaw, SmartFormUnion} from "../tools/form-types";
import {DeepPartial, mapObj, SimpleObject} from "@consensus-labs/ts-tools";
import {AnonFormNode, FormNode} from "./form-node";
import {cache} from "@consensus-labs/rxjs-tools";

export interface AnonFormLayer {
  /** An observable denoting when the layer is disabled */
  readonly disabled$: Observable<boolean>;
  /** An observable containing all the current errors of the Layer */
  readonly errors$: Observable<FormError[]>;

  /** An observable containing a list of all the Form Nodes in the layer */
  readonly inputList$: Observable<AnonFormNode[]>;
  /** A list of all the Form Nodes in the layer */
  readonly inputList: FormNode<any>[];
}

export class FormLayer<TControls extends Record<string, SmartFormUnion>, TValue extends SimpleObject, TRaw extends SimpleObject> extends FormGroup {

  protected readonly _status$: BehaviorSubject<FormControlStatus>;
  /** An observable denoting when the layer is disabled */
  public readonly disabled$: Observable<boolean>;
  /** An observable containing all the current errors of the Layer */
  public readonly errors$: Observable<FormError[]>;

  private readonly _value$: BehaviorSubject<TValue>;
  /** An observable containing the current value */
  public readonly value$: Observable<TValue>;
  protected readonly _throttledValue$ = new Subject<TValue>();
  /** A throttled observable containing the current value */
  public readonly throttledValue$: Observable<TValue>;

  private readonly _controls$: BehaviorSubject<TControls>;
  /** An observable containing the current controls in the layer */
  public readonly controls$: Observable<TControls>;

  private readonly _inputList$: BehaviorSubject<FormNode<any>[]>;
  /** An observable containing a list of all the Form Nodes in the layer */
  public readonly inputList$: Observable<FormNode<any>[]>;
  /** A list of all the Form Nodes in the layer */
  get inputList(): FormNode<any>[] {return this._inputList$.value}

  /** A throttled observable containing the raw value of the layer */
  public rawValue$: Observable<TRaw>;

  constructor(controls: TControls) {
    super(controls);

    this._controls$ = new BehaviorSubject(this.controls);
    this.controls$ = this._controls$.asObservable();

    this._inputList$ = new BehaviorSubject(Object.values(this.controls).filter(x => x instanceof FormNode) as FormNode<any>[]);
    this.controls$.pipe(
      skip(1),
      map(controls => Object.values(controls).filter(x => x instanceof FormNode) as FormNode<any>[])
    ).subscribe(this._inputList$);
    this.inputList$ = this._inputList$.asObservable();

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
      mergeWith(this._throttledValue$),
      distinctUntilChanged(),
      cache()
    );

    this.rawValue$ = this.throttledValue$.pipe(
      map(() => this.getRawValue()),
      cache()
    );

    //<editor-fold desc="Errors">
    const errorLists = Object.entries(this.controls)
      .map(([key, control]) => control.errors$.pipe(
        map(errors => errors.map(
          ({error, path}) => ({path: [key, ...path], error})
        ))
      ));
    this.errors$ = combineLatest(errorLists).pipe(
      throttleTime(100, asyncScheduler, {leading: true, trailing: true}),
      map(arr => ([] as FormError[]).concat(...arr)),
      cache()
    );
    //</editor-fold>
  }

  /** @inheritDoc */
  override registerControl<K extends Extract<keyof TControls, string>>(name: K, control: TControls[K]): TControls[K] {
    const activeControl = super.registerControl(name, control);
    if (activeControl === control) {
      this._controls$.next(this.controls);
    }
    return activeControl;
  }

  /** @inheritDoc */
  override removeControl<K extends Extract<keyof TControls, string>>(name: K) {
    super.removeControl(name);
    this._controls$.next(this.controls);
  }

  /** @inheritDoc */
  override addControl<K extends Extract<keyof TControls, string>>(name: K, control: Required<TControls>[K]) {
    super.addControl(name, control);
  }

  /** @inheritDoc */
  override setControl<K extends Extract<keyof TControls, string>>(name: K, control: TControls[K]) {
    super.setControl(name, control);
  }

  //<editor-fold desc="Value overrides">
  /** @inheritDoc */
  declare public readonly value: TValue;
  /** @inheritDoc */
  declare public readonly valueChanges: Observable<TValue>;
  /**
   * The current controls in this layer
   */
  declare public readonly controls: TControls;

  /** @inheritDoc */
  override getRawValue(): TRaw {
    return super.getRawValue();
  }

  /** @inheritDoc */
  override setValue(value: TRaw) {
    return super.setValue(value);
  }

  /** @inheritDoc */
  override patchValue(value: TValue) {
    return super.patchValue(value);
  }

  /** @inheritDoc */
  override reset(value?: TValue) {
    super.reset(value ?? {});
    this._throttledValue$.next(this.value);
  }

  //</editor-fold>

  /**
   * Create a clone of the layer and all it's controls.
   * This does not clone over any values.
   */
  clone(): FormLayer<TControls, TValue, TRaw> {
    return new FormLayer<TControls, TValue, TRaw>(mapObj(this.controls, x => x.clone()) as TControls);
  }
}

export module FormLayerConstructors {

  /**
   * Create an anonymously typed layer
   * @param controls - The controls for the layer
   * @constructor
   */
  export function Controls<TControls extends Record<string, SmartFormUnion>>(controls: TControls): ControlFormLayer<TControls> {
    return new FormLayer(controls);
  }

  /**
   * Create a layer based on a type
   * @param controls - The controls matching the type
   * @constructor
   */
  export function Model<TModel extends Record<string, any>>(controls: FormGroupControls<TModel>): ModelFormLayer<TModel> {
    return new FormLayer(controls);
  }
}

export type AnyControlFormLayer<TControl extends Record<string, SmartFormUnion>> = FormLayer<TControl, any, any>;
export type ModelFormLayer<TModel extends Record<string, any>> = FormLayer<FormGroupControls<TModel>, DeepPartial<TModel>, TModel>;
export type ControlFormLayer<TControl extends Record<string, SmartFormUnion>> = FormLayer<TControl, FormGroupValue<TControl>, FormGroupValueRaw<TControl>>;



