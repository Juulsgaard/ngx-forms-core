import {Mutable, ValueObject} from "@juulsgaard/ts-tools";
import {IFormLayer} from "../units/layer/form-layer.interface";
import {IFormInput} from "../units/input/form-input.interface";
import {IFormList} from "../units/list/form-list.interface";
import {IFormNode} from "../units/node/form-node.interface";
import {IFormUnit} from "../units/unit/form-unit.interface";
import {isFormInput} from "../predicates/is-form-input";
import {isFormLayer} from "../predicates/is-form-layer";
import {isFormList} from "../predicates/is-form-list";

export const formPathSymbol = Symbol("pathSymbol");

export type UnknownFormPath = {
  readonly [formPathSymbol]: IFormUnit
}

export type FormInputPath<T> = {
  readonly [formPathSymbol]: IFormInput<T>
};

export type FormLayerPath<T> = {
  readonly [formPathSymbol]: IFormLayer<T>
} & {
  readonly [K in keyof T]-?: FormPath<T[K]>;
};

export type FormListPath<T> = {
  readonly [formPathSymbol]: IFormList<T>
} & {
  readonly length: number,
  readonly at: (index: number) => FormLayerPath<T> | undefined;
  readonly [Symbol.iterator]: () => IterableIterator<FormLayerPath<T>>
};

export type FormPath<T> =
  [NonNullable<T>] extends [ValueObject] ? FormInputPath<T> :
    [NonNullable<T>] extends [ReadonlyArray<infer U>]
      ? [NonNullable<U>] extends [Record<string, any>]
        ? FormListPath<U>
        : FormInputPath<U[]>
      : [NonNullable<T>] extends [Record<string, any>]
        ? FormLayerPath<T>
        : FormInputPath<T>;

export function getFormPath<T>(node: IFormLayer<T>): FormLayerPath<T>;
export function getFormPath<T>(node: IFormList<T>): FormListPath<T>;
export function getFormPath<T>(node: IFormInput<T>): FormInputPath<T>;
export function getFormPath<T>(node: IFormNode<T>): FormPath<T>;
export function getFormPath(node: IFormUnit): UnknownFormPath {

  if (isFormInput(node)) {
    return {[formPathSymbol]: node};
  }

  if (isFormLayer(node)) {
    const path = {[formPathSymbol]: node} as Mutable<FormLayerPath<any>>;
    const controls = node.controls();

    for (let key in controls) {
      path[key] = getFormPath(controls[key]!);
    }

    return path;
  }

  if (isFormList(node)) {
    const path = {[formPathSymbol]: node} as Mutable<FormListPath<any>>;
    const children = node.controls().map(x => getFormPath(x));

    path.length = children.length;
    path.at = (index: number) => children.at(index);
    path[Symbol.iterator] = children[Symbol.iterator];

    return path;
  }

  throw new Error(`Invalid form node '${typeof node}'`);
}
