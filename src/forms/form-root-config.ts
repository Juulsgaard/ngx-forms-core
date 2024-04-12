import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormLayerConfig} from "./form-layer-config";
import {FormRoot, ModelFormRoot} from "./form-root";
import {FormGroupControls} from "../types/controls";

export class FormRootConfig<TValue extends SimpleObject> extends FormLayerConfig<TValue> {

  constructor(controls: FormGroupControls<TValue>) {
    super(controls, false);
  }

  override done(): ModelFormRoot<TValue> {
    return new FormRoot(
      this.controls,
      this.disabledDefault,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
    )
  }
}
