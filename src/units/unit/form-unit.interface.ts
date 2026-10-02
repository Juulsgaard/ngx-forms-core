import {Observable} from "rxjs";
import {Signal} from "@angular/core";
import {FormValidationContext} from "../../tools";

export interface IReadonlyFormUnit {

  readonly nullable: boolean;

  /** An event emitted when the input resets */
  readonly reset$: Observable<void>
  /** A Signal denoting when the input is disabled */
  readonly disabled: Signal<boolean>;

  /** A list of warnings (async) */
  readonly warnings: Signal<string[]>;
  /** The warning data for the unit (async) */
  readonly warningState: Signal<FormValidationContext[]>;
  /** A single warning for the unit. undefined if no warnings are present (async) */
  readonly warning: Signal<string | undefined>;

  /** A list of errors (async) */
  readonly errors: Signal<string[]>;
  /** The error data for the unit (async) */
  readonly errorState: Signal<FormValidationContext[]>;

  /** A boolean indicating if the unit has an error (async) */
  readonly hasError: Signal<boolean>;
  /** A single error for the unit. undefined if no errors are present (async) */
  readonly error: Signal<string | undefined>;
  /** Indicates that the unit is valid (async) */
  readonly valid: Signal<boolean>;

  /** True if the value has changed since last reset */
  readonly changed: Signal<boolean>;
  /** True if any input has been interacted with */
  readonly touched: Signal<boolean>;
  /** True when both unchanged and untouched */
  readonly pristine: Signal<boolean>;
}

export interface IFormUnit extends IReadonlyFormUnit {
  /** Reset the value and state of the node and sub-nodes */
  reset(): void;

  /** Clear the unit to the default value without resetting it */
  clear(): void;

  /** Roll back to the latest reset value */
  rollback(): void;

  /** Create an identical clone of the Node */
  clone(): IFormUnit;

  markAsTouched(): void;

  markAsUntouched(): void;

  toggleTouched(touched?: boolean): boolean

  disable(): void;

  enable(): void;

  toggleDisabled(disable?: boolean): boolean;

  /** A synchronous validation check of the unit */
  isValid(): boolean;
}
