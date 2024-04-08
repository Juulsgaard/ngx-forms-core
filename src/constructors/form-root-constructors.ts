import {ControlFormRoot, FormRoot, FormUnit, ModelFormRoot} from "../forms";
import {FormValidator} from "../tools";
import {toList} from "../tools/helpers";
import {FormGroupControls, FormGroupValue} from "../types";
import {SimpleObject} from "@juulsgaard/ts-tools";

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

export const formRoot: FormRootConstructors = new FormRootConstructors();
