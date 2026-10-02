import {FormLayer} from "../layer/form-layer";
import {IFormRoot} from "./form-root.interface";
import {computed} from "@angular/core";
import {FormLayerControls} from "../controls";
import {FormValidator} from "../../tools/form-validation";


export class FormRoot<T> extends FormLayer<T> implements IFormRoot<T> {

  //<editor-fold desc="Form State">

  readonly canUpdate = computed(() => this.valid() && this.changed());
  readonly canCreate = computed(() => this.valid());

  //</editor-fold>

  constructor(
    controls: FormLayerControls<T>,
    disabledDefaultValue?: T,
    disabledByDefault = false,
    errorValidators: FormValidator<T>[] = [],
    warningValidators: FormValidator<T>[] = [],
  ) {
    super(controls, false, disabledDefaultValue, disabledByDefault, errorValidators, warningValidators);
  }
}
