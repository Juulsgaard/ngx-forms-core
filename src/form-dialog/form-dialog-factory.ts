import {
  FormGroupControls, FormGroupTemplate, FormGroupTemplateValue, FormGroupValueRaw, PartialControls, PartialTemplate,
  TemplateGuide
} from "../tools/form-types";
import {FormDialogConfig} from "./form-dialog-config";
import {formTemplateToControls, formTemplateToValueControls} from "../tools/templates";
import {AbstractControl} from "@angular/forms";
import {Constrain} from "@consensus-labs/ts-tools";

export class FormDialogFactory<TGuide extends Record<string, any>> {

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
  withPartialForm<TTemplate extends FormGroupTemplate<any>>(template: TTemplate & PartialTemplate<TGuide>): FormDialogConfig<FormGroupTemplateValue<Constrain<TTemplate, TGuide>>> {
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
  withAltForm<TTemplate extends FormGroupTemplate<any>>(template: TTemplate & TemplateGuide<TGuide>): FormDialogConfig<FormGroupTemplateValue<TTemplate>> {
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

  /**
   * Define the form controls for the Dialog loosely based on the type.
   * This sacrifices type conciseness for flexibility.
   * @param controls - The controls
   */
  withPartialControls<TControls extends PartialControls<TGuide> & Record<string, AbstractControl>>(
    controls: TControls
  ): FormDialogConfig<FormGroupValueRaw<TControls>> {
    return FormDialogConfig.FromControls(this.type, controls);
  }
}
