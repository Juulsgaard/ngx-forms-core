import {FormGroupControls} from "../tools/form-types";
import {ControlFormList, FormList, ModelFormList} from "../forms/form-list";
import {FormUnit} from "../forms/form-unit";

export module FormListConstructors {

  /**
   * Create a Form List based on controls
   * @param controls - The controls to use
   * @param nullable
   * @param startLength - The initial length of the list
   * @constructor
   */
  export function Controls<TControls extends Record<string, FormUnit>, TNullable extends boolean>(
    controls: TControls,
    nullable: TNullable,
    startLength?: number
  ): ControlFormList<TControls, TNullable> {
    return new FormList(controls, nullable, startLength);
  }

  /**
   * Create a Form List based on an element type
   * @param controls - The controls to use
   * @param nullable
   * @param startLength - The initial length of the list
   * @constructor
   */
  export function Model<TModel extends Record<string, any>, TNullable extends boolean>(
    controls: FormGroupControls<TModel>,
    nullable: TNullable,
    startLength?: number
  ): ModelFormList<TModel, TNullable> {
    return new FormList(controls, nullable, startLength);
  }
}
