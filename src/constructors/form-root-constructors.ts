import {FormGroupControls, FormGroupValue} from "../tools/form-types";
import {ControlFormRoot, FormRoot, ModelFormRoot} from "../forms/form-root";
import {FormValidator} from "../tools/form-validation";
import {FormUnit} from "../forms/form-unit";
import {toList} from "../tools/helpers";

interface FormRootOptions<T> {
  disabled?: boolean;
  disabledFallback?: T;
  errors?: FormValidator<T> | FormValidator<T>[];
  warnings?: FormValidator<T> | FormValidator<T>[];
}

export class FormRootConstructors {

  /**
   * Create an anonymously typed form
   * @param controls - The controls for the form
   * @param options - Options
   * @constructor
   */
  controls<TControls extends Record<string, FormUnit>>(
    controls: TControls,
    options?: FormRootOptions<FormGroupValue<TControls>>
  ): ControlFormRoot<TControls> {
    return new FormRoot(
      controls,
      options?.disabledFallback,
      options?.disabled,
      toList(options?.errors),
      toList(options?.warnings),
    );
  }

  /**
   * Create a form based on a type
   * @param controls - The controls matching the type
   * @param options - Options
   * @constructor
   */
  model<TModel extends SimpleObject>(
    controls: FormGroupControls<TModel>,
    options?: FormRootOptions<TModel>
  ): ModelFormRoot<TModel> {
    return new FormRoot(
      controls,
      options?.disabledFallback,
      options?.disabled,
      toList(options?.errors),
      toList(options?.warnings),
    );
  }
}

export function formRoot(): FormRootConstructors {
  return new FormRootConstructors();
}
