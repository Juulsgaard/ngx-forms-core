import {Observable, of} from "rxjs";
import {MapFunc, Selection} from "@juulsgaard/ts-tools";
import {FormNode, FormNodeConfig, FormNodeOptions, InputTypes} from "./form-node";
import {ValidatorFn} from "@angular/forms";

interface FormSelectNodeOptions<TValue, TItem> {
  bindLabel?: Selection<TItem, string>;
  bindOption?: Selection<TItem, string>;
  multiple: boolean;
  groupProp?: string | ((x: TItem) => string);
  selectGroups: boolean;
  searchFn?: (query: string, ses: TItem) => boolean;
  clearable: boolean;
  hideWhenEmpty: boolean;
}

type CustomSelection<TItem> = TItem extends Record<string, any> ? Selection<TItem, string> : MapFunc<TItem, string>;

export class FormSelectNode<TValue, TUnit, TItem> extends FormNode<TValue> implements FormSelectNodeOptions<TValue, TItem> {

  /** An observable containing the items for the dropdown */
  public readonly items$: Observable<TItem[]>;
  /** A mapping for getting the value of a given item */
  public readonly bindValue: MapFunc<TItem, TUnit>;

  /** A mapping for the display name of an item */
  public readonly bindLabel?: Selection<TItem, string>;
  /** A mapping for the display name specifically when shown in the dropdown */
  public readonly bindOption?: Selection<TItem, string>;
  /** Whether multiple items can be selected */
  public readonly multiple;
  /** Whether to, and how to group items in the dropdown */
  public readonly groupProp?: string | ((x: TItem) => string);
  /** Whether groups can be selected all at once */
  public readonly selectGroups;
  /** A custom search method */
  public readonly searchFn?: (query: string, ses: TItem) => boolean;
  /** Whether the input can be cleared */
  public readonly clearable;
  /** Whether the input should be hidden when it has no items to select from */
  public readonly hideWhenEmpty;

  /**
   * Create a FormSelect Node manually.
   * It is recommended to use the `Form.xxx` constructors for configuring Nodes.
   * @param type - The type of the input
   * @param defaultValue - The default value of the input.
   * This input is used as a fallback for missing values.
   * @param items - The items to show in the select
   * @param bindValue - A mapping for getting the value of the item
   * @param initialValue - The initial value of the input.
   * This is used for initial setup and resetting the input.
   * Defaults to defaultValue.
   * @param nullable - Whether the input is nullable
   * @param rawDefault - Define a distinct default value for getting the raw value
   * @param disabledDefault - Define a distinct default raw value for when the input is disabled
   * @param validators - Add validators
   * @param options - Additional options
   */
  constructor(
    type: InputTypes,
    defaultValue: TValue,
    items: TItem[] | Observable<TItem[]>,
    bindValue: MapFunc<TItem, TUnit>,
    initialValue: TValue = defaultValue,
    nullable: boolean = false,
    rawDefault?: TValue,
    disabledDefault?: TValue,
    validators?: ValidatorFn[],
    options?: FormNodeOptions&FormSelectNodeOptions<TValue, TItem>
  ) {
    super(type, defaultValue, initialValue, nullable, rawDefault, disabledDefault, validators, options);

    this.items$ = items instanceof Observable ? items : of(items);
    this.bindValue = bindValue;

    this.bindLabel = options?.bindLabel;
    this.bindOption = options?.bindOption;
    this.multiple = options?.multiple ?? false;
    this.groupProp = options?.groupProp;
    this.selectGroups = options?.selectGroups ?? false;
    this.searchFn = options?.searchFn;
    this.clearable = options?.clearable ?? nullable;
    this.hideWhenEmpty = options?.hideWhenEmpty ?? false;
  }


  /**
   * Clone the input
   * This creates a duplicate of the configuration
   * It does not clone the value
   */
  override clone(): FormSelectNode<TValue, TUnit, TItem> {
    const config = new FormSelectNodeConfig<TValue, TUnit, TItem>(
      this.type,
      this.defaultValue,
      this.items$,
      this.bindValue,
      this.initialValue,
      this.nullable,
      this.rawDefault,
      this.disabledDefault,
      this.validators
    );
    config.fromSelect(this);
    return config.done();
  }
}

export class FormSelectNodeConfig<TValue, TUnit, TItem> extends FormNodeConfig<TValue> {

  private bindLabel?: Selection<TItem, string>;
  private bindOption?: Selection<TItem, string>;
  private multiple = false;
  private groupProp?: string | ((x: TItem) => string);
  private selectGroups = false;
  private searchFn?: (query: string, ses: TItem) => boolean;
  private clearable = true;
  private hideWhenEmpty = false;

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
   * @param rawDefault - Define a distinct default value for getting the raw value
   * @param disabledDefault - Define a distinct default raw value for when the input is disabled
   * @param validators - Add validators
   */
  constructor(
    type: InputTypes,
    defaultValue: TValue,
    private readonly items: TItem[] | Observable<TItem[]>,
    private readonly bindValue: MapFunc<TItem, TUnit>,
    initialValue: TValue = defaultValue,
    nullable: boolean = false,
    rawDefault?: TValue,
    disabledDefault?: TValue,
    validators: ValidatorFn[] = []
  ) {
    super(type, defaultValue, initialValue, nullable, rawDefault, disabledDefault, validators);
    this.multiple = type === InputTypes.SelectMany;
  }

  /**
   * Populate this configuration based on a Select Node
   * @param _options - The options from an existing Select Node
   */
  public fromSelect(_options: FormSelectNodeOptions<TValue, TItem> & FormNodeOptions): this {
    super.from(_options);

    const options = _options as FormSelectNodeOptions<TValue, TItem>;

    this.bindLabel = options.bindLabel;
    this.bindOption = options.bindOption;
    this.multiple = options.multiple;
    this.groupProp = options.groupProp;
    this.selectGroups = options.selectGroups;
    this.searchFn = options.searchFn;
    this.clearable = options.clearable;
    this.hideWhenEmpty = options.hideWhenEmpty;

    return this;
  }

  //<editor-fold desc="Configuration">

  /**
   * Define data bindings for the items
   * @param label - A binding for the display name of items
   * @param option - An optional binding for display names in the dropdown.
   * Defaults to the label binding
   */
  withBinds(
    label: CustomSelection<TItem>,
    option?: CustomSelection<TItem>
  ): this {
    this.bindLabel = label;
    this.bindOption = option;
    return this;
  }

  /**
   * Add grouping to the select
   * @param prop - How to group the items
   * @param selectGroups - Whether the groups should be selectable
   */
  groupBy(prop: string | ((x: TItem) => string), selectGroups = false): this {
    this.groupProp = prop;
    this.selectGroups = selectGroups;
    return this;
  }

  /**
   * Add custom searching to the select
   * @param searchFn
   */
  withSearch(searchFn: (query: string, ses: TItem) => boolean): this {
    this.searchFn = searchFn;
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

  protected getSelectOptions(): FormSelectNodeOptions<TValue, TItem> {
    return {
      bindLabel: this.bindLabel,
      bindOption: this.bindOption,
      clearable: this.clearable,
      groupProp: this.groupProp,
      hideWhenEmpty: this.hideWhenEmpty,
      selectGroups: this.selectGroups,
      multiple: this.multiple,
      searchFn: this.searchFn
    }
  }

  /**
   * Finalise the config and produce the input
   */
  override done(): FormSelectNode<TValue, TUnit, TItem> {
    return new FormSelectNode<TValue, TUnit, TItem>(
      this.type,
      this.defaultValue,
      this.items,
      this.bindValue,
      this.initialValue,
      this.nullable,
      this.rawDefault,
      this.disabledDefault,
      this.validators,
      {
        ...this.getOptions(),
        ...this.getSelectOptions()
      }
    );
  }

}

export type SingleSelectNode<TValue, TItem> = FormSelectNode<TValue, TValue, TItem>;
export type SingleSelectNodeConfig<TValue, TItem> = FormSelectNodeConfig<TValue, TValue, TItem>;
export type MultiSelectNode<TValue, TItem> = FormSelectNode<TValue[], TValue, TItem>;
export type MultiSelectNodeConfig<TValue, TItem> = FormSelectNodeConfig<TValue[], TValue, TItem>;
