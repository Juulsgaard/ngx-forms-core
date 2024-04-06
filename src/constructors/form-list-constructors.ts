import {FormGroupControls, FormGroupValue} from "../tools/form-types";
import {ControlFormList, FormList, ModelFormList} from "../forms/form-list";
import {FormUnit} from "../forms/form-unit";
import {FormValidator} from "../tools/form-validation";
import {toList} from "../tools/helpers";

interface FormListOptions<T> {
  length?: number;
  disabled?: boolean;
  disabledFallback?: T;
  errors?: FormValidator<T> | FormValidator<T>[];
  warnings?: FormValidator<T> | FormValidator<T>[];
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
    options?: FormListOptions<FormGroupValue<TControls>[]>
  ): ControlFormList<TControls> {
    return new FormList(
      controls,
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
    options?: FormListOptions<TModel[]>
  ): ModelFormList<TModel> {
    return new FormList(
      controls,
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
    options?: FormListOptions<FormGroupValue<TControls>[]|undefined>
  ): ControlFormList<TControls, true> {
    return new FormList(
      controls,
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
    options?: FormListOptions<TModel[]|undefined>
  ): ModelFormList<TModel, true> {
    return new FormList(
      controls,
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
