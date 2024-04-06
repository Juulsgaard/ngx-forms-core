//<editor-fold desc="Selection Node Builder">
import {Observable} from "rxjs";
import {MapFunc} from "@juulsgaard/ts-tools";
import {FormMultiSelectNodeConfig, FormSingleSelectNodeConfig} from "../forms/form-select-node-config";
import {InputTypes} from "../forms/anon-form-node";
import {FormConstants} from "../tools/constants";
import {FormNodeCtorOptions, parseOptions} from "./constructor-tools";

export class FormSelectBuilder<TItem> {
  constructor(private items: TItem[] | Observable<TItem[]>) {
  }

  /**
   * Make the input single select
   */
  single(): SingleFormSelectBuilder<TItem, TItem>
  /**
   * Make the input single select and use a mapped value
   * @param selection - The value map
   */
  single<TData>(selection: MapFunc<TItem, TData>): SingleFormSelectBuilder<TData, TItem>
  single<TData>(selection?: MapFunc<TItem, TData>): SingleFormSelectBuilder<TData | TItem, TItem> {
    return new SingleFormSelectBuilder<TData | TItem, TItem>(this.items, selection ? selection : x => x);
  }

  /**
   * Make the input multi select
   */
  multiple(): MultiFormSelectBuilder<TItem, TItem>
  /**
   * Make the input multi select and use a mapped value
   * @param selection - The value map
   */
  multiple<TData>(selection: MapFunc<TItem, TData>): MultiFormSelectBuilder<TData, TItem>
  multiple<TData>(selection?: MapFunc<TItem, TData>): MultiFormSelectBuilder<TData | TItem, TItem> {
    return new MultiFormSelectBuilder<TData | TItem, TItem>(this.items, selection ? selection : x => x);
  }
}

type ServerNullTypes<T> = NonNullable<T> extends string ? 'text' | 'guid' :
  NonNullable<T> extends Date ? 'date' :
    never;

export class SingleFormSelectBuilder<TValue, TItem> {
  constructor(private items: TItem[] | Observable<TItem[]>, private map: MapFunc<TItem, TValue>) {
  }

  /**
   * Make the input nullable
   * @param initialValue - The starting value of the input
   * @param options - Additional configuration
   */
  nullable(
    initialValue?: TValue,
    options: FormNodeCtorOptions<TValue> = {}
  ): FormSingleSelectNodeConfig<TValue | undefined, TItem> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormSingleSelectNodeConfig(
      InputTypes.Select,
      true,
      fallback,
      this.items,
      this.map,
      initialValue,
      disabled
    );
  }

  /**
   * Make the input non-nullable
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  notNull(initialValue: TValue, options: FormNodeCtorOptions<TValue> = {}): FormSingleSelectNodeConfig<TValue, TItem> {
    const {fallback, disabled} = parseOptions(initialValue, options, initialValue);
    return new FormSingleSelectNodeConfig(
      InputTypes.Select,
      false,
      fallback,
      this.items,
      this.map,
      initialValue,
      disabled
    );
  }

  /**
   * Make the input nullable but with a coalesced raw value
   * @param type - The coalescing type
   * @param initialValue - The starting value of the input
   */
  serverNull(type: ServerNullTypes<TValue>, initialValue?: TValue): FormSingleSelectNodeConfig<TValue | undefined, TItem> {

    const serverNullValue = (
      type == 'date' ? FormConstants.NULL_DATE :
        type === 'text' ? FormConstants.NULL_STRING :
          FormConstants.NULL_GUID
    ) as unknown as TValue;

    return this.nullable(initialValue, {fallback: serverNullValue, disabledFallback: undefined});
  }
}

export class MultiFormSelectBuilder<TValue, TItem> {

  constructor(private items: TItem[] | Observable<TItem[]>, private map: MapFunc<TItem, TValue>) {
  }

  /**
   * Make the input non-nullable
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  notNull(initialValue?: TValue[], options: FormNodeCtorOptions<TValue[]> = {}): FormMultiSelectNodeConfig<TValue, TItem> {
    const {fallback, disabled} = parseOptions(initialValue, options, []);
    return new FormMultiSelectNodeConfig(InputTypes.SelectMany, false, fallback, this.items, this.map, initialValue, disabled);
  }
}
