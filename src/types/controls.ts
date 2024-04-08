import {FormLayer, FormList, FormNode, FormUnit, ModelFormLayer, ModelFormList} from "../forms";
import {SimpleObject} from "@juulsgaard/ts-tools";

//<editor-fold desc="Value to Controls">

type NullableFormListControls<T> = NonNullable<T> extends string ? FormNode<T[] | undefined> :
  NonNullable<T> extends number ? FormNode<T[] | undefined> :
    NonNullable<T> extends SimpleObject ? ModelFormList<NonNullable<T>, true> :
      FormNode<T[] | undefined>;

type NonNullFormListControls<T> = NonNullable<T> extends string ? FormNode<T[]> :
  NonNullable<T> extends number ? FormNode<T[]> :
    NonNullable<T> extends SimpleObject ? ModelFormList<NonNullable<T>> :
      FormNode<T[]>;

type NullableFormControls<T> = T extends string ? FormNode<string | undefined>
  : T extends boolean ? FormNode<boolean | undefined>
    : T extends File | Date ? FormNode<T | undefined>
      : T extends (infer A)[] ? NullableFormListControls<A>
        : T extends SimpleObject ? ModelFormLayer<T | undefined>
          : FormNode<T | undefined>;

type NonNullFormControls<T> = T extends string ? FormNode<string>
  : T extends boolean ? FormNode<boolean>
    : T extends File | Date ? FormNode<Date>
      : T extends (infer A)[] ? NonNullFormListControls<A>
        : T extends SimpleObject ? ModelFormLayer<T>
          : FormNode<T>;

export type FormControls<T> = undefined extends T
  ? NullableFormControls<NonNullable<T>>
  : NonNullFormControls<NonNullable<T>>;

export type FormGroupControls<T extends SimpleObject|undefined> = T extends undefined ? never : { [K in keyof T]-?: FormControls<T[K]> };
//</editor-fold>


//<editor-fold desc="Controls to Value">
export type FormValue<T extends FormUnit> =
  T extends FormList<any, infer X, true> ? X[] | undefined
    : T extends FormList<any, infer X, false> ? X[]
      : T extends FormLayer<any, infer X> ? X
        : T extends FormNode<infer X> ? X
          : never;

export type FormGroupValue<T extends Record<string, FormUnit>> = { [K in keyof T]: FormValue<T[K]> };
//</editor-fold>
