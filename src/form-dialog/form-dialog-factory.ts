import {FormDialogConfig} from "./form-dialog-config";
import {formTemplateToControls, formTemplateToValueControls} from "../tools/templates";
import {Constrain, SimpleObject} from "@juulsgaard/ts-tools";
import {FormGroupTemplate, FormGroupTemplateValue, TemplateLayerPrimitive} from "../types/templates";
import {FormGroupControls, FormTemplateGuide, PartialFormTemplate} from "../types";

export class FormDialogFactory<TGuide extends SimpleObject> {

  constructor(private type: 'create' | 'update') {

  }

  /**
   * Define the dialog form using a strict template
   * @param template - The template
   */
  withForm(template: FormGroupTemplate<TGuide>): FormDialogConfig<TGuide> {
    return new FormDialogConfig<TGuide>(
      this.type,
      formTemplateToControls(template)
    );
  }

  /**
   * Define the dialog form using subset of the guide template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  withPartialForm<TTemplate extends TemplateLayerPrimitive>(
    template: TTemplate & PartialFormTemplate<TGuide>
  ): FormDialogConfig<FormGroupTemplateValue<Constrain<TTemplate, TGuide>>> {
    return new FormDialogConfig<FormGroupTemplateValue<Constrain<TTemplate, TGuide>>>(
      this.type,
      formTemplateToValueControls(template)
    );
  }

  /**
   * Define the dialog form using a loose template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  withAltForm<TTemplate extends TemplateLayerPrimitive>(
    template: TTemplate & FormTemplateGuide<TGuide>
  ): FormDialogConfig<FormGroupTemplateValue<TTemplate>> {
    return new FormDialogConfig<FormGroupTemplateValue<TTemplate>>(
      this.type,
      formTemplateToValueControls(template)
    );
  }

  /**
   * Define the form controls for the Dialog strictly based on the type
   * @param controls - The controls
   */
  withControls(controls: FormGroupControls<TGuide>): FormDialogConfig<TGuide> {
    return new FormDialogConfig<TGuide>(
      this.type,
      controls
    );
  }
}
