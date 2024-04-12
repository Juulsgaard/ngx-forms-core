import {
  AnonFormLayer, AnonFormList, AnonFormNode, AnonFormRoot, ControlFormLayer, ControlFormRoot, FormLayer, FormList,
  FormMultiSelectNode, FormNode, FormRoot, FormSelectNode, FormSingleSelectNode, FormUnit, InputTypes, ModelFormLayer,
  ModelFormRoot
} from "../forms";
import {SimpleObject} from "@juulsgaard/ts-tools";

export function isFormNode<T>(data: FormNode<T>): data is FormNode<T>;
export function isFormNode(data: unknown): data is AnonFormNode;
export function isFormNode(data: unknown): boolean {
  return data instanceof FormNode;
}

export function isFormSelectNode<TVal, TItem, TMultiple extends boolean>(node: FormSelectNode<TVal, TItem, TMultiple>): node is FormSelectNode<TVal, TItem, TMultiple>;
export function isFormSelectNode(data: unknown): data is FormSelectNode<unknown, unknown, boolean>;
export function isFormSelectNode(data: unknown): boolean {
  return data instanceof FormSelectNode;
}

export function isFormSingleSelectNode<TVal, TItem>(node: FormSingleSelectNode<TVal, TItem>): node is FormSingleSelectNode<TVal, TItem>;
export function isFormSingleSelectNode<TVal, TItem>(node: FormSelectNode<TVal, TItem, false>): node is FormSingleSelectNode<TVal, TItem>;
export function isFormSingleSelectNode<TVal>(node: FormNode<TVal>): node is FormSingleSelectNode<TVal, unknown>;
export function isFormSingleSelectNode(data: unknown): data is FormSingleSelectNode<unknown, unknown>;
export function isFormSingleSelectNode(data: unknown): boolean {
  return data instanceof FormSingleSelectNode;
}

export function isFormMultiSelectNode<TVal, TItem>(node: FormMultiSelectNode<TVal, TItem>): node is FormMultiSelectNode<TVal, TItem>;
export function isFormMultiSelectNode<TVal, TItem>(node: FormSelectNode<TVal, TItem, true>): node is FormMultiSelectNode<TVal, TItem>;
export function isFormMultiSelectNode<TVal>(node: FormNode<TVal[]>): node is FormMultiSelectNode<TVal, unknown>;
export function isFormMultiSelectNode(data: unknown): data is FormMultiSelectNode<unknown, unknown>;
export function isFormMultiSelectNode(data: unknown): boolean {
  return data instanceof FormMultiSelectNode;
}

export function isFormLayer<
  TControls extends Record<string, FormUnit>,
  TVal extends SimpleObject
>(data: FormLayer<TControls, TVal>): data is FormLayer<TControls, TVal>;
export function isFormLayer(data: unknown): data is AnonFormLayer;
export function isFormLayer(data: unknown): boolean {
  return data instanceof FormLayer;
}

export function isFormList<
  TControls extends Record<string, FormUnit>,
  TVal extends SimpleObject,
  TNullable extends boolean
>(data: FormList<TControls, TVal, TNullable>): data is FormList<TControls, TVal, TNullable>;
export function isFormList(data: unknown): data is AnonFormList;
export function isFormList(data: unknown): boolean {
  return data instanceof FormList;
}

export function isFormRoot<
  TControls extends Record<string, FormUnit>,
  TVal extends SimpleObject
>(layer: FormRoot<TControls, TVal>): layer is FormRoot<TControls, TVal>;
export function isFormRoot<T extends Record<string, any>>(layer: ModelFormLayer<T>): layer is ModelFormRoot<T>;
export function isFormRoot<T extends Record<string, FormUnit>>(layer: ControlFormLayer<T>): layer is ControlFormRoot<T>;
export function isFormRoot(data: unknown): data is AnonFormLayer&AnonFormRoot;
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
