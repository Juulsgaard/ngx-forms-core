import {
  FormLayer, FormLayerConfig, FormList, FormListConfig, FormNode, FormNodeConfig, ModelFormLayer, ModelFormList
} from "../forms";
import {FormGroupTemplate, TemplateLayerPrimitive, TemplateListPrimitive, TemplateUnion} from "./templates";
import {SimpleObject} from "@juulsgaard/ts-tools";

//<editor-fold desc="Guide Templates">
type FormTemplateItemAsGuide<T> =
  T extends undefined ? never
    : T extends FormList<any, infer A, boolean> ? ModelFormList<A | any, boolean>
      : T extends FormListConfig<infer A, boolean> ? FormListConfig<A | any, boolean>
        : T extends FormLayer<any, infer A> ? ModelFormLayer<A | any>
          : T extends FormLayerConfig<infer A> ? FormLayerConfig<A | any>
            : T extends FormNode<infer A> ? FormNode<A | any>
              : T extends FormNodeConfig<infer A> ? FormNodeConfig<A | any>
                : T extends TemplateListPrimitive<infer A> ? [FormTemplateGroupAsGuide<A>]
                  : T extends TemplateLayerPrimitive ? FormTemplateGroupAsGuide<T>
                    : T;

export type FormTemplateGroupAsGuide<T extends TemplateLayerPrimitive> = { [K in keyof T]?: FormTemplateItemAsGuide<T[K]> } & Record<string, TemplateUnion>;

export type FormTemplateGuide<T extends SimpleObject> = FormTemplateGroupAsGuide<FormGroupTemplate<T>>;

//</editor-fold>

//<editor-fold desc="Partial Templates">
type FormTemplateItemAsPartial<T extends TemplateUnion> =
  T extends undefined ? never
    : T extends FormList<any, infer A, infer N> ? ModelFormList<A, N> | ModelFormList<A, true>
      : T extends FormListConfig<infer A, infer N> ? FormListConfig<A, N> | FormListConfig<A, true>
        : T extends FormLayer<any, infer A> ? ModelFormLayer<A> | ModelFormLayer<A | undefined>
          : T extends FormLayerConfig<infer A> ? FormLayerConfig<A> | FormLayerConfig<A | undefined>
            : T extends FormNode<infer A> ? FormNode<A> | FormNode<A | undefined>
              : T extends FormNodeConfig<infer A> ? FormNodeConfig<A> | FormNodeConfig<A | undefined>
                : T extends TemplateListPrimitive<infer A> ? [FormTemplateGroupAsPartial<A>]
                  : T extends TemplateLayerPrimitive ? FormTemplateGroupAsPartial<T>
                    : T;

export type FormTemplateGroupAsPartial<T extends TemplateLayerPrimitive> = { [K in keyof T]?: FormTemplateItemAsPartial<T[K]> };

export type PartialFormTemplate<T extends SimpleObject> = FormTemplateGroupAsPartial<FormGroupTemplate<T>>;
//</editor-fold>
