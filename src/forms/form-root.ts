import {FormLayer} from "./form-layer";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {computed} from "@angular/core";
import {FormUnit} from "./form-unit";
import {AnonFormRoot} from "./anon-form-root";
import {FormValidator} from "../tools/form-validation";
import {FormGroupControls, FormGroupValue} from "../types/controls";

export class FormRoot<TControls extends Record<string, FormUnit>, TValue extends SimpleObject> extends FormLayer<TControls, TValue> implements AnonFormRoot {

  //<editor-fold desc="Form State">

  readonly canUpdate = computed(() => this.valid() && this.changed());
  readonly canCreate = computed(() => this.valid());

  //</editor-fold>

  constructor(
    controls: TControls,
    disabledDefaultValue?: TValue,
    disabledByDefault = false,
    errorValidators: FormValidator<TValue>[] = [],
    warningValidators: FormValidator<TValue>[] = [],
  ) {
    super(controls, false, disabledDefaultValue, disabledByDefault, errorValidators, warningValidators);
  }
}

export type ModelFormRoot<TModel extends Record<string, any>> = FormRoot<FormGroupControls<TModel>, TModel>;
export type ControlFormRoot<TControls extends Record<string, FormUnit>> = FormRoot<TControls, FormGroupValue<TControls>>;
