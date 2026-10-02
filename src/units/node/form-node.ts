import {IFormNode} from "./form-node.interface";
import {Signal} from "@angular/core";
import {DeepPartial} from "@juulsgaard/ts-tools";
import {FormUnit} from "../unit/form-unit";

export abstract class FormNode<T> extends FormUnit implements IFormNode<T> {

  abstract readonly rawValue: Signal<DeepPartial<T> | T | undefined>;
  abstract readonly value: Signal<T>;
  abstract readonly resetValue: Signal<T>;

  abstract readonly debouncedRawValue: Signal<DeepPartial<T> | T | undefined>;
  abstract readonly debouncedValue: Signal<T>;

  /** Get the value of the unit if it's valid. Otherwise throw an error */
  abstract getValidValue(): T;

  abstract getDisabledValue(): T;

  /** Get the value of the unit if it's valid. Otherwise return default */
  abstract getValidValueOrDefault<TDefault>(defaultVal: TDefault): T | TDefault;

  /** Get the value of the unit if it's valid. Otherwise return undefined */
  abstract getValidValueOrDefault(): T | undefined;

  abstract setValue(value: T): void;
}
