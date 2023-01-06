import {Observable, of} from "rxjs";
import {MapFunc, Selection} from "@consensus-labs/ts-tools";
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

  public readonly items$: Observable<TItem[]>;
  public readonly bindValue: MapFunc<TItem, TUnit>;

  public readonly bindLabel?: Selection<TItem, string>;
  public readonly bindOption?: Selection<TItem, string>;
  public readonly multiple;
  public readonly groupProp?: string | ((x: TItem) => string);
  public readonly selectGroups;
  public readonly searchFn?: (query: string, ses: TItem) => boolean;
  public readonly clearable;
  public readonly hideWhenEmpty;

  constructor(
    type: InputTypes,
    defaultValue: TValue,
    items: TItem[] | Observable<TItem[]>,
    bindValue: MapFunc<TItem, TUnit>,
    initialValue: TValue = defaultValue,
    nullable: boolean = false,
    rawDefault?: TValue,
    validators?: ValidatorFn[],
    options?: FormNodeOptions&FormSelectNodeOptions<TValue, TItem>
  ) {
    super(type, defaultValue, initialValue, nullable, rawDefault, validators, options);

    this.items$ = items instanceof Observable ? items : of(items);
    this.bindValue = bindValue;

    this.bindLabel = options?.bindLabel;
    this.bindOption = options?.bindOption;
    this.multiple = options?.multiple ?? false;
    this.groupProp = options?.groupProp;
    this.selectGroups = options?.selectGroups ?? false;
    this.searchFn = options?.searchFn;
    this.clearable = options?.clearable ?? false;
    this.hideWhenEmpty = options?.hideWhenEmpty ?? false;
  }

  //<editor-fold desc="Clone">

  clone(): FormSelectNode<TValue, TUnit, TItem> {
    const config = new FormSelectNodeConfig<TValue, TUnit, TItem>(
      this.type,
      this.defaultValue,
      this.items$,
      this.bindValue,
      this.initialValue,
      this.nullable,
      this.rawDefault,
      this.validators
    );
    config.fromSelect(this);
    return config.done();
  }

  //</editor-fold>
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

  constructor(
    type: InputTypes,
    defaultValue: TValue,
    private readonly items: TItem[] | Observable<TItem[]>,
    private readonly bindValue: MapFunc<TItem, TUnit>,
    initialValue: TValue = defaultValue,
    nullable: boolean = false,
    rawDefault?: TValue,
    validators: ValidatorFn[] = []
  ) {
    super(type, defaultValue, initialValue, nullable, rawDefault, validators);
  }

  public fromSelect(tmp: FormSelectNodeOptions<TValue, TItem> & FormNodeOptions): this {
    super.from(tmp);

    const options = tmp as FormSelectNodeOptions<TValue, TItem>;

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

  withBinds(
    label?: CustomSelection<TItem>,
    optionBinding?: CustomSelection<TItem>
  ): this {
    this.bindLabel = label;
    this.bindOption = optionBinding;
    return this;
  }

  groupBy(prop: string | ((x: TItem) => string), selectGroups = false): this {
    this.groupProp = prop;
    this.selectGroups = selectGroups;
    return this;
  }

  withSearch(searchFn: (query: string, ses: TItem) => boolean): this {
    this.searchFn = searchFn;
    return this;
  }

  noClear(): this {
    this.clearable = false;
    return this;
  }

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

  done(): FormSelectNode<TValue, TUnit, TItem> {
    return new FormSelectNode<TValue, TUnit, TItem>(
      this.type,
      this.defaultValue,
      this.items,
      this.bindValue,
      this.initialValue,
      this.nullable,
      this.rawDefault,
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
