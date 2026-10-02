import {IFormLayer} from "./form-layer.interface";
import {FormValidator} from "../../tools/form-validation";
import {FormLayerControls} from "../controls";
import {assertInInjectionContext, inject, Injector, runInInjectionContext} from "@angular/core";
import {FormLayer} from "./form-layer";


export interface IFormLayerBuilder<T> {
  done(): IFormLayer<T>
}

export class FormLayerBuilder<T> implements IFormLayerBuilder<T> {

  protected disabledValue?: T;
  protected disabledByDefault?: boolean;

  protected errorValidators: FormValidator<T>[] = [];
  protected warningValidators: FormValidator<T>[] = [];

  protected postConfiguration: ((config: IFormLayer<T>) => void)[] = [];

  constructor(
    protected readonly controls: FormLayerControls<T>,
    protected readonly nullable: boolean
  ) {
  }

  /**
   * Add validators to the layer
   * @param validators
   */
  public withErrors(...validators: FormValidator<T>[]): this {
    this.errorValidators = [...this.errorValidators, ...validators];
    return this;
  }

  /**
   * Add warning validators to the layer
   * @param validators
   */
  public withWarnings(...validators: FormValidator<T>[]): this {
    this.warningValidators = [...this.warningValidators, ...validators];
    return this;
  }

  /**
   * Set a fallback value used when the layer is disabled
   * @param disabledDefault - The fallback to use
   */
  withDisabledDefault(disabledDefault: T): this {
    this.disabledValue = disabledDefault;
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
   * - `false` - Run without injection context
   * - `Injector` - Run in the context of the provided injector
   */
  configure(configure: (layer: IFormLayer<T>) => void, injectionContext: Injector | boolean = true): this {
    if (injectionContext === true) assertInInjectionContext(this.configure);

    const injector = !injectionContext ? undefined :
      injectionContext instanceof Injector ? injectionContext :
        inject(Injector);

    if (injector) {
      configure = layer => runInInjectionContext(injector, () => configure(layer));
    }

    this.postConfiguration.push(configure);
    return this;
  }

  done(): IFormLayer<T> {
    return new FormLayer<T>(
      this.controls,
      this.nullable,
      this.disabledValue,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
      this.postConfiguration
    );
  }

}
