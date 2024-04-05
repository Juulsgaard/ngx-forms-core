import {FormGroupControls} from "../tools/form-types";
import {ControlFormLayer, ModelFormLayer} from "../forms";
import {FormLayer} from "../forms/form-layer";
import {FormUnit} from "../forms/form-unit";

export class FormLayerConstructors {

  /**
   * Create an anonymously typed layer
   * @param controls - The controls for the layer
   * @constructor
   */
  controls<TControls extends Record<string, FormUnit>>(controls: TControls): ControlFormLayer<TControls> {
    return new FormLayer(controls);
  }

  /**
   * Create a layer based on a type
   * @param controls - The controls matching the type
   * @constructor
   */
  model<TModel extends Record<string, any>>(controls: FormGroupControls<TModel>): ModelFormLayer<TModel> {
    return new FormLayer(controls);
  }
}

export function formLayer(): FormLayerConstructors {
  return new FormLayerConstructors();
}
