import {ControlFormList, FormList, ModelFormList} from "../models/form-list";
import {ControlFormLayer, FormLayer, ModelFormLayer} from "../models/form-layer";
import {FormNode, FormNodeConfig} from "../models/form-node";
import {AbstractControl} from "@angular/forms";

export type FormError = { path: string[], error: string };

export type SmartFormUnion = FormNode<any> | FormLayer<any, any, any> | FormList<any, any, any>;

//<editor-fold desc="Value to Controls">
type FormListControls<A> = A extends Record<string, any> ? ModelFormList<A> : FormNode<NonNullable<A>>;

export type FormControls<T> =
  NonNullable<T> extends Date | File | string ? FormNode<T> | FormNode<NonNullable<T>> :
    NonNullable<T> extends (infer A)[] ? FormListControls<A> :
      NonNullable<T> extends Record<string, any> ? ModelFormLayer<NonNullable<T>> :
        FormNode<T> | FormNode<NonNullable<T>>;

export type FormGroupControls<T extends Record<string, any>> = { [K in keyof T]: FormControls<T[K]> };
//</editor-fold>

//<editor-fold desc="Value to Template">
type FormListTemplate<A> = A extends Record<string, any> ? [FormGroupTemplate<A>] : FormNode<NonNullable<A>>;

export type FormTemplate<T> =
  NonNullable<T> extends Date | File | string ? FormNode<T> | FormNode<NonNullable<T>> :
    NonNullable<T> extends (infer A)[] ? FormListTemplate<A> :
      NonNullable<T> extends Record<string, any> ? FormGroupTemplate<NonNullable<T>> :
        FormNode<T> | FormNode<NonNullable<T>> | FormNodeConfig<T> | FormNodeConfig<NonNullable<T>>;

export type FormGroupTemplate<T extends Record<string, any>> = { [K in keyof T]: FormTemplate<T[K]> };
//</editor-fold>

//<editor-fold desc="Controls to Value">
export type FormValue<T extends AbstractControl> = T extends ControlFormList<infer X> ? { [K in keyof X]?: FormValue<X[K]> }[] :
  T extends ControlFormLayer<infer X> ? { [K in keyof X]?: FormValue<X[K]> } :
    T extends FormNode<infer X> ? X :
      never;

export type FormValueRaw<T extends AbstractControl> = T extends ControlFormList<infer X> ? { [K in keyof X]: FormValue<X[K]> }[] :
  T extends ControlFormLayer<infer X> ? { [K in keyof X]: FormValueRaw<X[K]> } :
    T extends FormNode<infer X> ? X :
      never;

export type FormGroupValue<T extends Record<string, AbstractControl>> = { [K in keyof T]?: FormValue<T[K]> };
export type FormGroupValueRaw<T extends Record<string, AbstractControl>> = { [K in keyof T]: FormValueRaw<T[K]> };
//</editor-fold>
