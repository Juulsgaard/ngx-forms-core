import {FormNode} from "../models/form-node";
import {FormSelectNode} from "../models/form-select-node";
import {FormLayer} from "../models/form-layer";
import {FormList} from "../models/form-list";
import {FormRoot} from "../models/form-root";
import {SmartFormUnion} from "./form-types";
import {SimpleObject} from "@consensus-labs/ts-tools";

export function isFormNode(data: any): data is FormNode<any> {
  return data instanceof FormNode;
}

export function isFormSelectNode<TVal>(node: FormNode<TVal>): node is FormSelectNode<TVal, any, any>;
export function isFormSelectNode(data: any): data is FormSelectNode<any, any, any>;
export function isFormSelectNode(data: any): boolean {
  return data instanceof FormSelectNode;
}

export function isFormLayer(data: any): data is FormLayer<any, any, any> {
  return data instanceof FormLayer;
}

export function isFormList(data: any): data is FormList<any, any, any> {
  return data instanceof FormList;
}

export function isFormRoot<TControls extends Record<string, SmartFormUnion>, TValue extends SimpleObject, TRaw extends SimpleObject>(layer: FormLayer<TControls, TValue, TRaw>): layer is FormRoot<TControls, TValue, TRaw>
export function isFormRoot(data: any): data is FormRoot<any, any, any>
export function isFormRoot(data: any): boolean {
  return data instanceof FormRoot;
}
