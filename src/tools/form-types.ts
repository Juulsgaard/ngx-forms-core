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

type FormListTemplate<A> = A extends Record<string, any> ? [FormGroupTemplate<A>, number?] : FormNode<NonNullable<A>[]> | FormNodeConfig<NonNullable<A>[]>;

export type FormTemplate<T> =
  NonNullable<T> extends Date | File | string ? FormNode<T> | FormNode<NonNullable<T>> | FormNodeConfig<T> | FormNodeConfig<NonNullable<T>> :
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

//<editor-fold desc="Template to Value">

export type FormTemplateValue<T extends FormTemplate<any>> =
  T extends [infer X extends FormGroupTemplate<any>, number?] ? FormGroupTemplateValue<X>[] :
    T extends FormGroupTemplate<any> ? FormGroupTemplateValue<T> :
      T extends FormNode<infer X> ? X :
        T extends FormNodeConfig<infer X> ? X :
          never;

export type FormGroupTemplateValue<T extends FormGroupTemplate<any>> = { [K in keyof T]: FormTemplateValue<T[K]> };

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
