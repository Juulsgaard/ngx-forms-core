import {FormValidator} from "../../tools/form-validation";
import {FormInputBuilder} from "../input/form-input.builder";
import {MapFunc} from "@juulsgaard/ts-tools";
import {InputTypes} from "../input/form-input.types";
import {Signal} from "@angular/core";
import {FormSelectOptions} from "./form-select.types";
import {FormMultiSelect, FormSingleSelect} from "./form-select";

export abstract class FormSelectBuilder<T, TVal, TItem> extends FormInputBuilder<T> {

  private bindLabel?: MapFunc<TItem, string>;
  private bindOption?: MapFunc<TItem, string>;
  private clearable = true;
  private hideWhenEmpty = false;

  declare readonly nullable: undefined extends (T) ? boolean : false;
  declare readonly defaultValue: T;
  declare readonly initialValue: T;
  declare readonly disabledDefault: T;
  declare readonly errorValidators: FormValidator<T>[];
  declare readonly warningValidators: FormValidator<T>[];

  /**
   * Create a FormSelect Config manually.
   * It is recommended to use the `Form.xxx` constructors for creating configurations.
   * @param type - The type of the input
   * @param defaultValue - The default value of the input.
   * This input is used as a fallback for missing values.
   * @param items - The items to show in the select
   * @param bindValue - A mapping for getting the value of the item
   * @param initialValue - The initial value of the input.
   * This is used for initial setup and resetting the input.
   * Defaults to defaultValue.
   * @param nullable - Whether the input is nullable
   * @param disabledDefault - Define a distinct default raw value for when the input is disabled
   */
  constructor(
    type: InputTypes,
    nullable: undefined extends (T) ? boolean : false,
    defaultValue: T,
    protected readonly items: Signal<TItem[]>,
    protected readonly bindValue: MapFunc<TItem, TVal>,
    initialValue?: T,
    disabledDefault?: T
  ) {
    super(type, nullable, defaultValue, initialValue, disabledDefault);
  }

  //<editor-fold desc="Configuration">

  /**
   * Define data bindings for the items
   * @param label - A binding for the display name of items
   * @param option - An optional binding for display names in the dropdown.
   * Defaults to the label binding
   */
  withBinds(
    label: MapFunc<TItem, string>,
    option?: MapFunc<TItem, string>
  ): this {
    this.bindLabel = label;
    this.bindOption = option;
    return this;
  }

  /**
   * Disable input clearing for nullable inputs
   */
  noClear(): this {
    this.clearable = false;
    return this;
  }

  /**
   * Hide the input when it has no items to select
   */
  hideEmpty(): this {
    this.hideWhenEmpty = true;
    return this;
  }

  //</editor-fold>

  protected getSelectOptions(): FormSelectOptions<TItem> {
    return {
      bindLabel: this.bindLabel,
      bindOption: this.bindOption,
      clearable: this.clearable,
      hideWhenEmpty: this.hideWhenEmpty,
    }
  }
}

export class FormSingleSelectBuilder<T, TItem> extends FormSelectBuilder<T, T, TItem> {
    override done(): FormSingleSelect<T, TItem> {
      return new FormSingleSelect<T, TItem>(
        InputTypes.Select,
        this.nullable,
        this.defaultValue,
        this.items,
        this.bindValue,
        this.initialValue,
        this.disabledDefault,
        this.errorValidators,
        this.warningValidators,
        {
          ...this.getOptions(),
          ...this.getSelectOptions()
        }
      );
    }
}

export class FormMultiSelectBuilder<T, TItem> extends FormSelectBuilder<T[], T, TItem> {
  override done(): FormMultiSelect<T, TItem> {
    return new FormMultiSelect<T, TItem>(
      InputTypes.SelectMany,
      this.nullable,
      this.defaultValue,
      this.items,
      this.bindValue,
      this.initialValue,
      this.disabledDefault,
      this.errorValidators,
      this.warningValidators,
      {
        ...this.getOptions(),
        ...this.getSelectOptions()
      }
    );
  }
}
