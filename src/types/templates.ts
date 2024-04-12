import {
  AnonFormLayer, AnonFormList, AnonFormNode, FormLayer, FormList, FormNode, ModelFormLayer, ModelFormList
} from "../forms";
import {SimpleObject} from "@juulsgaard/ts-tools";
import {BaseFormNodeConfig} from "../forms/form-node-config";
import {BaseFormLayerConfig} from "../forms/form-layer-config";
import {BaseFormListConfig} from "../forms/form-list-config";
import {FormObjectTypes} from "./misc";

export type TemplateListPrimitive<T extends TemplateLayerPrimitive> = [T];
export type TemplateNullableListUnion<T extends SimpleObject> = FormList<any, T, true> | BaseFormListConfig<T, true>;
export type TemplateNonNullListUnion<T extends SimpleObject> = FormList<any, T, false> | BaseFormListConfig<T, false>;

export type TemplateLayerPrimitive = Record<string, TemplateUnion>;
export type TemplateLayerUnion<T extends SimpleObject> = FormLayer<any, T> | BaseFormLayerConfig<T>;

export type TemplateUnion = AnonFormNode | BaseFormNodeConfig<any>
  | SimpleObject | AnonFormLayer | BaseFormLayerConfig<any>
  | [SimpleObject] | AnonFormList | BaseFormListConfig<any, boolean>;

//<editor-fold desc="Value to Template">

type NullableFormListTemplate<T extends SimpleObject|undefined> =
  | [FormGroupTemplate<NonNullable<T>>]
  | ModelFormList<T, true>
  | BaseFormListConfig<T, true>;

type NonNullFormListTemplate<T extends SimpleObject|undefined> =
  | [FormGroupTemplate<NonNullable<T>>]
  | ModelFormList<T>
  | BaseFormListConfig<T, false>;

type NullableFormLayerTemplate<T extends SimpleObject> =
  | FormGroupTemplate<T>
  | ModelFormLayer<T|undefined>
  | BaseFormLayerConfig<T|undefined>;

type NonNullFormLayerTemplate<T extends SimpleObject> =
  | FormGroupTemplate<T>
  | ModelFormLayer<T>
  | BaseFormLayerConfig<T>;

type NullableFormNodeTemplate<T> =
  | FormNode<T|undefined>
  | BaseFormNodeConfig<T|undefined>;

type NonNullFormNodeTemplate<T> =
  | FormNode<T>
  | BaseFormNodeConfig<T>;

type NullableFormTemplate<T> =
  NonNullable<T> extends FormObjectTypes ? NullableFormNodeTemplate<NonNullable<T>>
    : NonNullable<T> extends (infer A extends SimpleObject|undefined)[] ? NullableFormListTemplate<A>
      : NonNullable<T> extends SimpleObject ? NullableFormLayerTemplate<NonNullable<T>>
        : NullableFormNodeTemplate<NonNullable<T>>;

type NonNullFormTemplate<T> =
  NonNullable<T> extends FormObjectTypes ? NonNullFormNodeTemplate<NonNullable<T>>
    : NonNullable<T> extends (infer A extends SimpleObject|undefined)[] ? NonNullFormListTemplate<A>
      : NonNullable<T> extends SimpleObject ? NonNullFormLayerTemplate<NonNullable<T>>
        : NonNullFormNodeTemplate<NonNullable<T>>;

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
          T extends BaseFormNodeConfig<infer X> ? X :

            // Template primitives
            T extends TemplateListPrimitive<infer X> ? FormGroupTemplateValue<X>[] :
              T extends TemplateLayerPrimitive ? FormGroupTemplateValue<T> :

                never;

export type FormGroupTemplateValue<T extends TemplateLayerPrimitive> = { [K in keyof T]: FormTemplateValue<T[K]> };

//</editor-fold>
