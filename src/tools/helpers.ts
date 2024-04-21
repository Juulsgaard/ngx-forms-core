import {NewFuncProp, ReservedFuncProps} from "../types";
import {isString} from "@juulsgaard/ts-tools";

export function compareLists<T>(prev: (T|undefined)[] | undefined, next: (T|undefined)[] | undefined, comparison?: (a: T|undefined, b: T|undefined) => boolean): boolean {
  if (prev === next) return true;

  if (prev == null) return next == null;
  if (next == null) return false;
  if (prev.length != next.length) return false;
  if (prev.length <= 0) return true;

  comparison ??= (a, b) => a === b;
  for (let i = 0; i < prev.length; i++) {
    if (!comparison(prev[i], next[i])) return false;
  }

  return true;
}

export function compareValues(prev: unknown | undefined, next: unknown | undefined): boolean {
  if (prev === next) return true;

  if (prev == null) return next == null;
  if (next == null) return false;

  if (Array.isArray(prev)) {
    if (!Array.isArray(next)) return false;
    return compareLists(prev, next, compareValues);
  }

  if (prev instanceof Date) {
    if (!(next instanceof Date)) return false;
    return prev.getTime() === next.getTime();
  }

  return false;
}

export function toList<T>(data: T|T[]|undefined): T[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  return [data];
}

const reservedFunProps: Set<string> = new Set<ReservedFuncProps>(['name', 'length', 'caller', 'arguments', 'prototype'])

export function formatFuncProp<T>(key: T): NewFuncProp<T> {
  if (!isString(key)) return key as NewFuncProp<T>;
  if (!reservedFunProps.has(key)) return key as NewFuncProp<T>;
  return `$${key}` as NewFuncProp<T>;
}
