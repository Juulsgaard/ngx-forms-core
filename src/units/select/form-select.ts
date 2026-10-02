import {MapFunc} from "@juulsgaard/ts-tools";
import {FormInput} from "../input/form-input";
import {IFormMultiSelect, IFormSelect, IFormSingleSelect} from "./form-select.interface";
import {FormSelectOptions} from "./form-select.types";
import {FormInputOptions, FormInputType, InputTypes} from "../input/form-input.types";
import {Signal} from "@angular/core";
import {FormValidator} from "../../tools/form-validation";


export abstract class FormSelect<T, TVal, TItem> extends FormInput<T> implements IFormSelect<T, TVal, TItem> {

  /** A mapping for the display name of an item */
  public readonly bindLabel?: MapFunc<TItem, string>;
  /** A mapping for the display name specifically when shown in the dropdown */
  public readonly bindOption?: MapFunc<TItem, string>;
  /** Whether the input can be cleared */
  public readonly clearable: boolean;
  /** Whether the input should be hidden when it has no items to select from */
  public readonly hideWhenEmpty: boolean;

  protected readonly selectOptions: FormSelectOptions<TItem>;

  constructor(
    type: FormInputType,
    nullable: boolean,
    defaultValue: T,
    readonly items: Signal<TItem[]>,
    readonly bindValue: MapFunc<TItem, TVal>,
    initialValue?: T,
    disabledDefault?: T,
    errorValidators: FormValidator<T>[] = [],
    warningValidators: FormValidator<T>[] = [],
    options: FormInputOptions & FormSelectOptions<TItem> = {}
  ) {
    super(type, nullable, defaultValue, initialValue, disabledDefault, errorValidators, warningValidators, options);
    this.selectOptions = options;

    this.bindLabel = options?.bindLabel;
    this.bindOption = options?.bindOption;
    this.clearable = options?.clearable ?? (type === InputTypes.SelectMany || nullable);
    this.hideWhenEmpty = options?.hideWhenEmpty ?? false;
  }
}

export class FormSingleSelect<T, TItem> extends FormSelect<T, T, TItem> implements IFormSingleSelect<T, TItem>{
  declare readonly type: InputTypes.Select;
  readonly multiple = false;

  override clone(): FormSingleSelect<T, TItem> {
    return new FormSingleSelect<T, TItem>(
      this.type,
      this.nullable,
      this.defaultValue,
      this.items,
      this.bindValue,
      this.initialValue,
      this.disabledDefault,
      this.errorValidators,
      this.warningValidators,
      {...this.options, ...this.selectOptions}
    );
  }
}

export class FormMultiSelect<T, TItem> extends FormSelect<T[], T, TItem> implements IFormMultiSelect<T, TItem>{
  declare readonly type: InputTypes.SelectMany;
  readonly multiple = true;

  override clone(): IFormMultiSelect<T, TItem> {
   return new FormMultiSelect<T, TItem>(
     this.type,
     this.nullable,
     this.defaultValue,
     this.items,
     this.bindValue,
     this.initialValue,
     this.disabledDefault,
     this.errorValidators,
     this.warningValidators,
     {...this.options, ...this.selectOptions}
   );
  }
}
