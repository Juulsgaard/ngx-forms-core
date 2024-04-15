import {deepEquals, DeepPartial, SimpleObject} from "@juulsgaard/ts-tools";
import {FormLayer} from "../forms";
import {untracked} from "@angular/core";

/**
 * Detects a new set of data would affect the form
 * @param form
 * @param newData
 */
export function willAlterForm<T extends SimpleObject>(
  form: FormLayer<any, T>,
  newData: DeepPartial<T>|T|undefined
): boolean {
  return untracked(() => {
    const oldData = form.resetValue();
    if (oldData == null) return newData != null;
    if (newData == null) return true;

    if ('id' in oldData) {
      if (!('id' in newData)) return true;
      if (oldData['id'] !== newData['id']) return true;
    }

    const copy = form.clone();
    copy.reset(newData);

    return !deepEquals(oldData, copy.resetValue());
  });
}
