import {DeepPartial, SimpleObject} from "@consensus-labs/ts-tools";
import {FormGroupControls, FormGroupTemplate, FormGroupTemplateValue, FormGroupValueRaw} from "../tools/form-types";
import {formTemplateToControls} from "../tools/templates";
import {FormPageConfig} from "./form-page-config";

export class FormPageFactory<TGuide extends SimpleObject> {

  constructor(private type: 'create' | 'update') {

  }

  /**
   * Define the page form using a strict template
   * @param template - The template
   */
  withTemplate(template: FormGroupTemplate<TGuide>): FormPageConfig<TGuide> {
    return new FormPageConfig(this.type, formTemplateToControls(template));
  }

  /**
   * Define the page form using a strict template with keys omitted
   * @param template - The template
   */
  withModifiedTemplate<TOmit extends keyof TGuide>(template: FormGroupTemplate<Omit<TGuide, TOmit>>): FormPageConfig<Omit<TGuide, TOmit>> {
    return new FormPageConfig(this.type, formTemplateToControls(template));
  }

  /**
   * Define the page form using a strict template
   * @param template - The template
   */
  withForm(template: FormGroupTemplate<TGuide>): FormPageConfig<TGuide>;
  /**
   * Define the page form using a loose template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  withForm<TTemplate extends FormGroupTemplate<DeepPartial<TGuide>>>(template: TTemplate): FormPageConfig<FormGroupTemplateValue<TTemplate>>;
  withForm<T extends Record<string, any>>(template: FormGroupTemplate<T>): FormPageConfig<T> {
    return new FormPageConfig<T>(
      this.type,
      formTemplateToControls(template)
    );
  }

  /**
   * Define the form controls for the Dialog strictly based on the type
   * @param controls - The controls
   */
  withControls(controls: FormGroupControls<TGuide>): FormPageConfig<TGuide>;
  /**
   * Define the form controls for the Dialog loosely based on the type.
   * This sacrifices type conciseness for flexibility.
   * @param controls - The controls
   */
  withControls<TControls extends FormGroupControls<DeepPartial<TGuide>>>(controls: TControls): FormPageConfig<FormGroupValueRaw<TControls>>;
  withControls<T extends Record<string, any>>(controls: FormGroupControls<T>): FormPageConfig<T> {
    return new FormPageConfig<T>(
      this.type,
      controls
    );
  }
}
