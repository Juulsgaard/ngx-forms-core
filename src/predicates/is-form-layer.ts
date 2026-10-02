import {IFormNode} from "../units/node/form-node.interface";
import {IFormLayer} from "../units/layer/form-layer.interface";
import {FormLayer} from "../units/layer/form-layer";

export function isFormLayer<T>(data: IFormNode<T>): data is IFormLayer<T>;
export function isFormLayer(data: unknown): data is IFormLayer<any>;
export function isFormLayer(data: unknown): boolean {
    return data instanceof FormLayer;
}
