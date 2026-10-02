import {FormLayerControls} from "../controls";
import {IFormList} from "./form-list.interface";
import {FormValidator} from "../../tools/form-validation";
import {FormLayerBuilder} from "../layer/form-layer.builder";
import {assertInInjectionContext, inject, Injector, runInInjectionContext} from "@angular/core";
import {FormList} from "./form-list";


export interface IFormListBuilder<T> {
  done(): IFormList<T>;
}

export class FormListBuilder<T> implements IFormListBuilder<T> {

  protected startLength?: number;
  protected disabledDefault?: T[];
  protected disabledByDefault?: boolean;
  protected errorValidators: FormValidator<T[]>[] = [];
  protected warningValidators: FormValidator<T[]>[] = [];
  protected postConfiguration: ((layer: IFormList<T>) => void)[] = [];

  protected layerConfig: FormLayerBuilder<T>;

  constructor(
    protected readonly controls: FormLayerControls<T>
  ) {
    this.layerConfig = new FormLayerBuilder<T>(controls, false);
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
  public withErrors(...validators: FormValidator<T[]>[]): this {
    this.errorValidators = [...this.errorValidators, ...validators];
    return this;
  }

  /**
   * Add warning validators to the list
   * @param validators
   */
  public withWarnings(...validators: FormValidator<T[]>[]): this {
    this.warningValidators = [...this.warningValidators, ...validators];
    return this;
  }

  /**
   * Set a fallback value used when the list is disabled
   * @param disabledDefault - The fallback to use
   */
  withDisabledDefault(disabledDefault: T[]): this {
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
  layer(configure: (config: FormLayerBuilder<T>) => void): this {
    configure(this.layerConfig);
    return this;
  }

  /**
   * Update the List after creation.
   * Can be used to configure autoDisable.
   * @param configure - The configuration function
   * @param injectionContext - The injection context to run the configuration in
   * - `true` - Use the current injection context
   * - `false` - Run without injection context
   * - `Injector` - Run in the context of the provided injector
   */
  configure(configure: (layer: IFormList<T>) => void, injectionContext: Injector | boolean = true): this {

    if (injectionContext === true) assertInInjectionContext(this.configure);

    const injector = !injectionContext ? undefined :
      injectionContext instanceof Injector ? injectionContext :
        inject(Injector);

    if (injector) {
      configure = list => runInInjectionContext(injector, () => configure(list));
    }

    this.postConfiguration.push(configure);
    return this;
  }

  done(): IFormList<T> {
    return new FormList(
      this.layerConfig.done(),
      this.startLength,
      this.disabledDefault,
      this.disabledByDefault,
      this.errorValidators,
      this.warningValidators,
      this.postConfiguration
    )
  }

}
