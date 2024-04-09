import {SimpleObject} from "@juulsgaard/ts-tools";
import {Signal} from "@angular/core";

export type FormMemoLayer<T> =
  { readonly [K in keyof T]-?: FormMemoValue<T[K]> } &
  Signal<T>;

export type FormMemoList<T, TItem> =
  { at: (index: number) => FormMemoLayer<TItem>|undefined } &
  IterableIterator<FormMemoLayer<TItem>> &
  { length: Signal<number> } &
  Signal<T>;

export type FormMemoValue<T> =
  NonNullable<T> extends Date ? Signal<T> :
    NonNullable<T> extends (infer A extends SimpleObject)[] ? FormMemoList<T, A> :
      NonNullable<T> extends SimpleObject ? FormMemoLayer<T> :
        Signal<T>;
