import {FormUnit} from "./form-unit";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormLayer} from "./form-layer";
import {AnonFormRoot} from "./anon-form-root";
import {computed} from "@angular/core";
import {FormGroupControls, FormGroupValue} from "../types";
import {FormValidator} from "../tools";


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
