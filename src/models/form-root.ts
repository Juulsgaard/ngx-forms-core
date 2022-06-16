import {auditTime, BehaviorSubject, combineLatest, Observable, of, switchMap} from 'rxjs';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
import {FormLayer} from "./form-layer";
import {FormGroupControls, FormGroupValue, FormGroupValueRaw, SmartFormUnion} from "../tools/form-types";
import {deepEquals, DeepPartial} from "@consensus-labs/ts-tools";
import {cache} from "../tools/rxjs";

export interface FormRootOptions<TValue> {
  generateError?: (val: TValue) => string | undefined;
  generateWarning?: (val: TValue) => string | undefined;
}

export class FormRoot<TControls extends Record<string, SmartFormUnion>, TValue, TRaw> extends FormLayer<TControls, TValue, TRaw> {

  public readonly valid$: Observable<boolean>;

  //<editor-fold desc="Form validation">
  private generateError?: (val: TValue) => string | undefined;
  private generateWarning?: (val: TValue) => string | undefined;

  private _rootError$ = new BehaviorSubject<string | undefined>(undefined);
  readonly rootError$ = this._rootError$.asObservable();
  get rootError() {return this._rootError$.value}
  private _rootWarning$ = new BehaviorSubject<string | undefined>(undefined);
  readonly rootWarning$ = this._rootWarning$.asObservable();
  get rootWarning() {return this._rootWarning$.value}
  //</editor-fold>

  //<editor-fold desc="Form State">
  private _changed$ = new BehaviorSubject(false);
  readonly changed$ = this._changed$.asObservable();
  get changed() {return this._changed$.value}

  private _oldValue$ = new BehaviorSubject<TRaw|undefined>(undefined);
  readonly oldValue$ = this._oldValue$.asObservable();
  get oldValue() {return this._oldValue$.value};

  private _canSubmit$ = new BehaviorSubject(false);
  readonly canSubmit$ = this._canSubmit$.asObservable();

  get canSubmit() {
    return this._canSubmit$.value;
  }

  private _canCreate$ = new BehaviorSubject(false);
  readonly canCreate$ = this._canCreate$.asObservable();

  get canCreate() {
    return this._canCreate$.value;
  }

  //</editor-fold>

  constructor(template: TControls, options: FormRootOptions<TValue> = {}) {

    super(template);

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

  reset(value?: TValue): void {
    super.reset(value);
    this._oldValue$.next(value ? this.getRawValue() : undefined);
  }

  rollback() {
    super.reset(this.oldValue as unknown as TValue|undefined);
  }
}

export class FormRootConstructors {
  static Controls<TControls extends Record<string, SmartFormUnion>>(controls: TControls, options?: FormRootOptions<FormGroupValue<TControls>>): ControlFormRoot<TControls> {
    return new FormRoot<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>>(controls);
  }

  static Model<TModel extends Record<string, any>>(controls: FormGroupControls<TModel>, options?: FormRootOptions<DeepPartial<TModel>>): ModelFormRoot<TModel> {
    return new FormRoot<FormGroupControls<TModel>, DeepPartial<TModel>, TModel>(controls, options);
  }
}

export type ModelFormRoot<TModel extends Record<string, any>> = FormRoot<FormGroupControls<TModel>, DeepPartial<TModel>, TModel>;
export type ControlFormRoot<TControls extends Record<string, SmartFormUnion>> = FormRoot<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>>;
export type AnyControlFormRoot<TControls extends Record<string, SmartFormUnion>> = FormRoot<TControls, any, any>;
