import {Signal} from "@angular/core";
import {IFormUnit, IReadonlyFormUnit} from "../unit/form-unit.interface";
import {DeepPartial} from "@juulsgaard/ts-tools";

export interface IReadonlyFormNode<T> extends IReadonlyFormUnit {

  readonly rawValue: Signal<DeepPartial<T> | T | undefined>;
  readonly debouncedRawValue: Signal<DeepPartial<T> | T | undefined>;
  readonly value: Signal<T>;
  readonly debouncedValue: Signal<T>;

  readonly resetValue: Signal<T>;


  /** Get the value of the unit if it's valid. Otherwise throw an error */
  getValidValue(): T;

  getDisabledValue(): T;

  /** Get the value of the unit if it's valid. Otherwise return default */
  getValidValueOrDefault<TDefault>(defaultVal: TDefault): T | TDefault;

  /** Get the value of the unit if it's valid. Otherwise return undefined */
  getValidValueOrDefault(): T | undefined;
}

export interface IFormNode<T> extends IReadonlyFormNode<T>, IFormUnit {

  setValue(value: T|undefined): void;

  reset(value?: DeepPartial<T> | T): void;

}

export type IAnonFormNode = IReadonlyFormNode<unknown> & IFormUnit;
