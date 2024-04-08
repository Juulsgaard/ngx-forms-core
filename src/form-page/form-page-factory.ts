import {Constrain, SimpleObject} from "@juulsgaard/ts-tools";
import {formTemplateToControls, formTemplateToValueControls} from "../tools/templates";
import {FormPageConfig} from "./form-page-config";
import {
  FormGroupControls, FormGroupTemplate, FormGroupTemplateValue, FormTemplateGuide, PartialFormTemplate
} from "../types";
import {TemplateLayerPrimitive} from "../types/templates";

export class FormPageFactory<TGuide extends SimpleObject> {

  constructor(private type: 'create' | 'update') {

  }

  /**
   * Define the page form using a strict template with keys omitted
   * @param template - The template
   */
  withOmitted<TOmit extends keyof TGuide>(template: FormGroupTemplate<Omit<TGuide, TOmit>>): FormPageConfig<Omit<TGuide, TOmit>> {
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
  withPartialForm<TTemplate extends TemplateLayerPrimitive>(
    template: TTemplate & PartialFormTemplate<TGuide>
  ): FormPageConfig<FormGroupTemplateValue<Constrain<TTemplate, TGuide>>> {
    return new FormPageConfig<FormGroupTemplateValue<Constrain<TTemplate, TGuide>>>(
      this.type,
      formTemplateToValueControls<Constrain<TTemplate, TGuide>>(template)
    );
  }

  /**
   * Define the page form using a loose template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  withAltForm<TTemplate extends TemplateLayerPrimitive>(
    template: TTemplate & FormTemplateGuide<TGuide>
  ): FormPageConfig<FormGroupTemplateValue<TTemplate>> {
    return new FormPageConfig<FormGroupTemplateValue<TTemplate>>(
      this.type,
      formTemplateToValueControls<TTemplate>(template)
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
