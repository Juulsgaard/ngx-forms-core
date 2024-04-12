import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormValidator} from "../tools/form-validation";
import {FormList, ModelFormList} from "./form-list";
import {FormGroupControls} from "../types/controls";
import {FormLayerConfig} from "./form-layer-config";
import {assertInInjectionContext, inject, Injector, runInInjectionContext} from "@angular/core";
import {FormListValue} from "../types";

export abstract class BaseFormListConfig<TValue extends SimpleObject|undefined, TNullable extends boolean> {
  abstract done(): FormList<FormGroupControls<TValue>, TValue, TNullable>;
}

export class FormListConfig<TValue extends SimpleObject|undefined, TNullable extends boolean> extends BaseFormListConfig<TValue, TNullable> {

  protected startLength?: number;
  protected disabledDefault?: TValue[];
  protected disabledByDefault?: boolean;
  protected errorValidators: FormValidator<FormListValue<TValue, TNullable>>[] = [];
  protected warningValidators: FormValidator<FormListValue<TValue, TNullable>>[] = [];
  protected postConfiguration: ((layer: ModelFormList<TValue, TNullable>) => void)[] = [];

  protected layerConfig: FormLayerConfig<TValue>;

  constructor(
    protected readonly controls: FormGroupControls<TValue>,
    protected readonly nullable: TNullable
  ) {
    super();
    this.layerConfig = new FormLayerConfig<TValue>(controls, false);
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
  public withErrors(...validators: FormValidator<FormListValue<TValue, TNullable>>[]): this {
    this.errorValidators = [...this.errorValidators, ...validators];
    return this;
  }

  /**
   * Add warning validators to the list
   * @param validators
   */
  public withWarnings(...validators: FormValidator<FormListValue<TValue, TNullable>>[]): this {
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
  layer(configure: (config: FormLayerConfig<TValue>) => void): this {
    configure(this.layerConfig);
    return this;
  }

  /**
   * Update the List after creation.
   * Can be used to configure autoDisable.
   * @param configure - The configuration function
   * @param injectionContext - The injection context to run the configuration in
   * - `true` - Use the current injection context
   * - `Injector` - Run in the context of the provided injector
   */
  configure(configure: (layer: ModelFormList<TValue, TNullable>) => void, injectionContext?: Injector|boolean): this {

    if (injectionContext) assertInInjectionContext(this.configure);

    const injector = !injectionContext ? undefined :
      injectionContext instanceof Injector ? injectionContext :
        inject(Injector);

    if (injector) {
      configure = list => runInInjectionContext(injector, () => configure(list));
    }

    this.postConfiguration.push(configure);
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
      this.postConfiguration
    )
  }

}
