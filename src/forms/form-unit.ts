import {computed, signal, Signal, WritableSignal} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {FormValidationData} from "../tools/form-types";

export abstract class FormUnit {

  abstract readonly rawValue: Signal<unknown | undefined>;
  abstract readonly value: Signal<unknown>;

  private readonly _reset$ = new Subject<void>();
  /** An event emitted when the input resets */
  readonly reset$: Observable<void> = this._reset$.asObservable();

  protected _disabled: WritableSignal<boolean>;
  /** A Signal denoting when the input is disabled */
  readonly disabled: Signal<boolean>;

  /** A list of warnings */
  abstract readonly warnings: Signal<string[]>;
  /** The warning data for the unit */
  abstract readonly warningState: Signal<FormValidationData[]>;
  /** A single warning for the unit. undefined if no warnings are present */
  readonly warning: Signal<string | undefined> = computed(() => this.warnings().at(0));

  /** A list of errors */
  abstract readonly errors: Signal<string[]>;
  /** The error data for the unit */
  abstract readonly errorState: Signal<FormValidationData[]>;

  /** A boolean indicating if the unit has an error */
  readonly hasError: Signal<boolean> = computed(() => this.errors().length <= 0);
  /** A single error for the unit. undefined if no errors are present */
  readonly error: Signal<string | undefined> = computed(() => this.errors().at(0));
  /** Indicates that the unit is valid */
  abstract readonly valid: Signal<boolean>;

  /** True if the value has changed since last reset */
  readonly abstract changed: Signal<boolean>;
  readonly abstract touched: Signal<boolean>;
  readonly pristine: Signal<boolean> = computed(() => !this.changed() && !this.touched());

  protected constructor(
    /** Indicates if the value can be null */
    readonly nullable: boolean,
    disabled: boolean,
  ) {
    this._disabled = signal(disabled);
    this.disabled = this._disabled.asReadonly();
  }

  public reset(): void {
    this._reset$.next();
  }

  /** Clear the unit to the default value without resetting it */
  abstract clear(): void;

  /** Roll back to the latest reset value */
  abstract rollback(): void;

  public abstract clone(): FormUnit;

  public abstract getDisabledValue(): unknown;

  //<editor-fold desc="Touched">
  public abstract markAsTouched(): void;
  public abstract markAsUntouched(): void;
  public toggleTouched(touched?: boolean): boolean {

    if (this.touched()) {
      if (touched === true) return false;
      this.markAsUntouched();
      return true;
    }

    if (touched === false) return false;
    this.markAsTouched();
    return true;
  }
  //</editor-fold>

  //<editor-fold desc="Disabled">
  public disable() {
    this._disabled.set(true);
  }

  public enable() {
    this._disabled.set(false);
  }

  public toggleDisabled(disable?: boolean) {

    if (this.disabled()) {
      if (disable === true) return false;
      this.markAsUntouched();
      return true;
    }

    if (disable === false) return false;
    this.markAsTouched();
    return true;
  }
  //</editor-fold>
}
