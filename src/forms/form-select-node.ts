import {Observable, of} from "rxjs";
import {MapFunc} from "@juulsgaard/ts-tools";
import {FormNode} from "./form-node";
import {FormNodeOptions, InputTypes} from "./anon-form-node";
import {FormValidator} from "./validators";

export interface FormSelectNodeOptions<TItem> {
  bindLabel?: MapFunc<TItem, string>;
  bindOption?: MapFunc<TItem, string>;
  clearable?: boolean;
  hideWhenEmpty?: boolean;
}

export abstract class FormSelectNode<TValue, TItem, TMultiple extends boolean>
  extends FormNode<TMultiple extends true ? TValue[] : TValue> {

  /** Whether multiple items can be selected */
  abstract readonly multiple: TMultiple;
  /** An observable containing the items for the dropdown */
  public readonly items$: Observable<TItem[]>;
  /** A mapping for getting the value of a given item */
  public readonly bindValue: MapFunc<TItem, TValue>;

  /** A mapping for the display name of an item */
  public readonly bindLabel?: MapFunc<TItem, string>;
  /** A mapping for the display name specifically when shown in the dropdown */
  public readonly bindOption?: MapFunc<TItem, string>;
  /** Whether the input can be cleared */
  public readonly clearable: boolean;
  /** Whether the input should be hidden when it has no items to select from */
  public readonly hideWhenEmpty: boolean;

  protected readonly selectOptions: FormSelectNodeOptions<TItem>;

  constructor(
    type: InputTypes,
    nullable: undefined extends (TMultiple extends true ? TValue[] : TValue) ? boolean : false,
    defaultValue: TMultiple extends true ? TValue[] : TValue,
    items: TItem[] | Observable<TItem[]>,
    bindValue: MapFunc<TItem, TValue>,
    initialValue?: TMultiple extends true ? TValue[] : TValue,
    disabledDefault?: TMultiple extends true ? TValue[] : TValue,
    errorValidators: FormValidator<TMultiple extends true ? TValue[] : TValue>[] = [],
    warningValidators: FormValidator<TMultiple extends true ? TValue[] : TValue>[] = [],
    options: FormNodeOptions & FormSelectNodeOptions<TItem> = {}
  ) {
    super(type, nullable, defaultValue, initialValue, disabledDefault, errorValidators, warningValidators, options);
    this.selectOptions = options;

    this.items$ = items instanceof Observable ? items : of(items);
    this.bindValue = bindValue;

    this.bindLabel = options?.bindLabel;
    this.bindOption = options?.bindOption;
    this.clearable = options?.clearable ?? (type === InputTypes.SelectMany || nullable);
    this.hideWhenEmpty = options?.hideWhenEmpty ?? false;
  }

  /**
   * Clone the input
   * This creates a duplicate of the configuration
   * It does not clone the value
   */
  abstract override clone(): FormSelectNode<TValue, TItem, TMultiple>;
}

export class FormMultiSelectNode<TValue, TItem> extends FormSelectNode<TValue, TItem, true> {
  declare readonly type: InputTypes.SelectMany;
  override readonly multiple = true;

  override clone(): FormMultiSelectNode<TValue, TItem> {
   return new FormMultiSelectNode<TValue, TItem>(
     this.type,
     this.nullable,
     this.defaultValue,
     this.items$,
     this.bindValue,
     this.initialValue,
     this.disabledDefault,
     this.errorValidators,
     this.warningValidators,
     {...this.options, ...this.selectOptions}
   );
  }
}

export class FormSingleSelectNode<TValue, TItem> extends FormSelectNode<TValue, TItem, false> {
  declare readonly type: InputTypes.Select;
  override readonly multiple = false;

  override clone(): FormSingleSelectNode<TValue, TItem> {
    return new FormSingleSelectNode<TValue, TItem>(
      this.type,
      this.nullable,
      this.defaultValue,
      this.items$,
      this.bindValue,
      this.initialValue,
      this.disabledDefault,
      this.errorValidators,
      this.warningValidators,
      {...this.options, ...this.selectOptions}
    );
  }
}
