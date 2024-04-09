import {FormLayer, ModelFormLayer} from "./form-layer";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormValidator} from "../tools/form-validation";
import {FormGroupControls} from "../types/controls";
import {inject, Injector, runInInjectionContext} from "@angular/core";

export class FormLayerConfig<TValue extends SimpleObject|undefined> {

  protected disabledDefault?: TValue;
  protected disabledByDefault?: boolean;
  protected errorValidators: FormValidator<TValue>[] = [];
  protected warningValidators: FormValidator<TValue>[] = [];
  protected postConfiguration: ((config: ModelFormLayer<TValue>) => void)[] = [];

  constructor(
    protected readonly controls: FormGroupControls<TValue>,
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

  /**
   * Update the Layer after creation.
   * Can be used to configure autoDisable.
   * @param configure - The configuration function
   * @param injectionContext - The injection context to run the configuration in
   * - `true` - Use the current injection context
   * - `Injector` - Run in the context of the provided injector
   */
  configure(configure: (layer: ModelFormLayer<TValue>) => void, injectionContext?: Injector|boolean): this {

    const injector = !injectionContext ? undefined :
      injectionContext instanceof Injector ? injectionContext :
        inject(Injector);

    if (injector) {
      configure = layer => runInInjectionContext(injector, () => configure(layer));
    }

    this.postConfiguration.push(configure);
    return this;
  }

  done(): ModelFormLayer<TValue> {
    return new FormLayer<FormGroupControls<TValue>, TValue>(
      this.controls,
      this.nullable,
      this.disabledDefault,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
      this.postConfiguration
    );
  }

}
