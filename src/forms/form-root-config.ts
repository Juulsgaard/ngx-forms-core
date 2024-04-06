import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormLayerConfig} from "./form-layer-config";
import {FormGroupControls} from "../tools/form-types";
import {FormRoot} from "./form-root";

export class FormRootConfig<TValue extends SimpleObject> extends FormLayerConfig<TValue> {

  constructor(controls: FormGroupControls<NonNullable<TValue>>) {
    super(controls, false);
  }

  override done(): FormRoot<FormGroupControls<TValue>, TValue> {
    return new FormRoot(
      this.controls,
      this.disabledDefault,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
    )
  }
}
