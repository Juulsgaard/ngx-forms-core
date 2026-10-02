import {FormList} from "../units/list/form-list";
import {IFormNode} from "../units/node/form-node.interface";
import {IFormList} from "../units/list/form-list.interface";

export function isFormList<T>(data: IFormList<T>): data is IFormList<T>;
export function isFormList<T>(data: IFormNode<T[]>): data is IFormList<T>;
export function isFormList(data: unknown): data is IFormList<any>;
export function isFormList(data: unknown): boolean {
    return data instanceof FormList;
}
