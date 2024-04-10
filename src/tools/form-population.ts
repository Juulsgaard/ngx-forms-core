import {deepEquals, DeepPartial, SimpleObject} from "@juulsgaard/ts-tools";
import {ModelFormLayer} from "../forms";

/**
 * Detects a new set of data would affect the form
 * @param form
 * @param newData
 */
export function willAlterForm<T extends SimpleObject>(
  form: ModelFormLayer<T>,
  newData: DeepPartial<T>|T|undefined
) {
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
}
