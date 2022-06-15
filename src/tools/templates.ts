import {FormControls, FormGroupControls, FormGroupTemplate, FormTemplate} from "./form-types";
import {isObject} from "@consensus-labs/ts-tools";
import {isFormNode} from "./type-predicates";
import {FormLayerConstructors} from "../models/form-layer";
import {FormListConstructors} from "../models/form-list";

export function formTemplateToControls<TValue extends Record<string, any>>(template: FormGroupTemplate<TValue>): FormGroupControls<TValue> {

  const result = {} as FormGroupControls<TValue>;

  for (let key in template) {
    const sub = template[key] as FormTemplate<TValue[keyof TValue]>;
    if (!sub) continue;
    result[key] = templateToControl(sub) as FormControls<TValue[Extract<keyof TValue, string>]>;
  }

  return result;
}

function templateToControl<TValue>(template: FormTemplate<TValue>): FormControls<TValue> {
  if (isFormNode(template)) return template as unknown as FormControls<TValue>;

  if (Array.isArray(template)) {
    const subTemplate = template[0] as FormGroupTemplate<any>;
    return FormListConstructors.Model(formTemplateToControls(subTemplate)) as unknown as FormControls<TValue>;
  }

  if (isObject(template)) {
    return FormLayerConstructors.Model<TValue>(formTemplateToControls(template as FormGroupTemplate<TValue>)) as FormControls<TValue>;
  }

  return template as FormControls<TValue>;
}
