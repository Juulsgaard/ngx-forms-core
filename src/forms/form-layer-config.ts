import {FormLayer} from "./form-layer";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormGroupControls} from "../tools/form-types";
import {FormValidator} from "../tools/form-validation";

export class FormLayerConfig<TValue extends SimpleObject|undefined> {

  protected disabledDefault?: TValue;
  protected disabledByDefault?: boolean;
  protected errorValidators: FormValidator<TValue>[] = [];
  protected warningValidators: FormValidator<TValue>[] = [];

  constructor(
    protected readonly controls: FormGroupControls<NonNullable<TValue>>,
    protected readonly nullable: undefined extends TValue ? boolean : false
  ) {
  }

  /**
   * Add validators to the layer
   * @param validators
   */
  public withErrors(...validators: FormValidator<TValue>[]): this {
    this.errorValidators = [...this.errorValidators, ...validators];
    return this;
  }

  /**
   * Add warning validators to the layer
   * @param validators
   */
  public withWarnings(...validators: FormValidator<TValue>[]): this {
    this.warningValidators = [...this.warningValidators, ...validators];
    return this;
  }

  /**
   * Set a fallback value used when the layer is disabled
   * @param disabledDefault - The fallback to use
   */
  withDisabledDefault(disabledDefault: TValue): this {
    this.disabledDefault = disabledDefault;
    return this;
  }

  /** Set the layer as disabled by default */
  disabled(): this {
    this.disabledByDefault = true;
    return this;
  }

  done(): FormLayer<FormGroupControls<NonNullable<TValue>>, TValue> {
    return new FormLayer<FormGroupControls<NonNullable<TValue>>, TValue>(
      this.controls,
      this.nullable,
      this.disabledDefault,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
    );
  }

}
