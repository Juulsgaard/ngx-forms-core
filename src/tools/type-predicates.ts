import {AnonFormNode, FormNode, FormNodeConfig, InputTypes} from "../forms/form-node";
import {FormSelectNode, FormSelectNodeConfig} from "../forms/form-select-node";
import {AnonFormLayer, ControlFormLayer, FormLayer, ModelFormLayer} from "../forms/form-layer";
import {AnonFormList, FormList} from "../forms/form-list";
import {AnonFormRoot, ControlFormRoot, FormRoot, ModelFormRoot} from "../forms/form-root";
import {SmartFormUnion} from "./form-types";
import {SimpleObject} from "@consensus-labs/ts-tools";
import {FormControl} from "@angular/forms";

export function isFormNode<T>(data: FormNode<T>): data is FormNode<T>;
export function isFormNode<T>(data: FormControl<T>): data is FormNode<T>;
export function isFormNode(data: unknown): data is AnonFormNode;
export function isFormNode(data: unknown): boolean {
  return data instanceof FormNode;
}

export function isFormNodeConfig<T>(data: FormNodeConfig<T>): data is FormNodeConfig<T>;
export function isFormNodeConfig(data: unknown): data is FormNodeConfig<unknown>;
export function isFormNodeConfig(data: unknown): boolean {
  return data instanceof FormNodeConfig;
}

export function isFormSelectNode<TVal, TUnit, TItem>(node: FormSelectNode<TVal, TUnit, TItem>): node is FormSelectNode<TVal, TUnit, TItem>;
export function isFormSelectNode<TVal>(node: FormNode<TVal>): node is FormSelectNode<TVal, unknown, unknown>;
export function isFormSelectNode<TVal>(node: FormControl<TVal>): node is FormSelectNode<TVal, unknown, unknown>;
export function isFormSelectNode(data: unknown): data is FormSelectNode<unknown, unknown, unknown>;
export function isFormSelectNode(data: unknown): boolean {
  return data instanceof FormSelectNode;
}

export function isFormSelectNodeConfig<TVal, TUnit, TItem>(
  node: FormSelectNodeConfig<TVal, TUnit, TItem>
): node is FormSelectNodeConfig<TVal, TUnit, TItem>;
export function isFormSelectNodeConfig<TVal>(node: FormNodeConfig<TVal>): node is FormSelectNodeConfig<TVal, unknown, unknown>;
export function isFormSelectNodeConfig(data: unknown): data is FormSelectNodeConfig<unknown, unknown, unknown>;
export function isFormSelectNodeConfig(data: unknown): boolean {
  return data instanceof FormSelectNodeConfig;
}

export function isFormLayer<
  TControls extends Record<string, SmartFormUnion>,
  TVal extends SimpleObject,
  TRaw extends SimpleObject
>(data: FormLayer<TControls, TVal, TRaw>): data is FormLayer<TControls, TVal, TRaw>;
export function isFormLayer(data: unknown): data is AnonFormLayer;
export function isFormLayer(data: unknown): boolean {
  return data instanceof FormLayer;
}

export function isFormList<
  TControls extends Record<string, SmartFormUnion>,
  TVal extends SimpleObject,
  TRaw extends SimpleObject
>(data: FormList<TControls, TVal, TRaw>): data is FormList<TControls, TVal, TRaw>;
export function isFormList(data: unknown): data is AnonFormList;
export function isFormList(data: unknown): boolean {
  return data instanceof FormList;
}

export function isFormRoot<
  TControls extends Record<string, SmartFormUnion>,
  TVal extends SimpleObject,
  TRaw extends SimpleObject
>(layer: FormRoot<TControls, TVal, TRaw>): layer is FormRoot<TControls, TVal, TRaw>;
export function isFormRoot<T extends Record<string, any>>(layer: ModelFormLayer<T>): layer is ModelFormRoot<T>;
export function isFormRoot<T extends Record<string, SmartFormUnion>>(layer: ControlFormLayer<T>): layer is ControlFormRoot<T>;
export function isFormRoot(data: unknown): data is AnonFormRoot;
export function isFormRoot(data: unknown): boolean {
  return data instanceof FormRoot;
}

//<editor-fold desc="Form Node Types">

//<editor-fold desc="String">
export function isStringNode(node: AnonFormNode) : node is FormNode<string|undefined> {
  switch (node.type) {
    case InputTypes.Text:
    case InputTypes.Url:
    case InputTypes.Password:
    case InputTypes.Color:
    case InputTypes.Email:
    case InputTypes.Phone:
    case InputTypes.LongText:
    case InputTypes.HTML:
    case InputTypes.Search:
      return true;
  }
  return false;
}

export function isStringNodeStrict(node: AnonFormNode) : node is FormNode<string> {
  if (node.nullable) return false;
  return isStringNode(node);
}
//</editor-fold>

//<editor-fold desc="Number">
export function isNumberNode(node: AnonFormNode) : node is FormNode<number|undefined> {
  switch (node.type) {
    case InputTypes.Number:
      return true;
  }
  return false;
}

export function isNumberNodeStrict(node: AnonFormNode) : node is FormNode<number> {
  if (node.nullable) return false;
  return isNumberNode(node);
}
//</editor-fold>

//<editor-fold desc="Boolean">
export function isBoolNode(node: AnonFormNode) : node is FormNode<boolean> {
  switch (node.type) {
    case InputTypes.Bool:
      return true;
  }
  return false;
}
//</editor-fold>

//<editor-fold desc="Date">
export function isDateNode(node: AnonFormNode) : node is FormNode<Date|undefined> {
  switch (node.type) {
    case InputTypes.Date:
    case InputTypes.DateTime:
    case InputTypes.Time:
      return true;
  }
  return false;
}

export function isDateNodeStrict(node: AnonFormNode) : node is FormNode<Date> {
  if (node.nullable) return false;
  return isDateNode(node);
}
//</editor-fold>

//<editor-fold desc="File">
export function isFileNode(node: AnonFormNode) : node is FormNode<File|undefined> {
  switch (node.type) {
    case InputTypes.File:
      return true;
  }
  return false;
}
//</editor-fold>

//</editor-fold>
