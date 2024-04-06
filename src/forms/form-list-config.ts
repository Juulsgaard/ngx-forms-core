import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormValidator} from "../tools/form-validation";
import {FormList} from "./form-list";
import {FormGroupControls} from "../types/controls";
import {FormLayerConfig} from "./form-layer-config";

export class FormListConfig<TValue extends SimpleObject, TNullable extends boolean> {

  protected startLength?: number;
  protected disabledDefault?: TValue[];
  protected disabledByDefault?: boolean;
  protected errorValidators: FormValidator<TNullable extends true ? TValue[] | undefined : TValue[]>[] = [];
  protected warningValidators: FormValidator<TNullable extends true ? TValue[] | undefined : TValue[]>[] = [];

  protected layerConfig: FormLayerConfig<NonNullable<TValue>>;

  constructor(
    protected readonly controls: FormGroupControls<TValue>,
    protected readonly nullable: TNullable
  ) {
    this.layerConfig = new FormLayerConfig<NonNullable<TValue>>(controls, false);
  }

  /**
   * Set the default length of the list
   * @param length - The default length
   */
  withLength(length: number): this {
    this.startLength = length;
    return this;
  }

  /**
   * Add validators to the list
   * @param validators
   */
  public withErrors(...validators: FormValidator<TNullable extends true ? TValue[] | undefined : TValue[]>[]): this {
    this.errorValidators = [...this.errorValidators, ...validators];
    return this;
  }

  /**
   * Add warning validators to the list
   * @param validators
   */
  public withWarnings(...validators: FormValidator<TNullable extends true ? TValue[] | undefined : TValue[]>[]): this {
    this.warningValidators = [...this.warningValidators, ...validators];
    return this;
  }

  /**
   * Set a fallback value used when the list is disabled
   * @param disabledDefault - The fallback to use
   */
  withDisabledDefault(disabledDefault: TValue[]): this {
    this.disabledDefault = disabledDefault;
    return this;
  }

  /** Set the list as disabled by default */
  disabled(): this {
    this.disabledByDefault = true;
    return this;
  }

  /**
   * Configure the underlying layer control for the list
   * @param configure
   */
  layer(configure: (config: FormLayerConfig<NonNullable<TValue>>) => void): this {
    configure(this.layerConfig);
    return this;
  }

  done(): FormList<FormGroupControls<TValue>, TValue, TNullable> {
    return new FormList(
      this.layerConfig.done(),
      this.nullable,
      this.startLength,
      this.disabledDefault,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
    )
  }

}
