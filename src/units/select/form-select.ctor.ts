import {isSignal, signal, Signal} from "@angular/core";
import {Subscribable} from "rxjs";
import {isSubscribable} from "@juulsgaard/rxjs-tools";
import {toSignal} from "@angular/core/rxjs-interop";
import {MapFunc} from "@juulsgaard/ts-tools";
import {FormInputCtorOptions, parseOptions} from "../input/form-input.ctor";
import {FormMultiSelectBuilder, FormSingleSelectBuilder} from "./form-select.builder";
import {InputTypes} from "../input/form-input.types";

//<editor-fold desc="Function">
function ctor<T>(items: T[]): FormSelectConstructor<T>;
function ctor<T>(items: Subscribable<T[]>): FormSelectConstructor<T>;
function ctor<T>(items: Signal<T[]>): FormSelectConstructor<T>;
function ctor<T>(items: Signal<T[]>|Subscribable<T[]>|T[]): FormSelectConstructor<T> {
  if (isSignal(items)) {
    return new FormSelectConstructor<T>(items);
  }

  if (isSubscribable(items)) {
    const signal = toSignal(items, {initialValue: []});
    return new FormSelectConstructor<T>(signal);
  }

  return new FormSelectConstructor<T>(signal(items));
}
//</editor-fold>

//<editor-fold desc="Constructors">
export class FormSelectConstructor<TItem> {

  constructor(private items: Signal<TItem[]>) {
  }

  /**
   * Make the input single select
   */
  single(): SingleFormSelectCtor<TItem, TItem>
  /**
   * Make the input single select and use a mapped value
   * @param selection - The value map
   */
  single<TData>(selection: MapFunc<TItem, TData>): SingleFormSelectCtor<TData, TItem>
  single<TData>(selection?: MapFunc<TItem, TData>): SingleFormSelectCtor<TData | TItem, TItem> {
    return new SingleFormSelectCtor<TData | TItem, TItem>(this.items, selection ? selection : x => x);
  }

  /**
   * Make the input multi select
   */
  multiple(): MultiFormSelectCtor<TItem, TItem>
  /**
   * Make the input multi select and use a mapped value
   * @param selection - The value map
   */
  multiple<TData>(selection: MapFunc<TItem, TData>): MultiFormSelectCtor<TData, TItem>
  multiple<TData>(selection?: MapFunc<TItem, TData>): MultiFormSelectCtor<TData | TItem, TItem> {
    return new MultiFormSelectCtor<TData | TItem, TItem>(this.items, selection ? selection : x => x);
  }
}

export class SingleFormSelectCtor<TValue, TItem> {

  constructor(private items: Signal<TItem[]>, private map: MapFunc<TItem, TValue>) {
  }

  /**
   * Make the input nullable
   * @param initialValue - The starting value of the input
   * @param options - Additional configuration
   */
  nullable(
    initialValue?: TValue,
    options: FormInputCtorOptions<TValue> = {}
  ): FormSingleSelectBuilder<TValue | undefined, TItem> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormSingleSelectBuilder(
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
  notNull(initialValue: TValue, options: FormInputCtorOptions<TValue> = {}): FormSingleSelectBuilder<TValue, TItem> {
    const {fallback, disabled} = parseOptions(initialValue, options, initialValue);
    return new FormSingleSelectBuilder(
      InputTypes.Select,
      false,
      fallback,
      this.items,
      this.map,
      initialValue,
      disabled
    );
  }
}

export class MultiFormSelectCtor<TValue, TItem> {

  constructor(private items: Signal<TItem[]>, private map: MapFunc<TItem, TValue>) {
  }

  /**
   * Make the input non-nullable
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  notNull(initialValue?: TValue[], options: FormInputCtorOptions<TValue[]> = {}): FormMultiSelectBuilder<TValue, TItem> {
    const {fallback, disabled} = parseOptions(initialValue, options, []);
    return new FormMultiSelectBuilder(InputTypes.SelectMany, false, fallback, this.items, this.map, initialValue, disabled);
  }
}
//</editor-fold>

export const formSelect = ctor;
