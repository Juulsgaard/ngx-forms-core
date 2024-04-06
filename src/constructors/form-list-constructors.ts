import {ControlFormList, FormList, ModelFormList} from "../forms/form-list";
import {FormUnit} from "../forms/form-unit";
import {FormValidator} from "../tools/form-validation";
import {toList} from "../tools/helpers";
import {FormGroupControls, FormGroupValue} from "../types/controls";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {formLayer, FormLayerOptions} from "./form-layer-constructors";

interface FormListOptions<T, TLayer> {
  length?: number;
  disabled?: boolean;
  disabledFallback?: T;
  errors?: FormValidator<T> | FormValidator<T>[];
  warnings?: FormValidator<T> | FormValidator<T>[];
  layer?: FormLayerOptions<TLayer>;
}

export class FormListConstructors {

  readonly nullable: FormListNullableConstructors = new FormListNullableConstructors();

  /**
   * Create a Form List based on controls
   * @param controls - The controls to use
   * @param options - Additional options
   * @constructor
   */
  controls<TControls extends Record<string, FormUnit>>(
    controls: TControls,
    options?: FormListOptions<FormGroupValue<TControls>[], FormGroupValue<TControls>>
  ): ControlFormList<TControls> {
    return new FormList(
      formLayer().controls(controls, options?.layer),
      false,
      options?.length,
      options?.disabledFallback,
      options?.disabled,
      toList(options?.errors),
      toList(options?.warnings),
    );
  }

  /**
   * Create a Form List based on an element type
   * @param controls - The controls to use
   * @param options - Additional options
   * @constructor
   */
  model<TModel extends SimpleObject>(
    controls: FormGroupControls<TModel>,
    options?: FormListOptions<TModel[], TModel>
  ): ModelFormList<TModel> {
    return new FormList(
      formLayer().controls(controls, options?.layer),
      false,
      options?.length,
      options?.disabledFallback,
      options?.disabled,
      toList(options?.errors),
      toList(options?.warnings),
    );
  }
}

export class FormListNullableConstructors {

  /**
   * Create a Form List based on controls
   * @param controls - The controls to use
   * @param options - Additional options
   * @constructor
   */
  controls<TControls extends Record<string, FormUnit>>(
    controls: TControls,
    options?: FormListOptions<FormGroupValue<TControls>[]|undefined, FormGroupValue<TControls>>
  ): ControlFormList<TControls, true> {
    return new FormList(
      formLayer().controls(controls, options?.layer),
      true,
      options?.length,
      options?.disabledFallback,
      options?.disabled,
      toList(options?.errors),
      toList(options?.warnings),
    );
  }

  /**
   * Create a Form List based on an element type
   * @param controls - The controls to use
   * @param options - Additional options
   * @constructor
   */
  model<TModel extends SimpleObject>(
    controls: FormGroupControls<TModel>,
    options?: FormListOptions<TModel[]|undefined, TModel>
  ): ModelFormList<TModel, true> {
    return new FormList(
      formLayer().controls(controls, options?.layer),
      true,
      options?.length,
      options?.disabledFallback,
      options?.disabled,
      toList(options?.errors),
      toList(options?.warnings),
    );
  }
}

export function formList(): FormListConstructors {
  return new FormListConstructors();
}
