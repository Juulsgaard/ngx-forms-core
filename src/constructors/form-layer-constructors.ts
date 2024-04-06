import {FormGroupControls, FormGroupValue} from "../tools/form-types";
import {ControlFormLayer, ModelFormLayer} from "../forms";
import {FormLayer, NullableControlFormLayer} from "../forms/form-layer";
import {FormUnit} from "../forms/form-unit";
import {FormValidator} from "../tools/form-validation";
import {toList} from "../tools/helpers";
import {SimpleObject} from "@juulsgaard/ts-tools";

interface FormLayerOptions<T> {
  disabled?: boolean;
  disabledFallback?: T;
  errors?: FormValidator<T>|FormValidator<T>[];
  warnings?: FormValidator<T>|FormValidator<T>[];
}

export class FormLayerConstructors {

  readonly nullable: FormLayerNullableConstructors = new FormLayerNullableConstructors();

  /**
   * Create an anonymously typed layer
   * @param controls - The controls for the layer
   * @param options - Additional options
   * @constructor
   */
  controls<TControls extends Record<string, FormUnit>>(
    controls: TControls,
    options?: FormLayerOptions<FormGroupValue<TControls>>
  ): ControlFormLayer<TControls> {
    return new FormLayer(
      controls,
      false,
      options?.disabledFallback,
      options?.disabled,
      toList(options?.errors),
      toList(options?.warnings)
    );
  }

  /**
   * Create a layer based on a type
   * @param controls - The controls matching the type
   * @param options - Additional options
   * @constructor
   */
  model<TModel extends SimpleObject>(
    controls: FormGroupControls<TModel>,
    options?: FormLayerOptions<TModel>
  ): ModelFormLayer<TModel> {
    return new FormLayer(
      controls,
      false,
      options?.disabledFallback,
      options?.disabled,
      toList(options?.errors),
      toList(options?.warnings)
    );
  }
}

export class FormLayerNullableConstructors {

  /**
   * Create an anonymously typed layer
   * @param controls - The controls for the layer
   * @param options - Additional options
   * @constructor
   */
  controls<TControls extends Record<string, FormUnit>>(
    controls: TControls,
    options?: FormLayerOptions<FormGroupValue<TControls>|undefined>
  ): NullableControlFormLayer<TControls> {
    return new FormLayer<TControls, FormGroupValue<TControls>|undefined>(
      controls,
      true,
      options?.disabledFallback,
      options?.disabled,
      toList(options?.errors),
      toList(options?.warnings)
    );
  }

  /**
   * Create a layer based on a type
   * @param controls - The controls matching the type
   * @param options - Additional options
   * @constructor
   */
  model<TModel extends SimpleObject>(
    controls: FormGroupControls<TModel>,
    options?: FormLayerOptions<TModel|undefined>
  ): ModelFormLayer<TModel|undefined> {
    return new FormLayer<FormGroupControls<TModel>, TModel|undefined>(
      controls,
      true,
      options?.disabledFallback,
      options?.disabled,
      toList(options?.errors),
      toList(options?.warnings)
    );
  }
}

export function formLayer(): FormLayerConstructors {
  return new FormLayerConstructors();
}
