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

export interface FormNodeOptions {
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

  protected readonly _status$: BehaviorSubject<FormControlStatus>;
  public readonly disabled$: Observable<boolean>;

  protected readonly _value$: BehaviorSubject<TInput>;
  public readonly value$: Observable<TInput>;
  public readonly throttledValue$: Observable<TInput>;

  public rawValue$: Observable<TInput>

  public readonly hasError$: Observable<boolean>;
  public readonly errors$: Observable<FormError[]>;
  public readonly error$: Observable<string|undefined>;

  readonly label?: string;
  readonly autocomplete?: string;
  readonly tooltip?: string;
  readonly readonly?: boolean;
  readonly autoFocus?: boolean;
  readonly showDisabledField?: boolean;

  constructor(
    public readonly type: InputTypes,
    public readonly defaultValue: TInput,
    protected readonly initialValue: TInput = defaultValue,
    protected readonly nullable: boolean = false,
    protected readonly rawDefault?: TInput,
    protected readonly validators?: ValidatorFn[],
    options?: FormNodeOptions
  ) {
    super(initialValue, {nonNullable: !nullable, validators: validators});

    this.label = options?.label;
    this.autocomplete = options?.autocomplete;
    this.tooltip = options?.tooltip;
    this.readonly = options?.readonly;
    this.autoFocus = options?.autoFocus;
    this.showDisabledField = options?.showDisabledField;

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

  clone(): FormNode<TInput> {
    const node = new FormNodeConfig<TInput>(
      this.type,
      this.initialValue,
      this.defaultValue,
      this.nullable,
      this.rawDefault,
      this.validators
    );
    node.from(this);
    return node.done();
  }
}

export class FormNodeConfig<TInput> {

  protected label?: string;
  protected autocomplete?: string;
  protected tooltip?: string;
  protected readonly?: boolean;
  protected autoFocus?: boolean;
  protected showDisabledField?: boolean;

  constructor(
    protected type: InputTypes,
    protected defaultValue: TInput,
    protected initialValue: TInput = defaultValue,
    protected nullable: boolean = false,
    protected rawDefault?: TInput,
    protected validators: ValidatorFn[] = []
  ) {

  }

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
    this.validators.push(...validators);
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

  public asReadonly(): this {
    this.readonly = true;
    return this;
  }

  public withFocus(): this {
    this.autoFocus = true;
    return this;
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

  public from(options: FormNodeOptions): this {
    this.label = options.label;
    this.autocomplete = options.autocomplete;
    this.tooltip = options.tooltip;
    this.readonly = options.readonly;
    this.showDisabledField = options.showDisabledField;
    this.autoFocus = options.autoFocus;
    return this;
  }

  protected getOptions(): FormNodeOptions {
    return {
      label: this.label,
      readonly: this.readonly,
      autocomplete: this.autocomplete,
      autoFocus: this.autoFocus,
      showDisabledField: this.showDisabledField,
      tooltip: this.tooltip
    };
  }

  done(): FormNode<TInput> {
    return new FormNode<TInput>(
      this.type,
      this.defaultValue,
      this.initialValue,
      this.nullable,
      this.rawDefault,
      this.validators,
      this.getOptions()
    )
  }

}
