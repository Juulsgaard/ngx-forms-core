import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormMemoValue} from "./values";
import {Injector, Signal} from "@angular/core";

export type LayerDisableConfig<T, TState> = { [K in keyof T]-?: DisableConfig<T[K], TState> } & DisableConfigFunc<TState>;
export type RootLayerDisableConfig<T> = LayerDisableConfig<T, T>;

export type ListDisableConfig<T, TState> = { items: LayerDisableConfig<T, TState> & DisableConfigFunc<TState> } & DisableConfigFunc<TState>;
export type RootListDisableConfig<T, TNullable> = ListDisableConfig<T, TNullable extends true ? T[]|undefined : T[]>;

export type DisableConfigFunc<TState> = (evaluate: (state: FormMemoValue<TState>) => boolean, injector?: Injector) => void;
export type DisableConfigItemFunc<T> = (evaluate: (state: Signal<T>) => boolean, injector?: Injector) => void;

export type DisableConfig<T, TState> =
  NonNullable<T> extends (infer A extends SimpleObject)[] ? ListDisableConfig<A, TState> :
    NonNullable<T> extends SimpleObject ? LayerDisableConfig<T, TState> :
      DisableConfigFunc<TState>;

export type RootDisableConfig<T> = DisableConfig<T, T>;
