import {FormControlStatus, FormGroup} from "@angular/forms";
import {asyncScheduler, BehaviorSubject, combineLatest, Observable, skip} from "rxjs";
import {map, throttleTime} from "rxjs/operators";
import {FormError, FormGroupControls, FormGroupValue, FormGroupValueRaw, SmartFormUnion} from "../tools/form-types";
import {DeepPartial, mapObj} from "@consensus-labs/ts-tools";
import {FormNode} from "./form-node";
import {cache} from "../tools/rxjs";


export class FormLayer<TControls extends Record<string, SmartFormUnion>, TValue, TRaw> extends FormGroup {

  protected readonly _status$: BehaviorSubject<FormControlStatus>;
  public readonly disabled$: Observable<boolean>;
  public readonly errors$: Observable<FormError[]>;

  private readonly _value$: BehaviorSubject<TValue>;
  public readonly value$: Observable<TValue>;
  public readonly throttledValue$: Observable<TValue>;

  private readonly _controls$: BehaviorSubject<TControls>;
  public readonly controls$: Observable<TControls>;

  private readonly _inputList$: BehaviorSubject<FormNode<any>[]>;
  public readonly inputList$: Observable<FormNode<any>[]>;
  get inputList(): FormNode<any>[] {return this._inputList$.value}

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

  registerControl<K extends Extract<keyof TControls, string>>(name: K, control: TControls[K]): TControls[K] {
    const activeControl = super.registerControl(name, control);
    if (activeControl === control) {
      this._controls$.next(this.controls);
    }
    return activeControl;
  }

  removeControl<K extends Extract<keyof TControls, string>>(name: K) {
    super.removeControl(name);
    this._controls$.next(this.controls);
  }

  //<editor-fold desc="Value overrides">
  public readonly value!: TValue;
  public readonly valueChanges!: Observable<TValue>;
  public readonly controls!: TControls;

  getRawValue(): TRaw {
    return super.getRawValue();
  }

  setValue(value: TRaw) {
    return super.setValue(value);
  }

  patchValue(value: TValue) {
    return super.patchValue(value);
  }

  reset(value?: TValue) {
    super.reset(value);
  }

  //</editor-fold>

  clone(): FormLayer<TControls, TValue, TRaw> {
    return new FormLayer<TControls, TValue, TRaw>(mapObj(this.controls, x => x.clone()) as TControls);
  }
}

export class FormLayerConstructors {
  static Controls<TControls extends Record<string, SmartFormUnion>>(controls: TControls): ControlFormLayer<TControls> {
    return new FormLayer(controls);
  }

  static Model<TModel extends Record<string, any>>(controls: FormGroupControls<TModel>): ModelFormLayer<TModel> {
    return new FormLayer(controls);
  }
}

export type AnyControlFormLayer<TControl extends Record<string, SmartFormUnion>> = FormLayer<TControl, any, any>;
export type ModelFormLayer<TModel extends Record<string, any>> = FormLayer<FormGroupControls<TModel>, DeepPartial<TModel>, TModel>;
export type ControlFormLayer<TControl extends Record<string, SmartFormUnion>> = FormLayer<TControl, FormGroupValue<TControl>, FormGroupValueRaw<TControl>>;



