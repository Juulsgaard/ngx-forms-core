import {FormControl, FormControlStatus, ValidatorFn, Validators} from '@angular/forms';
import {asyncScheduler, BehaviorSubject, combineLatest, delay, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, throttleTime} from 'rxjs/operators';
import {AutoComplete, FormError} from "../tools/form-types";
import {deepEquals} from "@juulsgaard/ts-tools";
import {parseFormErrors} from "../tools/errors";
import {cache} from "@juulsgaard/rxjs-tools";

export enum FormNodeEvent {
  Focus = 'focus',
  Select = 'select',
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

  readonly label?: string;
  readonly autocomplete?: string;
  readonly tooltip?: string;
  readonly readonly?: boolean;
  readonly autoFocus?: boolean;
  readonly showDisabledField?: boolean;
}

export interface AnonFormNode extends FormNodeOptions {

  /** The type of the input */
  readonly type: InputTypes,

  /** Indicates if the value can be null */
  readonly nullable: boolean;

  /** An observable emitting input actions */
  readonly actions$: Observable<FormNodeEvent>;

  /** An event emitted when the input resets */
  readonly reset$: Observable<void>;

  /** An observable denoting when the input is disabled */
  readonly disabled$: Observable<boolean>;

  /** An observable denoting if the input has an error */
  readonly hasError$: Observable<boolean>;
  /** An observable denoting all the current errors for the input */
  readonly errors$: Observable<FormError[]>;
  /** An observable containing the current error state represented as a display string */
  readonly error$: Observable<string|undefined>;

  /**
   * Focus the input
   * @param selectValue - If true the contents of the input will be selected
   */
  focus(selectValue?: true): void;

  /** Toggle the input value if boolean */
  toggle(): void;
}

export class FormNode<TInput> extends FormControl implements FormControl<TInput>, AnonFormNode {

  /** The current value of the input */
  declare readonly value: TInput;
  /** @inheritDoc */
  declare readonly valueChanges: Observable<TInput>;

  private readonly _actions$ = new Subject<FormNodeEvent>()
  /** An observable emitting input actions */
  public readonly actions$ = this._actions$.asObservable();

  private readonly _reset$ = new Subject<void>();
  /** An event emitted when the input resets */
  public readonly reset$ = this._reset$.asObservable();

  protected readonly _status$: BehaviorSubject<FormControlStatus>;
  /** An observable denoting when the input is disabled */
  public readonly disabled$: Observable<boolean>;

  private readonly _value$: BehaviorSubject<TInput>;
  /** An observable for the current value of the input */
  public readonly value$: Observable<TInput>;
  /** A throttled observable containing the value with a rolling delay */
  public readonly throttledValue$: Observable<TInput>;

  /** An observable containing the computed raw value of the input */
  public readonly rawValue$: Observable<TInput>

  /** An observable denoting if the input has an error */
  public readonly hasError$: Observable<boolean>;
  /** An observable denoting all the current errors for the input */
  public readonly errors$: Observable<FormError[]>;
  /** An observable containing the current error state represented as a display string */
  public readonly error$: Observable<string|undefined>;

  /** The input label */
  readonly label?: string;
  /** The type of browser auto-compelte to use, if any */
  readonly autocomplete?: string;
  /** An optional tooltip for the input */
  readonly tooltip?: string;
  /** Whether or not the input is read-only */
  readonly readonly?: boolean;
  /** Determines if the input should auto focus */
  readonly autoFocus?: boolean;
  /** Show the input even when disabled */
  readonly showDisabledField?: boolean;

  /**
   * Create a Form Node manually.
   * It is recommended to use the `Form.xxx` constructors for configuring Form Nodes.
   * @param type - The type of the input
   * @param defaultValue - The default value of the input.
   * This input is used as a fallback for missing values.
   * @param initialValue - The initial value of the input.
   * This is used for initial setup and resetting the input.
   * Defaults to defaultValue.
   * @param nullable - Whether the input is nullable
   * @param rawDefault - Define a distinct default value for getting the raw value
   * @param disabledDefault - Define a distinct default raw value for when the input is disabled
   * @param validators - Add validators
   * @param options - Additional options
   */
  constructor(
    /** The type of the input */
    public readonly type: InputTypes,
    /** The default value of the input*/
    public override readonly defaultValue: TInput,
    protected readonly initialValue: TInput = defaultValue,
    public readonly nullable: boolean = false,
    protected readonly rawDefault?: TInput,
    protected readonly disabledDefault?: TInput,
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
    return value ?? this.defaultValue;
  }

  private getValueOrInitial(value: TInput|undefined): TInput {
    if (this.nullable) return value as TInput;
    return value ?? this.initialValue;
  }

  /** @inheritDoc */
  override setValue(value: TInput|undefined) {
    super.setValue(this.getValueOrDefault(value));
  }

  /** @inheritDoc */
  override patchValue(value: TInput|undefined) {
    super.patchValue(this.getValueOrDefault(value));
  }

  /** @inheritDoc */
  override reset(value?: TInput) {
    super.reset(this.getValueOrInitial(value));
    this._reset$.next();
  }

  /** @inheritDoc */
  override getRawValue(): TInput {
    if (this.disabled) return this.disabledDefault ?? this.rawDefault ?? this.defaultValue;
    if (this.nullable) return this.value;
    return this.value ?? this.rawDefault ?? this.defaultValue;
  }
  //</editor-fold>

  //<editor-fold desc="Actions">
  /**
   * Focus the input
   * @param selectValue - If true the contents of the input will be selected
   */
  focus(selectValue?: true) {
    setTimeout(() => {
      this._actions$.next(FormNodeEvent.Focus);
      if (selectValue) this._actions$.next(FormNodeEvent.Select);
    }, 0);
  }

  /** Toggle the input value if boolean */
  toggle() {
    if (this.type !== InputTypes.Bool) {
      console.error('You cannot toggle a non boolean value');
      return;
    }

    this.setValue(!this.value as any);
  }
  //</editor-fold>

  /**
   * Clone the input
   * This creates a duplicate of the configuration
   * It does not clone the value
   */
  clone(): FormNode<TInput> {
    const node = new FormNodeConfig<TInput>(
      this.type,
      this.initialValue,
      this.defaultValue,
      this.nullable,
      this.rawDefault,
      this.disabledDefault,
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

  /**
   * Manually create a Node Config.
   * It is recommended to use the `Form.xxx` for creating a configuration.
   * @param type - The type of the input
   * @param defaultValue - The default value of the input.
   * This input is used as a fallback for missing values.
   * @param initialValue - The initial value of the input.
   * This is used for initial setup and resetting the input.
   * Defaults to defaultValue.
   * @param nullable - Whether the input is nullable
   * @param rawDefault - Define a distinct default value for getting the raw value
   * @param disabledDefault - Define a distinct default raw value for when the input is disabled
   * @param validators - Add validators
   */
  constructor(
    protected type: InputTypes,
    protected defaultValue: TInput,
    protected initialValue: TInput = defaultValue,
    protected nullable: boolean = false,
    protected rawDefault?: TInput,
    protected disabledDefault?: TInput,
    protected validators: ValidatorFn[] = []
  ) {

  }

  /**
   * Mark the input as required
   */
  public required(): this {
    this.withValidators(Validators.required);
    return this;
  }

  /**
   * Add a label to the input
   * @param label
   */
  public withLabel(label: string): this {
    this.label = label;
    return this;
  }

  /**
   * Add HTML autocompletion to the input
   * @param autocomplete - The type of autocomplete
   */
  public autocompleteAs(autocomplete: AutoComplete): this {
    this.autocomplete = autocomplete;
    return this;
  }

  /**
   * Add validators to the input
   * @param validators
   */
  public withValidators(...validators: ValidatorFn[]): this {
    this.validators.push(...validators);
    return this;
  }

  /**
   * Add a tooltip to the input.
   * This can be used to explain details about the input and it's use.
   * @param tooltip - The tooltip to show
   */
  public withTooltip(tooltip: string): this {
    this.tooltip = tooltip;
    return this;
  }

  /**
   * Show the input even when disabled.
   * By default, disabled inputs are hidden.
   */
  public showDisabled(): this {
    this.showDisabledField = true;
    return this;
  }

  /**
   * Mark the input as read-only
   */
  public asReadonly(): this {
    this.readonly = true;
    return this;
  }

  /**
   * Autofocus on the input
   */
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

  /**
   * Set a default value for raw value when input is disabled
   * @param disabledDefault
   * @internal
   */
  withDisabledDefault(disabledDefault: TInput): this {
    this.disabledDefault = disabledDefault;
    return this;
  }

  /**
   * Populate this configuration based on a Node
   * @param options - The options from an existing Node
   */
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

  /**
   * Finalise the config and produce the input
   */
  done(): FormNode<TInput> {
    return new FormNode<TInput>(
      this.type,
      this.defaultValue,
      this.initialValue,
      this.nullable,
      this.rawDefault,
      this.disabledDefault,
      this.validators,
      this.getOptions()
    )
  }

}
