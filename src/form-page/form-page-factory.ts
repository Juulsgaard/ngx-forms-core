import {SimpleObject} from "@consensus-labs/ts-tools";
import {
  FormGroupControls, FormGroupTemplate, FormGroupTemplateValue, PartialTemplate, TemplateGuide
} from "../tools/form-types";
import {formTemplateToControls, formTemplateToValueControls} from "../tools/templates";
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
  withForm(template: FormGroupTemplate<TGuide>): FormPageConfig<TGuide> {
    return new FormPageConfig<TGuide>(
      this.type,
      formTemplateToControls(template)
    );
  }

  /**
   * Define the page form using subset of the guide template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  withPartialForm<TTemplate extends FormGroupTemplate<any>>(
    template: TTemplate & PartialTemplate<TGuide>
  ): FormPageConfig<FormGroupTemplateValue<Extract<TTemplate, TGuide>>> {
    return new FormPageConfig<FormGroupTemplateValue<Extract<TTemplate, TGuide>>>(
      this.type,
      formTemplateToValueControls(template)
    );
  }

  /**
   * Define the page form using a loose template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  withAltForm<TTemplate extends FormGroupTemplate<any>>(
    template: TTemplate & TemplateGuide<TGuide>
  ): FormPageConfig<FormGroupTemplateValue<TTemplate>> {
    return new FormPageConfig<FormGroupTemplateValue<TTemplate>>(
      this.type,
      formTemplateToValueControls(template)
    );
  }

  /**
   * Define the form controls for the Page strictly based on the type
   * @param controls - The controls
   */
  withControls(controls: FormGroupControls<TGuide>): FormPageConfig<TGuide> {
    return new FormPageConfig<TGuide>(
      this.type,
      controls
    );
  }
}
