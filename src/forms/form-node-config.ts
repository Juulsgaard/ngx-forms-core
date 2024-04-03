import {FormNodeOptions, InputTypes} from "./anon-form-node";
import {AutoComplete} from "../tools/form-types";
import {FormNode} from "./form-node";
import {FormValidator} from "./validators";

export class FormNodeConfig<T> {

  protected label?: string;
  protected autocomplete?: string;
  protected tooltip?: string;
  protected readonly?: boolean;
  protected autoFocus?: boolean;
  protected showDisabledField?: boolean;
  protected isRequired?: boolean;
  protected disabled?: boolean;

  /**
   * Create a Form Node manually.
   * It is recommended to use the `Form.xxx` constructors for configuring Form Nodes.
   * @param type - The type of the input
   * @param defaultValue - The default value of the input.
   * This input is used as a fallback for missing values.
   * @param initialValue - The initial value of the input.
   * This is used for initial setup and resetting the input.
   * Defaults to defaultValue.
   * @param nullable - Whether the input is nullable
   * @param disabledDefault - A default value for when the input is disabled
   * @param errorValidators - Error validators
   * @param warningValidators - Warning validators
   */
  constructor(
    protected readonly type: InputTypes,
    protected readonly nullable: undefined extends T ? boolean : false,
    protected readonly defaultValue: T,
    protected readonly initialValue?: T,
    protected disabledDefault?: T,
    protected errorValidators: FormValidator<T>[] = [],
    protected warningValidators: FormValidator<T>[] = []
  ) {

  }

  /**
   * Mark the input as required
   */
  public required(): this {
    this.isRequired = true;
    return this;
  }

  /**
   * Add a label to the input
   * @param label
   */
  public withLabel(label: string): this {
    this.label = label;
    return this;
  }

  /**
   * Add HTML autocompletion to the input
   * @param autocomplete - The type of autocomplete
   */
  public autocompleteAs(autocomplete: AutoComplete): this {
    this.autocomplete = autocomplete;
    return this;
  }

  /**
   * Add validators to the input
   * @param validators
   */
  public withValidators(...validators: FormValidator<T>[]): this {
    this.errorValidators = [...this.errorValidators, ...validators];
    return this;
  }

  /**
   * Add warning validators to the input
   * @param validators
   */
  public withWarningValidators(...validators: FormValidator<T>[]): this {
    this.warningValidators = [...this.warningValidators, ...validators];
    return this;
  }

  /**
   * Add a tooltip to the input.
   * This can be used to explain details about the input and it's use.
   * @param tooltip - The tooltip to show
   */
  public withTooltip(tooltip: string): this {
    this.tooltip = tooltip;
    return this;
  }

  /**
   * Show the input even when disabled.
   * By default, disabled inputs are hidden.
   */
  public showDisabled(): this {
    this.showDisabledField = true;
    return this;
  }

  /**
   * Mark the input as read-only
   */
  public asReadonly(): this {
    this.readonly = true;
    return this;
  }

  /**
   * Autofocus on the input
   */
  public withFocus(): this {
    this.autoFocus = true;
    return this;
  }

  /**
   * Set a default value for raw value when input is disabled
   * @param disabledDefault
   * @internal
   */
  withDisabledDefault(disabledDefault: T): this {
    this.disabledDefault = disabledDefault;
    return this;
  }

  protected getOptions(): FormNodeOptions {
    return {
      label: this.label,
      readonly: this.readonly,
      autocomplete: this.autocomplete,
      autoFocus: this.autoFocus,
      showDisabledField: this.showDisabledField,
      tooltip: this.tooltip,
      disabled: this.disabled,
      required: this.isRequired
    };
  }

  /**
   * Finalise the config and produce the input
   */
  done(): FormNode<T> {
    return new FormNode<T>(
      this.type,
      this.nullable,
      this.defaultValue,
      this.initialValue,
      this.disabledDefault,
      this.errorValidators,
      this.warningValidators,
      this.getOptions()
    )
  }

}
