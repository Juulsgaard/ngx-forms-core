import {MapFunc} from "@juulsgaard/ts-tools";

export interface FormSelectOptions<TItem> {
  bindLabel?: MapFunc<TItem, string>;
  bindOption?: MapFunc<TItem, string>;
  clearable?: boolean;
  hideWhenEmpty?: boolean;
}
