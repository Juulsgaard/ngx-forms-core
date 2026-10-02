import {computed, Signal} from "@angular/core";
import {ValueObject} from "@juulsgaard/ts-tools";
import {IFormNode} from "../units/node/form-node.interface";
import {NewFuncProp} from "../types";
import {IFormLayer} from "../units/layer/form-layer.interface";
import {nonFuncProp} from "./helpers";
import {IFormUnit} from "../units/unit/form-unit.interface";
import {IFormInput} from "../units/input/form-input.interface";
import {IFormList} from "../units/list/form-list.interface";
import {isFormInput} from "../predicates/is-form-input";
import {isFormLayer} from "../predicates/is-form-layer";
import {isFormList} from "../predicates/is-form-list";

export type FormLayerValues<T> = Signal<T> & {
  readonly [K in keyof T as NewFuncProp<K>]-?: FormValues<T[K]>;
};

export type FormListValues<T> = Signal<T[]> & {
  count: number,
  at: (index: number) => FormLayerValues<T>|undefined;
  [Symbol.iterator]: () => IterableIterator<FormLayerValues<T>>
};

export type FormValues<T> =
  [NonNullable<T>] extends [ValueObject] ? Signal<T> :
    [NonNullable<T>] extends [ReadonlyArray<infer U>]
      ? [NonNullable<U>] extends [Record<string, any>]
        ? FormListValues<U>
        : Signal<U[]>
      : [NonNullable<T>] extends [Record<string, any>]
        ? FormLayerValues<T>
        : Signal<T>;


export function getFormValues<T>(node: IFormLayer<T>): FormLayerValues<T>;
export function getFormValues<T>(node: IFormList<T>): FormListValues<T>;
export function getFormValues<T>(node: IFormInput<T>): Signal<T>;
export function getFormValues<T>(node: IFormNode<T>): FormValues<T>;
export function getFormValues(node: IFormUnit): FormValues<unknown> {

  if (isFormInput(node)) {
    return node.debouncedValue;
  }

  if (isFormLayer(node)) {
    const signal = computed(() => node.debouncedValue()) as FormLayerValues<unknown>;
    const controls = node.controls();

    for (let key in controls) {
      const child: IFormNode<any> = controls[key]!;
      const prop: keyof FormLayerValues<unknown> = nonFuncProp(key) as any;
      signal[prop] = getFormValues(child) as FormValues<unknown>;
    }

    return signal;
  }

  if (isFormList(node)) {

    const signal = computed(() => node.debouncedValue()) as Signal<unknown> as FormListValues<unknown>;
    const children = node.controls().map(x => getFormValues(x) as FormLayerValues<any>);

    signal.count = children.length;
    signal.at = (index: number) => children.at(index);
    signal[Symbol.iterator] = children[Symbol.iterator];

    return signal;
  }

  throw new Error(`Invalid form node '${typeof node}'`);
}
