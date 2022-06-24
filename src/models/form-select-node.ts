import {Observable, of} from "rxjs";
import {MapFunc, Selection} from "@consensus-labs/ts-tools";
import {FormNode, InputTypes} from "./form-node";

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

  public items$: Observable<TItem[]>;
  public bindValue: MapFunc<TItem, TUnit>;

  public bindLabel?: Selection<TItem, string>;
  public bindOption?: Selection<TItem, string>;
  public multiple = false;
  public groupProp?: string | ((x: TItem) => string);
  public selectGroups = false;
  public searchFn?: (query: string, ses: TItem) => boolean;
  public clearable = true;
  public hideWhenEmpty = false;

  constructor(
    type: InputTypes,
    defaultValue: TValue,
    items: TItem[] | Observable<TItem[]>,
    bindValue: MapFunc<TItem, TUnit>,
    initialValue = defaultValue,
    nullable = false
  ) {
    super(type, defaultValue, initialValue, nullable)
    this.items$ = items instanceof Observable ? items : of(items);
    this.bindValue = bindValue;
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

  //<editor-fold desc="Clone">
  public fromSelect(tmp: FormSelectNodeOptions<TValue, TItem> & FormNode<TValue>): FormSelectNode<TValue, TUnit, TItem> {
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

  clone(): FormSelectNode<TValue, TUnit, TItem> {
    const node = new FormSelectNode<TValue, TUnit, TItem>(this.type, this.initialValue, this.items$, this.bindValue, this.defaultValue, this.nullable);
    node.fromSelect(this);
    if (this.validator) node.withValidators(this.validator);
    return node;
  }

  //</editor-fold>
}

export type SingleSelectNode<TValue, TItem> = FormSelectNode<TValue, TValue, TItem>;
export type MultiSelectNode<TValue, TItem> = FormSelectNode<TValue[], TValue, TItem>;
