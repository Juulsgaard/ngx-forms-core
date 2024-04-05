import {FormGroupControls, FormGroupValue, FormGroupValueRaw, SmartFormUnion} from "../tools/form-types";
import {DeepPartial} from "@juulsgaard/ts-tools";
import {ControlFormRoot, FormRoot, ModelFormRoot} from "../forms/form-root";

export module FormRootConstructors {

  /**
   * Create an anonymously typed form
   * @param controls - The controls for the form
   * @param options - Options
   * @constructor
   */
  export function Controls<TControls extends Record<string, SmartFormUnion>>(
    controls: TControls,
    options?: FormRootOptions<FormGroupValue<TControls>>
  ): ControlFormRoot<TControls> {
    return new FormRoot<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>>(controls);
  }

  /**
   * Create a form based on a type
   * @param controls - The controls matching the type
   * @param options - Options
   * @constructor
   */
  export function Model<TModel extends Record<string, any>>(
    controls: FormGroupControls<TModel>,
    options?: FormRootOptions<DeepPartial<TModel>>
  ): ModelFormRoot<TModel> {
    return new FormRoot<FormGroupControls<TModel>, DeepPartial<TModel>, TModel>(controls, options);
  }
}
