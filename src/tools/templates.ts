import {isObject, SimpleObject} from "@juulsgaard/ts-tools";
import {isFormLayer, isFormList, isFormNode} from "./type-predicates";
import {formList} from "../constructors/form-list-constructors";
import {formLayer} from "../constructors/form-layer-constructors";
import {FormControls, FormGroupControls} from "../types/controls";
import {FormGroupTemplate, FormGroupTemplateValue, TemplateLayerPrimitive, TemplateUnion} from "../types/templates";
import {FormLayerConfig, FormListConfig, FormNodeConfig, FormUnit} from "../forms";

export function formTemplateToControls<TValue extends SimpleObject>(
  template: FormGroupTemplate<TValue>
): FormGroupControls<TValue> {
  return templateLayerToControls<TValue>(template);
}

export function formTemplateToValueControls<TTemplate extends TemplateLayerPrimitive>(template: TTemplate): FormGroupControls<FormGroupTemplateValue<TTemplate>> {
  return formTemplateToControls(templateUnionToTemplate(template));
}

/**
 * Method to enforce that FormGroupTemplate is the inverse of FormGroupTemplateValue
 * @param union
 */
function templateUnionToTemplate<T extends TemplateLayerPrimitive>(union: T): FormGroupTemplate<FormGroupTemplateValue<T>> {
  return union as unknown as FormGroupTemplate<FormGroupTemplateValue<T>>;
}

function templateLayerToControls<T extends SimpleObject>(template: TemplateLayerPrimitive): FormGroupControls<T> {
  const result = {} as Record<string, FormUnit>;

  for (let key in template) {
    const sub = template[key];
    if (!sub) continue;
    const unit = templateToControl(sub);
    if (!unit) continue;
    result[key] = unit;
  }

  return result as FormGroupControls<T>;
}

function templateToControl<TValue>(template: TemplateUnion): FormControls<TValue>|undefined {

  if (template instanceof FormNodeConfig) return template.done() as FormControls<TValue>;
  if (isFormNode(template)) return template as FormControls<TValue>;

  if (template instanceof FormLayerConfig) return template.done() as FormControls<TValue>;
  if (isFormLayer(template)) return template as FormControls<TValue>;

  if (template instanceof FormListConfig) return template.done() as FormControls<TValue>;
  if (isFormList(template)) return template as unknown as FormControls<TValue>;

  if (Array.isArray(template)) {
    const tmp = template as [TemplateLayerPrimitive];
    const subTemplate = tmp[0];
    return formList.controls(templateLayerToControls(subTemplate)) as FormControls<TValue>;
  }

  if (isObject(template)) {
    return formLayer.model(templateLayerToControls(template)) as FormControls<TValue>;
  }

  return undefined;
}
