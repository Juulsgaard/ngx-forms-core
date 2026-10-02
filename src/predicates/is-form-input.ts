import {IFormNode} from "../units/node/form-node.interface";
import {IFormInput} from "../units/input/form-input.interface";
import {FormInput} from "../units/input/form-input";

export function isFormInput<T>(data: IFormNode<T>): data is IFormInput<T>;
export function isFormInput(data: unknown): data is IFormInput<any>;
export function isFormInput(data: unknown): boolean {
    return data instanceof FormInput;
}
