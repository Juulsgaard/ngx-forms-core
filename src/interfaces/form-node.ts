import {Signal} from "@angular/core";
import {IFormUnit, IReadonlyFormUnit} from "./form-unit";
import {DeepPartial} from "@juulsgaard/ts-tools";

export interface IReadonlyFormNode<T> extends IReadonlyFormUnit {

  readonly rawValue: Signal<T | undefined>;
  readonly value: Signal<T>;
  readonly resetValue: Signal<T>;

  readonly debouncedRawValue: Signal<T | undefined>;
  readonly debouncedValue: Signal<T>;

  /** Get the value of the unit if it's valid. Otherwise throw an error */
  getValidValue(): T;
  /** Get the value of the unit if it's valid. Otherwise return default */
  getValidValueOrDefault<TDefault>(defaultVal: TDefault): T|TDefault;
  /** Get the value of the unit if it's valid. Otherwise return undefined */
  getValidValueOrDefault(): T|undefined;
}

export interface IFormNode<T> extends IFormUnit, IReadonlyFormNode<T> {

  setValue(value: T): void;
  patchValue(value: DeepPartial<T>|T): void;
  reset(value?: DeepPartial<T>|T): void;

}
