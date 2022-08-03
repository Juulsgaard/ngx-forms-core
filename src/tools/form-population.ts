import {deepEquals, DeepPartial} from "@consensus-labs/ts-tools";
import {ModelFormRoot} from "../models/form-root";

/**
 * Detects a new set of data would affect the form
 * @param form
 * @param newData
 */
export function formUpdated<T extends Record<string, any>>(form: ModelFormRoot<T>, newData: T|undefined) {
  const oldData = form.oldValue;
  if (oldData == null) return newData != null;
  if (newData == null) return true;

  if (oldData['id'] !== newData['id']) return true;

  const copy = form.clone();
  copy.reset(newData as DeepPartial<T>);

  return !deepEquals(oldData, copy.getRawValue());
}
