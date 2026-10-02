import {FormMultiSelect, FormSelect, FormSingleSelect} from "../units/select/form-select";
import {IFormMultiSelect, IFormSelect, IFormSingleSelect} from "../units/select/form-select.interface";
import {IFormNode} from "../units/node/form-node.interface";

export function isFormSelect<T, TVal, TItem>(node: IFormSelect<T, TVal, TItem>): node is IFormSelect<T, TVal, TItem>;
export function isFormSelect(data: unknown): data is IFormSelect<any, any, any>;
export function isFormSelect(data: unknown): boolean {
    return data instanceof FormSelect;
}

export function isFormSingleSelect<T, TItem>(node: IFormSelect<T, T, TItem>): node is IFormSingleSelect<T, TItem>;
export function isFormSingleSelect<T>(node: IFormNode<T>): node is IFormSingleSelect<T, any>;
export function isFormSingleSelect(data: unknown): data is IFormSingleSelect<any, any>;
export function isFormSingleSelect(data: unknown): boolean {
    return data instanceof FormSingleSelect;
}

export function isFormMultiSelect<T, TItem>(node: IFormSelect<T[], T, TItem>): node is IFormMultiSelect<T, TItem>;
export function isFormMultiSelect<T>(node: IFormNode<T[]>): node is IFormMultiSelect<T, any>;
export function isFormMultiSelect(data: unknown): data is IFormMultiSelect<any, any>;
export function isFormMultiSelect(data: unknown): boolean {
    return data instanceof FormMultiSelect;
}
