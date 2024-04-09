import {FormLayer, FormList, FormNode, FormUnit} from "../forms";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormMemoLayer, FormMemoList, FormMemoValue} from "../types/values";
import {computed, Signal} from "@angular/core";
import {FormListValue} from "../types";

const cache = new WeakMap<FormUnit, Signal<FormMemoValue<unknown>>>();

export function getMemoized<T extends SimpleObject | undefined, TNullable extends boolean>(
  unit: FormList<any, T, TNullable>
): Signal<FormMemoList<FormListValue<T, TNullable>, T>>;
export function getMemoized<T extends SimpleObject | undefined>(
  unit: FormLayer<any, T>
): Signal<FormMemoLayer<T>>;
export function getMemoized<T>(
  unit: FormNode<T>
): Signal<Signal<T>>;
export function getMemoized(unit: FormUnit): Signal<FormMemoValue<unknown>> {
  const cached = cache.get(unit);
  if (cached) return cached;

  if (unit instanceof FormList) {
    const memo = computed(() => fromList(unit));
    cache.set(unit, memo);
    return memo;
  }

  if (unit instanceof FormLayer) {
    const memo = computed(() => fromLayer(unit));
    cache.set(unit, memo);
    return memo;
  }

  if (unit instanceof FormNode) {
    const memo = computed(() => fromNode(unit));
    cache.set(unit, memo);
    return memo;
  }

  throw Error('Unsupported Form Unit');
}

function fromList<T extends SimpleObject | undefined, TNullable extends boolean>(
  list: FormList<any, T, TNullable>
): FormMemoList<FormListValue<T, TNullable>, T> {

  const values = list.controls().map(x => getMemoized(x)() as FormMemoLayer<T>);

  const state = computed(() => list.debouncedValue()) as FormMemoList<FormListValue<T, TNullable>, T>;

  state[Symbol.iterator] = values[Symbol.iterator];
  state.at = (index: number) => values[index];

  return state;
}

function fromLayer<T extends SimpleObject | undefined>(layer: FormLayer<any, T>): FormMemoLayer<T> {

  const state = computed(() => layer.debouncedValue()) as FormMemoLayer<T>;

  const controls = layer.controls();
  for (let key in controls) {
    const control = controls[key];
    if (!control) continue;
    const memo = getMemoized(control);
    (
      state as Record<string, FormMemoValue<unknown>>
    )[key] = memo();
  }

  return state;
}

function fromNode<T extends SimpleObject>(layer: FormNode<T>): FormMemoLayer<T> {
  return computed(() => layer.debouncedValue()) as FormMemoLayer<T>;
}
