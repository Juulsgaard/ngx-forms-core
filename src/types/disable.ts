import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormMemoValue} from "./values";
import {EffectRef, Injector, Signal} from "@angular/core";
import {FormListValue, FormObjectTypes} from "./misc";

export type LayerDisableConfig<T, TState> =
  { readonly [K in keyof T]-?: DisableConfig<T[K], TState> }
  & DisableConfigFunc<TState>;

export type RootLayerDisableConfig<T> = LayerDisableConfig<T, T>;

export type RootListDisableConfig<T extends SimpleObject|undefined, TNullable extends boolean> = DisableConfigFunc<FormListValue<T, TNullable>>;

export interface DisableConfigFuncOptions {
  injector?: Injector;
  manualCleanup?: boolean;
}

export type DisableConfigFunc<TState> = (
  evaluate: (state: FormMemoValue<TState>) => boolean,
  options?: DisableConfigFuncOptions
) => EffectRef;
export type DisableConfigItemFunc<T> = (
  evaluate: (state: Signal<T>) => boolean,
  options?: DisableConfigFuncOptions
) => EffectRef;

export type DisableConfig<T, TState> =
  NonNullable<T> extends FormObjectTypes ? DisableConfigFunc<TState> :
    NonNullable<T> extends SimpleObject[] ? DisableConfigFunc<TState> :
      NonNullable<T> extends SimpleObject ? LayerDisableConfig<T, TState> :
        DisableConfigFunc<TState>;

export type RootDisableConfig<T> = DisableConfig<T, T>;
