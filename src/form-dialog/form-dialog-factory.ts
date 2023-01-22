import {FormGroupControls, FormGroupTemplate, FormGroupTemplateValue, FormGroupValueRaw} from "../tools/form-types";
import {FormDialogConfig} from "./form-dialog-config";
import {formTemplateToControls} from "../tools/templates";
import {DeepPartial} from "@consensus-labs/ts-tools";

export class FormDialogFactory<TGuide extends Record<string, any>> {
  constructor(private type: 'create' | 'update') {

  }

  /**
   * Define the dialog form using a strict template
   * @param template - The template
   */
  withTemplate(template: FormGroupTemplate<TGuide>): FormDialogConfig<TGuide> {
    return new FormDialogConfig(this.type, formTemplateToControls(template));
  }

  /**
   * Define the dialog form using a strict template with keys omitted
   * @param template - The template
   */
  withModifiedTemplate<TOmit extends keyof TGuide>(template: FormGroupTemplate<Omit<TGuide, TOmit>>): FormDialogConfig<Omit<TGuide, TOmit>> {
    return new FormDialogConfig(this.type, formTemplateToControls(template));
  }

  /**
   * Define the dialog form using a strict template
   * @param template - The template
   */
  withForm(template: FormGroupTemplate<TGuide>): FormDialogConfig<TGuide>;
  /**
   * Define the dialog form using a loose template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  withForm<TTemplate extends FormGroupTemplate<DeepPartial<TGuide>>>(template: TTemplate): FormDialogConfig<FormGroupTemplateValue<TTemplate>>;
  withForm<T extends Record<string, any>>(template: FormGroupTemplate<T>): FormDialogConfig<T> {
    return new FormDialogConfig<T>(
      this.type,
      formTemplateToControls(template)
    );
  }

  /**
   * Define the form controls for the Dialog strictly based on the type
   * @param controls - The controls
   */
  withControls(controls: FormGroupControls<TGuide>): FormDialogConfig<TGuide>;
  /**
   * Define the form controls for the Dialog loosely based on the type.
   * This sacrifices type conciseness for flexibility.
   * @param controls - The controls
   */
  withControls<TControls extends FormGroupControls<DeepPartial<TGuide>>>(controls: TControls): FormDialogConfig<FormGroupValueRaw<TControls>>;
  withControls<T extends Record<string, any>>(controls: FormGroupControls<T>): FormDialogConfig<T> {
    return new FormDialogConfig<T>(
      this.type,
      controls
    );
  }

}
