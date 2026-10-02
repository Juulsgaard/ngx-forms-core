import {IFormList, IReadonlyFormList} from "./list/form-list.interface";
import {IFormInput, IReadonlyFormInput} from "./input/form-input.interface";
import {IFormLayer, IReadonlyFormLayer} from "./layer/form-layer.interface";
import {ValueObject} from "@juulsgaard/ts-tools";

type ReadonlyFormControl<T> =
  [NonNullable<T>] extends [ValueObject] ? IReadonlyFormInput<T> :
  [NonNullable<T>] extends [ReadonlyArray<infer U>]
    ? [NonNullable<U>] extends [Record<string, any>]
      ? IReadonlyFormList<U>
      : IReadonlyFormInput<U[]>
    : [NonNullable<T>] extends [Record<string, any>]
      ? IReadonlyFormLayer<T>
      : IReadonlyFormInput<T>;

export type FormControl<T> =
  [NonNullable<T>] extends [ValueObject] ? IFormInput<T> :
  [NonNullable<T>] extends [ReadonlyArray<infer U>]
    ? [NonNullable<U>] extends [Record<string, any>]
      ? IFormList<U>
      : IFormInput<U[]>
    : [NonNullable<T>] extends [Record<string, any>]
      ? IFormLayer<T>
      : IFormInput<T>;

type _ReadonlyFormLayerControls<T> = {
  readonly [K in keyof T]-?: ReadonlyFormControl<T[K]>;
}
export type ReadonlyFormLayerControls<T> = _ReadonlyFormLayerControls<NonNullable<T>>;

type _FormLayerControls<T> = {
  readonly [K in keyof T]-?: FormControl<T[K]>;
};

export type FormLayerControls<T> = _FormLayerControls<NonNullable<T>>;
