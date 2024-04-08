import {SimpleObject} from "@juulsgaard/ts-tools";
import {Signal} from "@angular/core";

export type FormMemoLayer<T> =
  { [K in keyof T]-?: FormMemoValue<T[K]> } &
  Signal<T>;

export type FormMemoList<T, TItem> =
  { [index: number]: FormMemoLayer<TItem> } &
  Iterable<FormMemoLayer<TItem>> &
  Signal<T>;

export type FormMemoValue<T> =
  NonNullable<T> extends (infer A extends SimpleObject)[] ? FormMemoList<T, A> :
    NonNullable<T> extends SimpleObject ? FormMemoLayer<T> :
      Signal<T>;
