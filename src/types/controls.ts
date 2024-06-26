import {FormLayer, FormList, FormNode, FormUnit, ModelFormLayer, ModelFormList} from "../forms";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {FormObjectTypes, ObjArr} from "./misc";

//<editor-fold desc="Value to Controls">

type NullableFormControls<T> =
  NonNullable<T> extends FormObjectTypes ? FormNode<NonNullable<T> | undefined>
    : NonNullable<T> extends FormObjectTypes[] ? FormNode<NonNullable<T> | undefined>
      : NonNullable<T> extends ObjArr<infer A> ? ModelFormList<A, true>
        : NonNullable<T> extends any[] ? FormNode<NonNullable<T> | undefined>
          : NonNullable<T> extends SimpleObject ? ModelFormLayer<NonNullable<T> | undefined>
            : FormNode<NonNullable<T> | undefined>;

type NonNullFormControls<T> =
  NonNullable<T> extends FormObjectTypes ? FormNode<NonNullable<T>>
    : NonNullable<T> extends FormObjectTypes[] ? FormNode<NonNullable<T>>
      : NonNullable<T> extends ObjArr<infer A> ? ModelFormList<A>
        : NonNullable<T> extends any[] ? FormNode<NonNullable<T>>
          : NonNullable<T> extends SimpleObject ? ModelFormLayer<NonNullable<T>>
            : FormNode<NonNullable<T>>;

export type FormControls<T> = undefined extends T ? NullableFormControls<T> : NonNullFormControls<T>;

export type FormGroupControls<T extends SimpleObject> = { [K in keyof T]-?: FormControls<T[K]> };
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
