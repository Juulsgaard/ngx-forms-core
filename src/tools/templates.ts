import {
  FormControls, FormGroupControls, FormGroupTemplate, FormGroupTemplateValue, FormTemplate, TemplateGroupUnion
} from "./form-types";
import {isObject} from "@juulsgaard/ts-tools";
import {isFormLayer, isFormList, isFormNode, isFormNodeConfig} from "./type-predicates";
import {FormNode} from "../forms/form-node";
import {FormListConstructors} from "../constructors/form-list-constructors";
import {formLayer} from "../constructors/form-layer-constructors";

export function formTemplateToControls<TValue extends Record<string, any>>(template: FormGroupTemplate<TValue>): FormGroupControls<TValue> {

  const result = {} as FormGroupControls<TValue>;

  for (let key in template) {
    const sub = template[key] as FormTemplate<TValue[Extract<keyof TValue, string>]>;
    if (!sub) continue;
    result[key] = templateToControl(sub as TValue[Extract<keyof TValue, string>]) as FormControls<TValue[Extract<keyof TValue, string>]>;
  }

  return result;
}

export function formTemplateToValueControls<TTemplate extends TemplateGroupUnion>(template: TTemplate): FormGroupControls<FormGroupTemplateValue<TTemplate>> {
  return formTemplateToControls(templateUnionToTemplate(template));
}

/**
 * Method to enforce that FormGroupTemplate is the inverse of FormGroupTemplateValue
 * @param union
 */
function templateUnionToTemplate<T extends TemplateGroupUnion>(union: T): FormGroupTemplate<FormGroupTemplateValue<T>> {
  return union as unknown as FormGroupTemplate<FormGroupTemplateValue<T>>;
}

function templateToControl<TValue>(template: FormTemplate<TValue>): FormControls<TValue> {

  if (isFormNodeConfig(template)) return template.done() as FormControls<TValue>;
  if (isFormNode(template)) return template as FormNode<TValue> as FormControls<TValue>;
  if (isFormLayer(template)) return template as unknown as FormControls<TValue>;
  if (isFormList(template)) return template as unknown as FormControls<TValue>;

  if (Array.isArray(template)) {
    const tmp = template as [FormGroupTemplate<any>, number?];
    const subTemplate = tmp[0];
    return FormListConstructors.Model(formTemplateToControls(subTemplate), false) as unknown as FormControls<TValue>;
  }

  if (isObject(template)) {
    return formLayer().model(formTemplateToControls(template as FormGroupTemplate<any>)) as unknown as FormControls<TValue>;
  }

  return template as FormControls<TValue>;
}
