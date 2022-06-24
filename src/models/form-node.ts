import {FormControl, FormControlStatus, ValidatorFn, Validators} from '@angular/forms';
import {asyncScheduler, BehaviorSubject, combineLatest, delay, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, throttleTime} from 'rxjs/operators';
import {FormError} from "../tools/form-types";
import {deepEquals} from "@consensus-labs/ts-tools";
import {cache} from "../tools/rxjs";
import {parseFormErrors} from "../tools/errors";

export enum FormNodeEvent {
  Focus = 'focus'
}

export enum InputTypes {
  Generic = 'generic',
  Text = 'text',
  Url = 'url',
  Number = 'number',
  Password = 'password',
  Bool = 'boolean',
  Date = 'text-date',
  DateTime = 'datetime-local',
  Time = 'time',
  Color = 'color',
  Email = 'email',
  Phone = 'tel',
  LongText = 'textarea',
  HTML = 'html',
  Select = 'select',
  SelectMany = 'multipleSelect',
  Search = 'search',
  File = 'file'
}

interface FormNodeOptions {
  label?: string;
  autocomplete?: string;
  tooltip?: string;
  readonly?: boolean;
  autoFocus?: boolean;
  showDisabledField?: boolean;
}

export class FormNode<TInput> extends FormControl implements FormControl<TInput>, FormNodeOptions {

  value!: TInput;
  valueChanges!: Observable<TInput>;

  public readonly actions$ = new Subject<FormNodeEvent>();
  public readonly reset$ = new Subject<void>();

  private readonly _status$: BehaviorSubject<FormControlStatus>;
  public readonly disabled$: Observable<boolean>;

  private readonly _value$: BehaviorSubject<TInput>;
  public readonly value$: Observable<TInput>;
  public readonly throttledValue$: Observable<TInput>;

  public rawValue$: Observable<TInput>

  public readonly hasError$: Observable<boolean>;
  public readonly errors$: Observable<FormError[]>;
  public readonly error$: Observable<string|undefined>;

  label?: string;
  autocomplete?: string;
  tooltip?: string;
  readonly?: boolean;
  autoFocus?: boolean;
  showDisabledField?: boolean;

  private rawDefault?: TInput;

  public type: InputTypes;
  readonly defaultValue: TInput;
  readonly initialValue: TInput;
  readonly nullable: boolean;

  constructor(type: InputTypes, defaultValue: TInput, initialValue = defaultValue, nullable = false) {
    super(initialValue, {nonNullable: !nullable});

    this.type = type;

    this.initialValue = initialValue;
    this.defaultValue = defaultValue;
    this.nullable = nullable;

    this._status$ = new BehaviorSubject(this.status);
    this.statusChanges.subscribe(this._status$);
    this.disabled$ = this._status$.pipe(
      map(x => x === 'DISABLED')
    );

    this._value$ = new BehaviorSubject(this.value);
    this.valueChanges.subscribe(this._value$);
    this.value$ = this._value$.asObservable();

    this.throttledValue$ = this.value$.pipe(
      throttleTime(200, asyncScheduler, {trailing: true})
    );

    this.rawValue$ = combineLatest([this.value$, this.disabled$]).pipe(
      map(([val, disabled]) => disabled ? this.defaultValue : val),
      cache()
    );

    //<editor-fold desc="Errors">
    const errors$ = this.statusChanges.pipe(
      throttleTime(200, asyncScheduler, {leading: true, trailing: true}),
      map(x => x === 'INVALID' ? this.errors : null),
      distinctUntilChanged(deepEquals),
      cache()
    );
    errors$.subscribe();

    this.errors$ = errors$.pipe(
      map(x => parseFormErrors(x).map(error => ({path: [], error}))),
      cache()
    );
    this.error$ = this.errors$.pipe(
      map(x => x[0]?.error),
      cache()
    );

    this.hasError$ = errors$.pipe(
      delay(0),
      map(errors => {
        if (!errors) return false;
        if (!this.dirty) return false;
        return !!Object.keys(errors).length
      }),
      cache()
    );
    //</editor-fold>
  }

  /**
   * Set a default value for raw value
   * @param rawDefault
   * @internal
   */
  withRawDefault(rawDefault: TInput): this {
    this.rawDefault = rawDefault;
    return this;
  }

  //<editor-fold desc="Implementation">
  private getValueOrDefault(value: TInput|undefined): TInput {
    if (this.nullable) return value as TInput;
    if (!value) return this.defaultValue;
    return value;
  }

  private getValueOrInitial(value: TInput|undefined): TInput {
    if (this.nullable) return value as TInput;
    if (!value) return this.initialValue;
    return value;
  }

  override setValue(value: TInput|undefined) {
    super.setValue(this.getValueOrDefault(value));
  }

  override patchValue(value: TInput|undefined) {
    super.patchValue(this.getValueOrDefault(value));
  }

  override reset(value?: TInput) {
    super.reset(this.getValueOrInitial(value));
    this.reset$.next();
  }

  override getRawValue(): TInput {
    if (this.disabled) return this.rawDefault ?? this.defaultValue;
    return this.value ?? this.rawDefault as TInput;
  }
  //</editor-fold>

  //<editor-fold desc="Configuration">
  public required(): this {
    this.withValidators(Validators.required);
    return this;
  }

  public withLabel(label: string): this {
    this.label = label;
    return this;
  }

  public autocompleteAs(autocomplete: string): this {
    this.autocomplete = autocomplete;
    return this;
  }

  public withValidators(...validators: ValidatorFn[]): this {
    if (this.validator) this.setValidators([this.validator, ...validators]);
    else this.setValidators(validators);
    this.updateValueAndValidity();
    return this;
  }

  public withTooltip(tooltip: string): this {
    this.tooltip = tooltip;
    return this;
  }

  public showDisabled(): this {
    this.showDisabledField = true;
    return this;
  }

  public lock(): this {
    this.readonly = true;
    return this;
  }

  public withFocus(): this {
    this.autoFocus = true;
    return this;
  }
  //</editor-fold>

  //<editor-fold desc="Actions">
  focus() {
    setTimeout(() => this.actions$.next(FormNodeEvent.Focus), 0);
  }

  toggle() {
    if (this.type !== InputTypes.Bool) {
      console.error('You cannot toggle a non boolean value');
      return;
    }

    this.setValue(!this.value as any);
  }
  //</editor-fold>

  //<editor-fold desc="Clone">
  public from(options: FormNodeOptions): this {
    this.label = options.label;
    this.autocomplete = options.autocomplete;
    this.tooltip = options.tooltip;
    this.readonly = options.readonly;
    this.showDisabledField = options.showDisabledField;
    this.autoFocus = options.autoFocus;
    return this;
  }

  clone(): FormNode<TInput> {
    const node = new FormNode<TInput>(this.type, this.initialValue, this.defaultValue, this.nullable);
    node.from(this);
    if (this.validator) node.withValidators(this.validator);
    return node;
  }
  //</editor-fold>
}
