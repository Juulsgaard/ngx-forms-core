import {
  AnonFormLayer, AnonFormList, AnonFormNode, FormLayer, FormLayerConfig, FormList, FormListConfig, FormNode,
  FormNodeConfig, ModelFormLayer, ModelFormList
} from "../forms";
import {SimpleObject} from "@juulsgaard/ts-tools";

export type TemplateListPrimitive<T extends TemplateLayerPrimitive> = [T];
export type TemplateNullableListUnion<T extends SimpleObject> = FormList<any, T, true> | FormListConfig<T, true>;
export type TemplateNonNullListUnion<T extends SimpleObject> = FormList<any, T, false> | FormListConfig<T, false>;

export type TemplateLayerPrimitive = Record<string, TemplateUnion>;
export type TemplateLayerUnion<T extends SimpleObject> = FormLayer<any, T> | FormLayerConfig<T>;

export type TemplateUnion = AnonFormNode | FormNodeConfig<any>
  | SimpleObject | AnonFormLayer | FormLayerConfig<any>
  | [SimpleObject] | AnonFormList | FormListConfig<any, boolean>;

//<editor-fold desc="Value to Template">
type NullableFormListTemplate<A> =
  NonNullable<A> extends string ? FormNode<A[] | undefined> | FormNodeConfig<A[] | undefined>
    : NonNullable<A> extends number ? FormNode<A[] | undefined> | FormNodeConfig<A[] | undefined>
      : NonNullable<A> extends SimpleObject ?
        [FormGroupTemplate<NonNullable<A>>]
        | ModelFormList<NonNullable<A>, true>
        | FormListConfig<NonNullable<A>, true>
        : FormNode<A[] | undefined> | FormNodeConfig<A[] | undefined>;

type NonNullFormListTemplate<A> =
  NonNullable<A> extends string ? FormNode<A[]> | FormNodeConfig<A[]>
    : NonNullable<A> extends number ? FormNode<A[]> | FormNodeConfig<A[]>
      : NonNullable<A> extends SimpleObject ?
        [FormGroupTemplate<NonNullable<A>>]
        | ModelFormList<NonNullable<A>>
        | FormListConfig<NonNullable<A>, false>
        : FormNode<A[]> | FormNodeConfig<A[]>;

type NullableFormTemplate<T> = T extends undefined | null ? never
  : T extends string ? FormNode<string | undefined> | FormNodeConfig<string | undefined>
    : T extends boolean ? FormNode<boolean | undefined> | FormNodeConfig<boolean | undefined>
      : T extends File | Date ? FormNode<T | undefined> | FormNodeConfig<T | undefined>
        : T extends (infer A)[] ? NullableFormListTemplate<A>
          : T extends SimpleObject ? FormGroupTemplate<T> | ModelFormLayer<T | undefined> | FormLayerConfig<T | undefined>
            : FormNode<T | undefined> | FormNodeConfig<T | undefined>;

type NonNullFormTemplate<T> = T extends undefined | null ? never
  : T extends string ? FormNode<string> | FormNodeConfig<string>
    : T extends boolean ? FormNode<boolean> | FormNodeConfig<boolean>
      : T extends File | Date ? FormNode<T> | FormNodeConfig<T>
        : T extends (infer A)[] ? NonNullFormListTemplate<A>
          : T extends SimpleObject ? FormGroupTemplate<T> | ModelFormLayer<T> | FormLayerConfig<T>
            : FormNode<T> | FormNodeConfig<T>;

export type FormTemplate<T> = undefined extends T ? NullableFormTemplate<T> : NonNullFormTemplate<T>;
export type FormGroupTemplate<T extends SimpleObject> = { [K in keyof T]-?: FormTemplate<T[K]> };

//</editor-fold>

//<editor-fold desc="Template to Value">

export type FormTemplateValue<T extends TemplateUnion> =

// Controls
  T extends TemplateNullableListUnion<infer X> ? X[] | undefined :
    T extends TemplateNonNullListUnion<infer X> ? X[] :
      T extends TemplateLayerUnion<infer X> ? X[] :

        // Nodes
        T extends FormNode<infer X> ? X :
          T extends FormNodeConfig<infer X> ? X :

            // Template primitives
            T extends TemplateListPrimitive<infer X> ? FormGroupTemplateValue<X>[] :
              T extends TemplateLayerPrimitive ? FormGroupTemplateValue<T> :

                never;

export type FormGroupTemplateValue<T extends TemplateLayerPrimitive> = { [K in keyof T]: FormTemplateValue<T[K]> };
//</editor-fold>
