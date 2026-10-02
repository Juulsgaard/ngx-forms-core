import {FormLayerBuilder} from "../layer/form-layer.builder";
import {FormLayerControls} from "../controls";
import {IFormRoot} from "./form-root.interface";
import {FormRoot} from "./form-root";


export class FormRootBuilder<T> extends FormLayerBuilder<T> {

  constructor(controls: FormLayerControls<T>) {
    super(controls, false);
  }

  override done(): IFormRoot<T> {
    return new FormRoot<T>(
      this.controls,
      this.disabledValue,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
    )
  }
}
