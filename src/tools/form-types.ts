import {AnyControlFormList, ControlFormList, FormList, ModelFormList} from "../forms/form-list";
import {AnyControlFormLayer, ControlFormLayer, FormLayer, ModelFormLayer} from "../forms/form-layer";
import {AnonFormNode, FormNode, FormNodeConfig} from "../forms/form-node";
import {AbstractControl} from "@angular/forms";
import {DeepPartial} from "@consensus-labs/ts-tools";

export type FormError = { path: string[], error: string };

export type SmartFormUnion = FormNode<any> | FormLayer<any, any, any> | FormList<any, any, any>;

//<editor-fold desc="Value to Controls">

type FormListControls<A> = NonNullable<A> extends Record<string, any> ? ModelFormList<NonNullable<A>> : FormNode<A[]>;

type NullableFormControls<T> = T extends undefined | null ? never
  : T extends string ? FormNode<string | undefined>
    : T extends boolean ? FormNode<boolean | undefined>
      : T extends File | Date ? FormNode<T | undefined>
        : T extends (infer A)[] ? FormListControls<A>
          : T extends Record<string, any> ? ModelFormLayer<T>
            : FormNode<T | undefined>;

type NonNullFormControls<T> = T extends undefined | null ? never
  : T extends string ? FormNode<string>
    : T extends boolean ? FormNode<boolean>
      : T extends File | string | Date ? FormNode<T>
        : T extends (infer A)[] ? FormListControls<A>
          : T extends Record<string, any> ? ModelFormLayer<T>
            : FormNode<T>;

export type FormControls<T> = undefined extends T ? NullableFormControls<T> : NonNullFormControls<T>;

export type FormGroupControls<T extends Record<string, any>> = { [K in keyof T]-?: FormControls<T[K]> };
//</editor-fold>

//<editor-fold desc="Value to Template">

type FormListTemplate<A> = NonNullable<A> extends Record<string, any>
  ? [FormGroupTemplate<NonNullable<A>>, number?]
  : FormNode<A[]> | FormNodeConfig<A[]>;

type NullableFormTemplate<T> = T extends undefined | null ? never
  : T extends string ? FormNode<string | undefined> | FormNodeConfig<string | undefined>
    : T extends boolean ? FormNode<boolean | undefined> | FormNodeConfig<boolean | undefined>
      : T extends File | Date ? FormNode<T | undefined> | FormNodeConfig<T | undefined>
        : T extends (infer A)[] ? FormListTemplate<A>
          : T extends Record<string, any> ? FormGroupTemplate<T>
            : FormNode<T | undefined> | FormNodeConfig<T | undefined>;

type NonNullFormTemplate<T> = T extends undefined | null ? never
  : T extends string ? FormNode<string> | FormNodeConfig<string>
    : T extends boolean ? FormNode<boolean> | FormNodeConfig<boolean>
      : T extends File | Date ? FormNode<T> | FormNodeConfig<T>
        : T extends (infer A)[] ? FormListTemplate<A>
          : T extends Record<string, any> ? FormGroupTemplate<T>
            : FormNode<T> | FormNodeConfig<T>;

export type FormTemplate<T> = undefined extends T ? NullableFormTemplate<T> : NonNullFormTemplate<T>;

export type FormGroupTemplate<T extends Record<string, any>> = { [K in keyof T]-?: FormTemplate<T[K]> };

export type TemplateListUnion<T extends TemplateGroupUnion> = [T, number?];
export type TemplateGroupUnion = Record<string, TemplateUnion>;
export type TemplateUnion = AnonFormNode|FormNodeConfig<any>|Record<string, any>|[Record<string, any>, number?];

//</editor-fold>

//<editor-fold desc="Controls to Value">
export type FormValue<T extends AbstractControl> =
  T extends ControlFormList<infer X> ? FormGroupValue<X>[]
  : T extends ControlFormLayer<infer X> ? FormGroupValue<X>
    : T extends FormNode<infer X> ? X
      : never;

export type FormValueRaw<T extends AbstractControl> =
  T extends ControlFormList<infer X> ? FormGroupValueRaw<X>[]
  : T extends ControlFormLayer<infer X> ? FormGroupValueRaw<X>
    : T extends FormNode<infer X> ? X
      : never;

export type FormGroupValue<T extends Record<string, AbstractControl>> = { [K in keyof T]?: FormValue<T[K]> };
export type FormGroupValueRaw<T extends Record<string, AbstractControl>> = { [K in keyof T]: FormValueRaw<T[K]> };
//</editor-fold>

//<editor-fold desc="Template to Value">

export type FormTemplateValue<T extends TemplateUnion> =
  T extends TemplateListUnion<infer X> ? FormGroupTemplateValue<X>[] :
    T extends TemplateGroupUnion ? FormGroupTemplateValue<T> :
      T extends FormNode<infer X> ? X :
        T extends FormNodeConfig<infer X> ? X :
          never;

export type FormGroupTemplateValue<T extends Record<string, TemplateUnion>> = { [K in keyof T]: FormTemplateValue<T[K]> };

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

//<editor-fold desc="Partial Controls">
type PartialControl<T> =
  NonNullable<T> extends AnyControlFormList<infer A> ? ModelFormList<DeepPartial<A>> :
    NonNullable<T> extends AnyControlFormLayer<infer A> ? ModelFormLayer<DeepPartial<A>> :
      T;

type PartialControlGroup<T extends Record<string, FormControls<any>>> = {[K in keyof T]?: PartialControl<T[K]>};

export type PartialControls<T extends Record<string, any>> = PartialControlGroup<FormGroupControls<T>>;
//</editor-fold>

//<editor-fold desc="Guide Templates">
type TemplateItemGuide<T> =
  T extends undefined ? never
    : T extends FormNode<infer A> ? FormNode<A | any>
      : T extends FormNodeConfig<infer A> ? FormNodeConfig<A | any>
        : T extends [infer A extends Record<string, any>, ...(infer B)] ? [TemplateGroupGuide<A>, ...B]
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

interface Test {
  str: string;
  optional?: string;
  nullable: string|undefined;
  both?: string|undefined;
}

type x = PartialControls<Test>;
type y = x['both'];

type z = Partial<never>;
