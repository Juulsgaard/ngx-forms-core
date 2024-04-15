import {FormLayer, FormList, FormNode, FormUnit} from "../forms";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {
  DisableConfig, DisableConfigFunc, DisableConfigFuncOptions, DisableConfigItemFunc, LayerDisableConfig,
  RootLayerDisableConfig, RootListDisableConfig
} from "../types/disable";
import {FormMemoValue} from "../types/values";
import {effect, Injector, runInInjectionContext, Signal} from "@angular/core";
import {getMemoized} from "./memo-state";

interface AutoDisableOptions {
  injector?: Injector;
  manualCleanup?: boolean;
}

const cache = new WeakMap<FormUnit, DisableConfig<unknown, unknown>>();

// TODO: The type of this object might be incorrect when TValue is derived TControls.
// This type should be derived differently from controls than from value.
// This can be addressed by splitting Layers into `ModelFormLayer` and `ControlFormLayer` classes
// with separate type definitions for properties like this

/** */
export function autoDisable<T extends SimpleObject, TOut>(
  form: {readonly form: FormLayer<any, T>},
  config: (disable: RootLayerDisableConfig<T>) => TOut,
  options?: AutoDisableOptions
): TOut;
export function autoDisable<T extends SimpleObject | undefined, TOut>(
  layer: FormLayer<any, T>,
  config: (disable: RootLayerDisableConfig<T>) => TOut,
  options?: AutoDisableOptions
): TOut;
export function autoDisable<T extends SimpleObject | undefined, TNullable extends boolean, TOut>(
  list: FormList<any, T, TNullable>,
  config: (disable: RootListDisableConfig<T, TNullable>) => void,
  options?: AutoDisableOptions
): void;
export function autoDisable<T, TOut>(
  node: FormNode<T>,
  config: (disable: DisableConfigItemFunc<T>) => TOut,
  options?: AutoDisableOptions
): TOut;
export function autoDisable<TOut>(
  unit: FormUnit | {form: FormUnit},
  config: (disable: any) => TOut,
  options?: AutoDisableOptions
): TOut {

  unit = unit instanceof FormUnit ? unit : unit.form;

  const disable = fromCache(unit, options ?? {});

  if (options?.injector) {
    return runInInjectionContext(options.injector, () => config(disable));
  }

  return config(disable);
}

function fromCache(unit: FormUnit, options: AutoDisableOptions): DisableConfig<unknown, unknown> {
  const cached = cache.get(unit);
  if (cached) return cached;

  if (unit instanceof FormList) {
    const disable = fromList(unit, getMemoized(unit), options);
    cache.set(unit, disable);
    return disable;
  }

  if (unit instanceof FormLayer) {
    const disable = fromLayer(unit, getMemoized(unit), options);
    cache.set(unit, disable);
    return disable;
  }

  if (unit instanceof FormNode) {
    const disable = fromNode(unit, getMemoized(unit), options);
    cache.set(unit, disable);
    return disable;
  }

  throw Error('Unsupported Form Unit');
}

function fromUnit<TState>(unit: FormUnit, state: Signal<FormMemoValue<TState>>, options: AutoDisableOptions): DisableConfig<unknown, TState> {

  if (unit instanceof FormList) {
    return fromList(unit, state, options);
  }

  if (unit instanceof FormLayer) {
    return fromLayer(unit, state, options);
  }

  if (unit instanceof FormNode) {
    return fromNode(unit, state, options);
  }

  throw Error('Unsupported Form Unit');
}

function fromList<T extends SimpleObject|undefined, TState>(
  list: FormList<any, T, any>,
  state: Signal<FormMemoValue<TState>>,
  options: AutoDisableOptions
): DisableConfigFunc<TState> {
  return (evaluate: (state: FormMemoValue<TState>) => boolean, opt?: DisableConfigFuncOptions) => {
    return effect(() => {
      const value = state();
      const disabled = evaluate(value);
      list.toggleDisabled(disabled);
    }, {
      allowSignalWrites: true,
      injector: opt?.injector,
      manualCleanup: opt?.manualCleanup ?? options?.manualCleanup
    });
  }
}

function fromLayer<T extends SimpleObject | undefined, TState>(
  layer: FormLayer<Record<string, FormUnit>, T>,
  state: Signal<FormMemoValue<TState>>,
  options: AutoDisableOptions
): LayerDisableConfig<T, TState> {

  const autoDisable = (
    (evaluate: (state: FormMemoValue<TState>) => boolean, opt?: DisableConfigFuncOptions) => {
      return effect(() => {
        const value = state();
        const disabled = evaluate(value);
        layer.toggleDisabled(disabled);
      }, {
        allowSignalWrites: true,
        injector: opt?.injector,
        manualCleanup: opt?.manualCleanup ?? options.manualCleanup
      });
    }
  ) as LayerDisableConfig<T, TState>;

  const controls = layer.controls();
  for (let key in controls) {
    const control = controls[key];
    if (!control) continue;
    (autoDisable as Record<string, DisableConfig<unknown, TState>>)[key] = fromUnit(control, state, options);
  }

  return autoDisable;
}

function fromNode<T, TState>(
  node: FormNode<T>,
  state: Signal<FormMemoValue<TState>>,
  options: AutoDisableOptions
): DisableConfigFunc<TState> {
  return (evaluate: (state: FormMemoValue<TState>) => boolean, opt?: DisableConfigFuncOptions) => {
    return effect(() => {
      const value = state();
      const disabled = evaluate(value);
      node.toggleDisabled(disabled);
    }, {
      allowSignalWrites: true,
      injector: opt?.injector,
      manualCleanup: opt?.manualCleanup ?? options.manualCleanup
    });
  }
}
