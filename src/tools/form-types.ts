import {FormList, ModelFormList} from "../forms/form-list";
import {FormLayer, ModelFormLayer} from "../forms/form-layer";
import {FormNode} from "../forms/form-node";
import {AnonFormNode} from "../forms/anon-form-node";
import {FormNodeConfig} from "../forms/form-node-config";
import {FormUnit} from "../forms/form-unit";
import {AnonFormLayer, AnonFormList} from "../forms";

export type FormValidationData = { path: string[], message: string };

//<editor-fold desc="Value to Controls">

type NullableFormListControls<T> = NonNullable<T> extends string ? FormNode<T[]|undefined> :
  NonNullable<T> extends number ? FormNode<T[]|undefined> :
    NonNullable<T> extends Record<string, unknown> ? ModelFormList<NonNullable<T>, true> :
      FormNode<T[]|undefined>;

type NonNullFormListControls<T> = NonNullable<T> extends string ? FormNode<T[]> :
  NonNullable<T> extends number ? FormNode<T[]> :
    NonNullable<T> extends Record<string, unknown> ? ModelFormList<NonNullable<T>> :
      FormNode<T[]>;

type NullableFormControls<T> = T extends string ? FormNode<string | undefined>
    : T extends boolean ? FormNode<boolean | undefined>
      : T extends File | Date ? FormNode<T | undefined>
        : T extends (infer A)[] ? NullableFormListControls<A>
          : T extends Record<string, unknown> ? ModelFormLayer<T|undefined>
            : FormNode<T | undefined>;

type NonNullFormControls<T> = T extends string ? FormNode<string>
    : T extends boolean ? FormNode<boolean>
      : T extends File | Date ? FormNode<Date>
        : T extends (infer A)[] ? NonNullFormListControls<A>
          : T extends Record<string, unknown> ? ModelFormLayer<T>
            : FormNode<T>;

export type FormControls<T> = undefined extends T ? NullableFormControls<NonNullable<T>> : NonNullFormControls<NonNullable<T>>;

export type FormGroupControls<T extends Record<string, unknown>> = { [K in keyof T]-?: FormControls<T[K]> };
//</editor-fold>

export type TemplateListUnion<T extends TemplateGroupUnion> = [T];
export type TemplateGroupUnion = Record<string, TemplateUnion>;
export type TemplateUnion = AnonFormNode | FormNodeConfig<any>
  | Record<string, any> | AnonFormLayer
  | [ Record<string, any> ] | AnonFormList;

//<editor-fold desc="Value to Template">

type NullableFormListTemplate<A> = NonNullable<A> extends string ? FormNode<A[]|undefined> | FormNodeConfig<A[]|undefined> :
  NonNullable<A> extends number ? FormNode<A[]|undefined> | FormNodeConfig<A[]|undefined> :
    NonNullable<A> extends Record<string, unknown> ? [FormGroupTemplate<NonNullable<A>>] | ModelFormList<NonNullable<A>, true> :
      FormNode<A[]|undefined> | FormNodeConfig<A[]|undefined>;

type NonNullFormListTemplate<A> = NonNullable<A> extends string ? FormNode<A[]> | FormNodeConfig<A[]> :
  NonNullable<A> extends number ? FormNode<A[]> | FormNodeConfig<A[]> :
    NonNullable<A> extends Record<string, unknown> ? [FormGroupTemplate<NonNullable<A>>] | ModelFormList<NonNullable<A>> :
      FormNode<A[]> | FormNodeConfig<A[]>;

type NullableFormTemplate<T> = T extends undefined | null ? never
  : T extends string ? FormNode<string | undefined> | FormNodeConfig<string | undefined>
    : T extends boolean ? FormNode<boolean | undefined> | FormNodeConfig<boolean | undefined>
      : T extends File | Date ? FormNode<T | undefined> | FormNodeConfig<T | undefined>
        : T extends (infer A)[] ? NullableFormListTemplate<A>
          : T extends Record<string, unknown> ? FormGroupTemplate<T> | ModelFormLayer<T|undefined>
            : FormNode<T | undefined> | FormNodeConfig<T | undefined>;

type NonNullFormTemplate<T> = T extends undefined | null ? never
  : T extends string ? FormNode<string> | FormNodeConfig<string>
    : T extends boolean ? FormNode<boolean> | FormNodeConfig<boolean>
      : T extends File | Date ? FormNode<T> | FormNodeConfig<T>
        : T extends (infer A)[] ? NonNullFormListTemplate<A>
          : T extends Record<string, unknown> ? FormGroupTemplate<T> | ModelFormLayer<T>
            : FormNode<T> | FormNodeConfig<T>;

export type FormTemplate<T> = undefined extends T ? NullableFormTemplate<T> : NonNullFormTemplate<T>;

export type FormGroupTemplate<T extends Record<string, unknown>> = { [K in keyof T]-?: FormTemplate<T[K]> };
//</editor-fold>

//<editor-fold desc="Controls to Value">
export type FormValue<T extends FormUnit> =
  T extends FormList<Record<string, FormUnit>, infer X, true> ? X[] | undefined
    : T extends FormList<Record<string, FormUnit>, infer X, false> ? X[]
      : T extends FormLayer<Record<string, FormUnit>, infer X> ? X
        : T extends FormNode<infer X> ? X
          : never;

export type FormGroupValue<T extends Record<string, FormUnit>> = { [K in keyof T]?: FormValue<T[K]> };
//</editor-fold>

//<editor-fold desc="Template to Value">

export type FormTemplateValue<T extends TemplateUnion> =
  T extends FormList<Record<string, FormUnit>, infer X, true> ? X[] | undefined :
    T extends FormList<Record<string, FormUnit>, infer X, false> ? X[] :
      T extends FormLayer<Record<string, FormUnit>, infer X> ? X[] :
        T extends TemplateListUnion<infer X> ? FormGroupTemplateValue<X>[] :
          T extends TemplateGroupUnion ? FormGroupTemplateValue<T> :
            T extends FormNode<infer X> ? X :
              T extends FormNodeConfig<infer X> ? X :
                T extends TemplateGroupUnion ? FormGroupTemplateValue<T> :
                  never;

export type FormGroupTemplateValue<T extends TemplateGroupUnion> = { [K in keyof T]: FormTemplateValue<T[K]> };

//</editor-fold>

//<editor-fold desc="Config Values">
export type AutoComplete =
  'on'
  | 'off'

  | 'name'
  | 'honorific-prefix'
  | 'given-name'
  | 'additional-name'
  | 'family-name'
  | 'honorific-suffix'
  | 'nickname'
  | 'username'

  | 'new-password'
  | 'current-password'
  | 'one-time-code'
  | 'organization-title'
  | 'organization'

  | 'street-address'
  | 'country'
  | 'country-name'
  | 'postal-code'

  | 'transaction-currency'
  | 'transaction-amount'
  | 'language'

  | 'bday'
  | 'bday-day'
  | 'bday-month'
  | 'bday-year'
  | 'sex'

  | 'url'
  | 'photo'

  | 'tel'
  | 'tel-country-code'
  | 'tel-national'
  | 'tel-area-code'
  | 'tel-local'
  | 'tel-local-prefix'
  | 'tel-local-suffix'
  | 'tel-extension'
  | 'email'
  | 'impp'
  | string;

//</editor-fold>

//<editor-fold desc="Guide Templates">
type TemplateItemGuide<T> =
  T extends undefined ? never
    : T extends FormNode<infer A> ? FormNode<A | any>
      : T extends FormNodeConfig<infer A> ? FormNodeConfig<A | any>
        : T extends [infer A extends Record<string, any>] ? [TemplateGroupGuide<A>]
          : T extends Record<string, any> ? TemplateGroupGuide<T>
            : T;

type TemplateGroupGuide<T extends Record<string, any>> = { [K in keyof T]?: TemplateItemGuide<T[K]> } & FormGroupTemplate<any>;

export type TemplateGuide<T extends Record<string, any>> = TemplateGroupGuide<FormGroupTemplate<T>>;
//</editor-fold>

//<editor-fold desc="Partial Templates">
type PartialTemplateItem<T extends TemplateUnion> =
  T extends undefined ? never
    : T extends FormNode<infer A> ? FormNode<A>|FormNode<A|undefined>
      : T extends FormNodeConfig<infer A> ? FormNodeConfig<A>|FormNodeConfig<A|undefined>
        : T extends TemplateListUnion<infer A> ? [PartialTemplateGroup<A>, number?]
          : T extends TemplateGroupUnion ? PartialTemplateGroup<T>
            : never;

type PartialTemplateGroup<T extends TemplateGroupUnion> = { [K in keyof T]?: PartialTemplateItem<T[K]> };

export type PartialTemplate<T extends Record<string, any>> = PartialTemplateGroup<FormGroupTemplate<T>>;
//</editor-fold>
