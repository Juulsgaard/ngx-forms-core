import {FormNodeConfig} from "./form-node-config";
import {MapFunc} from "@juulsgaard/ts-tools";
import {InputTypes} from "./anon-form-node";
import {FormValidator} from "./validators";
import {Observable} from "rxjs";
import {FormMultiSelectNode, FormSelectNode, FormSelectNodeOptions, FormSingleSelectNode} from "./form-select-node";

export abstract class FormSelectNodeConfig<TValue, TItem, TMultiple extends boolean>
  extends FormNodeConfig<TMultiple extends true ? TValue[] : TValue> {

  private bindLabel?: MapFunc<TItem, string>;
  private bindOption?: MapFunc<TItem, string>;
  private clearable = true;
  private hideWhenEmpty = false;

  declare readonly type: TMultiple extends true ? InputTypes.SelectMany : InputTypes.Select;
  declare readonly nullable: undefined extends (TMultiple extends true ? TValue[] : TValue) ? boolean : false;
  declare readonly defaultValue: TMultiple extends true ? TValue[] : TValue;
  declare readonly initialValue: TMultiple extends true ? TValue[] : TValue;
  declare readonly disabledDefault: TMultiple extends true ? TValue[] : TValue;
  declare readonly errorValidators: FormValidator<TMultiple extends true ? TValue[] : TValue>[];
  declare readonly warningValidators: FormValidator<TMultiple extends true ? TValue[] : TValue>[];

  /**
   * Create a FormSelect Config manually.
   * It is recommended to use the `Form.xxx` constructors for creating configurations.
   * @param multiple
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
   * @param errorValidators - Error validators
   * @param warningValidators - Warning validators
   */
  constructor(
    readonly multiple: TMultiple,
    type: TMultiple extends true ? InputTypes.SelectMany : InputTypes.Select,
    nullable: undefined extends (TMultiple extends true ? TValue[] : TValue) ? boolean : false,
    defaultValue: TMultiple extends true ? TValue[] : TValue,
    protected readonly items: TItem[] | Observable<TItem[]>,
    protected readonly bindValue: MapFunc<TItem, TValue>,
    initialValue?: TMultiple extends true ? TValue[] : TValue,
    disabledDefault?: TMultiple extends true ? TValue[] : TValue,
    errorValidators: FormValidator<TMultiple extends true ? TValue[] : TValue>[] = [],
    warningValidators: FormValidator<TMultiple extends true ? TValue[] : TValue>[] = [],
  ) {
    super(type, nullable, defaultValue, initialValue, disabledDefault, errorValidators, warningValidators);
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

  protected getSelectOptions(): FormSelectNodeOptions<TItem> {
    return {
      bindLabel: this.bindLabel,
      bindOption: this.bindOption,
      clearable: this.clearable,
      hideWhenEmpty: this.hideWhenEmpty,
    }
  }

  abstract override done(): FormSelectNode<TValue, TItem, TMultiple>;
}

export class FormSingleSelectNodeConfig<TValue, TItem> extends FormSelectNodeConfig<TValue, TItem, false> {
    override done(): FormSingleSelectNode<TValue, TItem> {
      return new FormSingleSelectNode<TValue, TItem>(
        this.type,
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

export class FormMultiSelectNodeConfig<TValue, TItem> extends FormSelectNodeConfig<TValue, TItem, true> {
  override done(): FormMultiSelectNode<TValue, TItem> {
    return new FormMultiSelectNode<TValue, TItem>(
      this.type,
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
