import {auditTime, BehaviorSubject, combineLatest, Observable, of, switchMap} from 'rxjs';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
import {FormLayer} from "./form-layer";
import {FormGroupControls, FormGroupValue, FormGroupValueRaw, SmartFormUnion} from "../tools/form-types";
import {deepEquals, DeepPartial, SimpleObject} from "@consensus-labs/ts-tools";
import {cache} from "@consensus-labs/rxjs-tools";

export interface FormRootOptions<TValue> {
  /** A method for validating the form */
  generateError?: (val: TValue) => string | undefined;
  /** A method for validating the form with warnings */
  generateWarning?: (val: TValue) => string | undefined;
}

export class FormRoot<TControls extends Record<string, SmartFormUnion>, TValue extends SimpleObject, TRaw extends SimpleObject> extends FormLayer<TControls, TValue, TRaw> {

  /** An observable denoting if the form is valid */
  public readonly valid$: Observable<boolean>;

  //<editor-fold desc="Form validation">

  private generateError?: (val: TValue) => string | undefined;
  private generateWarning?: (val: TValue) => string | undefined;

  private _rootError$ = new BehaviorSubject<string | undefined>(undefined);
  /** An observable containing any error that exists at root level */
  readonly rootError$ = this._rootError$.asObservable();
  /** Get any error that exists at root level */
  get rootError() {return this._rootError$.value}

  private _rootWarning$ = new BehaviorSubject<string | undefined>(undefined);
  /** An observable containing any warning that exists at root level */
  readonly rootWarning$ = this._rootWarning$.asObservable();
  /** Get any warning that exists at root level */
  get rootWarning() {return this._rootWarning$.value}

  //</editor-fold>

  //<editor-fold desc="Form State">

  private _changed$ = new BehaviorSubject(false);
  /** An observable denoting if the contents of the form have changed since last reset */
  readonly changed$ = this._changed$.asObservable();
  /** Whether the contents of the form have changed since last reset */
  get changed(): boolean {return this._changed$.value}

  private _oldValue$: BehaviorSubject<TRaw>;
  /** An observable containing the latest snapshot of the form */
  readonly oldValue$: Observable<TRaw>;
  /** The latest snapshot of the form */
  get oldValue(): TRaw {return this._oldValue$.value};

  private _resetValue$ = new BehaviorSubject<TRaw|undefined>(undefined);
  /** An observable containing the latest value used to reset the form */
  readonly resetValue$ = this._resetValue$.asObservable();
  /** The latest value used to reset the form */
  get resetValue(): TRaw|undefined {return this._resetValue$.value};

  private _canSubmit$ = new BehaviorSubject(false);
  /** An observable denoting if the form is valid for submission */
  readonly canSubmit$ = this._canSubmit$.asObservable();
  /** Whether the form is valid for submission */
  get canSubmit() {
    return this._canSubmit$.value;
  }

  private _canCreate$ = new BehaviorSubject(false);
  /** An observable denoting if the form is valid for creation */
  readonly canCreate$ = this._canCreate$.asObservable();
  /** Whether the form is valid for creation */
  get canCreate() {
    return this._canCreate$.value;
  }

  //</editor-fold>

  constructor(template: TControls, options: FormRootOptions<TValue> = {}) {

    super(template);

    this._oldValue$ = new BehaviorSubject<TRaw>(this.getRawValue());
    this.oldValue$ = this._oldValue$.asObservable();

    if (options.generateError) this.generateError = options.generateError;
    if (options.generateWarning) this.generateWarning = options.generateWarning;

    this.throttledValue$.pipe(
      map(x => this.generateError?.(x)),
      distinctUntilChanged()
    ).subscribe(this._rootError$);

    this.throttledValue$.pipe(
      map(x => this.generateWarning?.(x)),
      distinctUntilChanged()
    ).subscribe(this._rootWarning$);

    this.valid$ = this._rootError$.pipe(
      switchMap(error => error
        ? of(false)
        : this._status$.pipe(map(x => x === 'VALID'))
      ),
      cache()
    );

    combineLatest([this.rawValue$, this.oldValue$]).pipe(
      auditTime(0),
      map(([value, oldValue]) => !deepEquals(value, oldValue)),
      tap(changed => {
        if (!changed) return;
        if (this.pristine) this.markAsDirty();
        if (this.untouched) this.markAsTouched();
      })
    ).subscribe(this._changed$);

    this.valid$.subscribe(this._canCreate$);
    this.valid$.pipe(
      switchMap(valid => valid ? this.changed$ : of(false))
    ).subscribe(this._canSubmit$);
  }

  /** @inheritDoc */
  reset(value?: TValue): void {
    super.reset(value);
    const rawValue = this.getRawValue();
    this._oldValue$.next(rawValue);
    this._resetValue$.next(value === undefined ? undefined : rawValue);
  }

  /**
   * Roll back to the last reset value.
   * Will reset to initial values of the form has never been reset.
   */
  rollback() {
    super.reset(this.resetValue as unknown as TValue|undefined);
  }
}

export class FormRootConstructors {

  /**
   * Create an anonymously typed form
   * @param controls - The controls for the form
   * @param options - Options
   * @constructor
   */
  static Controls<TControls extends Record<string, SmartFormUnion>>(controls: TControls, options?: FormRootOptions<FormGroupValue<TControls>>): ControlFormRoot<TControls> {
    return new FormRoot<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>>(controls);
  }

  /**
   * Create a form based on a type
   * @param controls - The controls matching the type
   * @param options - Options
   * @constructor
   */
  static Model<TModel extends Record<string, any>>(controls: FormGroupControls<TModel>, options?: FormRootOptions<DeepPartial<TModel>>): ModelFormRoot<TModel> {
    return new FormRoot<FormGroupControls<TModel>, DeepPartial<TModel>, TModel>(controls, options);
  }
}

export type ModelFormRoot<TModel extends Record<string, any>> = FormRoot<FormGroupControls<TModel>, DeepPartial<TModel>, TModel>;
export type ControlFormRoot<TControls extends Record<string, SmartFormUnion>> = FormRoot<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>>;
export type AnyControlFormRoot<TControls extends Record<string, SmartFormUnion>> = FormRoot<TControls, any, any>;
