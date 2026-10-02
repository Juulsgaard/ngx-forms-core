import {FormRoot} from "../units/root/form-root";
import {IFormNode} from "../units/node/form-node.interface";
import {IFormRoot} from "../units/root/form-root.interface";

export function isFormRoot<T>(node: IFormNode<T>): node is IFormRoot<T>;
export function isFormRoot(data: unknown): data is IFormRoot<any>;
export function isFormRoot(data: unknown): boolean {
    return data instanceof FormRoot;
}
