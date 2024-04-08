import {FormLayer, FormList, FormNode, FormUnit} from "../forms";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {
  DisableConfig, DisableConfigFunc, DisableConfigItemFunc, LayerDisableConfig, RootLayerDisableConfig,
  RootListDisableConfig
} from "../types/disable";
import {FormMemoValue} from "../types/values";
import {effect, Injector, Signal} from "@angular/core";
import {getMemoized} from "./memo-state";

const cache = new WeakMap<FormUnit, DisableConfig<unknown, unknown>>();

// TODO: The type of this object might be incorrect when TValue is derived TControls.
// This type should be derived differently from controls than from value.
// This can be addressed by splitting Layers into `ModelFormLayer` and `ControlFormLayer` classes
// with separate type definitions for properties like this

/**
 *
 * @param layer
 */
export function getAutoDisable<T extends SimpleObject | undefined>(layer: FormLayer<Record<string, FormUnit>, T>): RootLayerDisableConfig<T>;
export function getAutoDisable<T extends SimpleObject | undefined, TNullable extends boolean>(list: FormList<Record<string, FormUnit>, T, TNullable>): RootListDisableConfig<T, TNullable>;
export function getAutoDisable<T>(node: FormNode<T>): DisableConfigItemFunc<T>;
export function getAutoDisable(unit: FormUnit): DisableConfig<unknown, unknown> {

  const cached = cache.get(unit);
  if (cached) return cached;

  if (unit instanceof FormLayer) {
    const disable = fromLayer(unit, getMemoized(unit));
    cache.set(unit, disable);
    return disable;
  }

  if (unit instanceof FormNode) {
    const disable = fromNode(unit, getMemoized(unit));
    cache.set(unit, disable);
    return disable;
  }
}

function fromUnit<TState>(unit: FormUnit, state: Signal<FormMemoValue<TState>>): DisableConfig<unknown, TState> {

}

function fromLayer<T extends SimpleObject | undefined, TState>(layer: FormLayer<Record<string, FormUnit>, T>, state: Signal<FormMemoValue<TState>>): LayerDisableConfig<T, TState> {

  const autoDisable = ((evaluate: (state: FormMemoValue<TState>) => boolean, injector?: Injector) => {
    effect(() => {
      const value = state();
      const disabled = evaluate(value);
      layer.toggleDisabled(disabled);
    }, {allowSignalWrites: true, injector});
  }) as LayerDisableConfig<T, TState>;

  const controls = layer.controls();
  for (let key in controls) {
    const control = controls[key];
    if (!control) continue;
    (autoDisable as Record<string, DisableConfig<unknown, TState>>)[key] = fromUnit(control, state);
  }

  return autoDisable;
}

function fromNode<T, TState>(node: FormNode<T>, state: Signal<FormMemoValue<TState>>): DisableConfigFunc<TState> {
  return (evaluate: (state: FormMemoValue<TState>) => boolean, injector?: Injector) => {
    effect(() => {
      const value = state();
      const disabled = evaluate(value);
      node.toggleDisabled(disabled);
    }, {allowSignalWrites: true, injector});
  }
}
