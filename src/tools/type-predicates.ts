import {FormNode, FormNodeConfig} from "../forms/form-node";
import {FormSelectNode, FormSelectNodeConfig} from "../forms/form-select-node";
import {AnonFormLayer, ControlFormLayer, FormLayer, ModelFormLayer} from "../forms/form-layer";
import {AnonFormList, FormList} from "../forms/form-list";
import {AnonFormRoot, ControlFormRoot, FormRoot, ModelFormRoot} from "../forms/form-root";
import {SmartFormUnion} from "./form-types";

export function isFormNode(data: any): data is FormNode<any> {
  return data instanceof FormNode;
}

export function isFormNodeConfig(data: any): data is FormNodeConfig<any> {
  return data instanceof FormNodeConfig;
}

export function isFormSelectNode<TVal>(node: FormNode<TVal>): node is FormSelectNode<TVal, any, any>;
export function isFormSelectNode(data: any): data is FormSelectNode<any, any, any>;
export function isFormSelectNode(data: any): boolean {
  return data instanceof FormSelectNode;
}

export function isFormSelectNodeConfig<TVal>(node: FormNodeConfig<TVal>): node is FormSelectNodeConfig<TVal, any, any>;
export function isFormSelectNodeConfig(data: any): data is FormSelectNodeConfig<any, any, any>;
export function isFormSelectNodeConfig(data: any): boolean {
  return data instanceof FormSelectNodeConfig;
}

export function isFormLayer(data: any): data is AnonFormLayer {
  return data instanceof FormLayer;
}

export function isFormList(data: any): data is AnonFormList {
  return data instanceof FormList;
}

export function isFormRoot<T extends Record<string, SmartFormUnion>>(layer: ModelFormLayer<T>): layer is ModelFormRoot<T>
export function isFormRoot<T extends Record<string, SmartFormUnion>>(layer: ControlFormLayer<T>): layer is ControlFormRoot<T>
export function isFormRoot(data: any): data is AnonFormRoot
export function isFormRoot(data: any): boolean {
  return data instanceof FormRoot;
}
