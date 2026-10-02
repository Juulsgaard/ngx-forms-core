import {IFormInput, InputTypes, IReadonlyFormInput} from "../input";
import {MapFunc} from "@juulsgaard/ts-tools";
import {Signal} from "@angular/core";

export interface IReadonlyFormSelect<T, TVal, TItem> extends IReadonlyFormInput<T> {
  /** An observable containing the items for the dropdown */
  readonly items: Signal<TItem[]>;
  /** A mapping for getting the value of a given item */
  readonly bindValue: MapFunc<TItem, TVal>;

  /** A mapping for the display name of an item */
  readonly bindLabel?: MapFunc<TItem, string>;
  /** A mapping for the display name specifically when shown in the dropdown */
  readonly bindOption?: MapFunc<TItem, string>;
  /** Whether the input can be cleared */
  readonly clearable: boolean;
  /** Whether the input should be hidden when it has no items to select from */
  readonly hideWhenEmpty: boolean;
}

export interface IFormSelect<T, TVal, TItem> extends IReadonlyFormSelect<T, TVal, TItem>, IFormInput<T> {

}

export interface IReadonlyFormSingleSelect<T, TItem> extends IReadonlyFormSelect<T, T, TItem> {
  readonly type: InputTypes.Select
  readonly multiple: false;
}

export interface IFormSingleSelect<T, TItem> extends IReadonlyFormSingleSelect<T, TItem>, IFormSelect<T, T, TItem> {
  readonly type: InputTypes.Select
  clone(): IFormSingleSelect<T, TItem>;
}

export interface IReadonlyFormMultiSelect<T, TItem> extends IReadonlyFormSelect<T[], T, TItem> {
  readonly type: InputTypes.SelectMany
  readonly multiple: true;
}

export interface IFormMultiSelect<T, TItem> extends IReadonlyFormMultiSelect<T, TItem>, IFormSelect<T[], T, TItem> {
  readonly type: InputTypes.SelectMany
  clone(): IFormMultiSelect<T, TItem>;
}
