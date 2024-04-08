import {FormLayer, FormUnit} from "../forms";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormMemoLayer, FormMemoValue} from "../types/values";
import {computed, Signal} from "@angular/core";

const cache = new WeakMap<FormUnit, Signal<FormMemoValue<unknown>>>();

export function getMemoized(unit: FormUnit): Signal<FormMemoValue<unknown>> {

}

function fromUnit(unit: FormUnit): Signal<FormMemoValue<unknown>> {
  const cached = cache.get(unit);
  if (cached) return cached;

  if (unit instanceof FormLayer) {
    const memo = computed(() => fromLayer(unit));
    cache.set(unit, memo);
    return memo;
  }
}

function fromLayer<TControls extends Record<string, FormUnit>, T extends SimpleObject>(layer: FormLayer<TControls, T>): FormMemoLayer<T> {

  const state = computed(() => layer.debouncedValue()) as FormMemoLayer<T>;

  const controls = layer.controls();
  for (let key in controls) {
    const control = controls[key];
    if (!control) continue;
    const memo = fromUnit(control);
    (state as Record<string, FormMemoValue<unknown>>)[key] = memo();
  }

  return state;
}
