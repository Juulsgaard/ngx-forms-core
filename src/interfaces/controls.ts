import {IFormList, IReadonlyFormList} from "./form-list";
import {IFormInput, IReadonlyFormInput} from "./form-input";
import {IFormLayer, IReadonlyFormLayer} from "./form-layer";
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

export type ReadonlyFormLayerControls<T> = {
  readonly [K in keyof T]-?: ReadonlyFormControl<T[K]>;
}

export type FormLayerControls<T> = {
  readonly [K in keyof T]-?: FormControl<T[K]>;
}
