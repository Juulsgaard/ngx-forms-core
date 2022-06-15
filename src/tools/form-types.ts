import {ControlFormList, FormList} from "../models/form-list";
import {ControlFormLayer, FormLayer} from "../models/form-layer";
import {FormNode} from "../models/form-node";
import {AbstractControl} from "@angular/forms";

export type FormError = { path: string[], error: string };

export type SmartFormUnion = FormNode<any> | FormLayer<any, any, any> | FormList<any, any, any>;

//<editor-fold desc="Value to Controls">
type FormListControls<A> = A extends Record<string, any> ? FormList<FormGroupControls<A>, any, any> : FormNode<NonNullable<A>>;

export type FormControls<T> =
  NonNullable<T> extends (infer A)[] ? FormListControls<A> :
    NonNullable<T> extends Record<string, any> ? FormLayer<FormGroupControls<T>, any, any> :
      FormNode<T> | FormNode<NonNullable<T>>;

export type FormGroupControls<T extends Record<string, any>> = { [K in keyof T]: FormControls<T[K]> };
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
