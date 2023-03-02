import {FormControls, FormGroupControls, FormGroupTemplate, FormGroupTemplateValue, FormTemplate} from "./form-types";
import {isObject} from "@consensus-labs/ts-tools";
import {isFormNode, isFormNodeConfig} from "./type-predicates";
import {FormLayerConstructors} from "../forms/form-layer";
import {FormListConstructors} from "../forms/form-list";
import {FormNode} from "../forms/form-node";

export function formTemplateToControls<TValue extends Record<string, any>>(template: FormGroupTemplate<TValue>): FormGroupControls<TValue> {

  const result = {} as FormGroupControls<TValue>;

  for (let key in template) {
    const sub = template[key] as FormTemplate<TValue[Extract<keyof TValue, string>]>;
    if (!sub) continue;
    result[key] = templateToControl(sub as TValue[Extract<keyof TValue, string>]) as FormControls<TValue[Extract<keyof TValue, string>]>;
  }

  return result;
}

export function formTemplateToValueControls<TTemplate extends FormGroupTemplate<any>>(template: TTemplate): FormGroupControls<FormGroupTemplateValue<TTemplate>> {
  return formTemplateToControls(template) as FormGroupControls<FormGroupTemplateValue<TTemplate>>;
}

function templateToControl<TValue>(template: FormTemplate<TValue>): FormControls<TValue> {

  if (isFormNodeConfig(template)) return template.done() as FormControls<TValue>;
  if (isFormNode(template)) return template as FormNode<TValue> as FormControls<TValue>;

  if (Array.isArray(template)) {
    const tmp = template as [FormGroupTemplate<any>, number?];
    const subTemplate = tmp[0];
    const length = tmp[1];
    return FormListConstructors.Model(formTemplateToControls(subTemplate), length) as unknown as FormControls<TValue>;
  }

  if (isObject(template)) {
    return FormLayerConstructors.Model(formTemplateToControls(template as FormGroupTemplate<any>)) as FormControls<TValue>;
  }

  return template as FormControls<TValue>;
}
