import {deepEquals, DeepPartial} from "@juulsgaard/ts-tools";
import {untracked} from "@angular/core";
import {IFormLayer} from "../units/layer/form-layer.interface";

/**
 * Detects a new set of data would affect the form
 * @param form
 * @param newData
 */
export function willAlterForm<T>(
  form: IFormLayer<T>,
  newData: DeepPartial<T>|T|undefined
): boolean {
  return untracked(() => {
    const oldData = form.resetValue();

    if (oldData == null) return newData != null;
    if (newData == null) return true;

    const isObjects = typeof oldData === 'object' && typeof newData === 'object';

    if (isObjects && 'id' in oldData) {
      if (!('id' in newData)) return true;
      if (oldData['id'] !== newData['id']) return true;
    }

    const copy = form.clone();
    copy.reset(newData);

    return !deepEquals(oldData, copy.resetValue());
  });
}
