import {IFormNode} from "../units/node/form-node.interface";
import {FormNode} from "../units/node/form-node";

export function isFormNode<T>(data: IFormNode<T>): data is IFormNode<T>;
export function isFormNode(data: unknown): data is IFormNode<any>;
export function isFormNode(data: unknown): boolean {
    return data instanceof FormNode;
}
