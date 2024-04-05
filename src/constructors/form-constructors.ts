import {Observable} from "rxjs";
import {Constrain} from "@juulsgaard/ts-tools";
import {FormLayer, ModelFormLayer} from "../forms/form-layer";
import {
  FormGroupControls, FormGroupTemplate, FormGroupTemplateValue, FormGroupValue, PartialTemplate, TemplateGuide
} from "../tools/form-types";
import {FormRoot, ModelFormRoot} from "../forms/form-root";
import {FormList} from "../forms/form-list";
import {formTemplateToControls, formTemplateToValueControls} from "../tools/templates";
import {FormConstants} from "../tools/constants";
import {InputTypes} from "../forms/anon-form-node";
import {FormNodeConfig} from "../forms/form-node-config";
import {FormSelectBuilder} from "./form-select-builder";
import {FormNodeCtorOptions, parseOptions} from "./cosntructor-tools";
import {Validators} from "../tools/validators";
import {FormListConstructors} from "./form-list-constructors";
import {FormRootConstructors} from "./form-root-constructors";
import {formLayer} from "./form-layer-constructors";
import {FormUnit} from "../forms/form-unit";

export class FormConstructors {

  readonly nullable: FormNullableConstructors = new FormNullableConstructors();

  /**
   * Create a generic input with no type
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  generic<T>(
    initialValue: T, options: FormNodeCtorOptions<T> = {}
  ): FormNodeConfig<T> {
    const {fallback, disabled} = parseOptions(initialValue, options, initialValue);
    return new FormNodeConfig<T>(InputTypes.Generic, false, fallback, initialValue, disabled);
  }

  //<editor-fold desc="String Inputs">
  /**
   * Create a readonly input for storing Ids
   */
  id(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.Text, false, fallback, initialValue, disabled)
      .withLabel('Id').asReadonly();
  }

  /**
   * Create a text input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  text(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.Text, false, fallback, initialValue, disabled);
  }

  /**
   * Create a GUID input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  guid(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, FormConstants.NULL_GUID);
    return new FormNodeConfig<string>(InputTypes.Text, false, fallback, initialValue, disabled);
  }

  /**
   * Create a URL input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  url(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.Url, false, fallback, initialValue, disabled)
      .withValidators(Validators.url);
  }

  /**
   * Create a password input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  password(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.Password, false, fallback, initialValue, disabled);
  }

  /**
   * Create a color input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  color(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.Color, false, fallback, initialValue, disabled);
  }

  /**
   * Create a hex color input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  hexColor(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.Color, false, fallback, initialValue, disabled)
      .withValidators(Validators.hexColor());
  }

  /**
   * Create an email input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  email(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.Email, false, fallback, initialValue, disabled)
      .withValidators(Validators.email());
  }

  /**
   * Create a phone number input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  phone(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.Phone, false, fallback, initialValue, disabled);
  }

  /**
   * Create a textfield input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  longText(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.LongText, false, fallback, initialValue, disabled);
  }

  /**
   * Create an HTML input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  html(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.HTML, false, fallback, initialValue, disabled);
  }

  /**
   * Create a search input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  search(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.Search, false, fallback, initialValue, disabled);
  }

  //</editor-fold>

  //<editor-fold desc="Misc Inputs">

  /**
   * Create a number input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  number(initialValue?: number, options: FormNodeCtorOptions<number> = {}): FormNodeConfig<number> {
    const {fallback, disabled} = parseOptions(initialValue, options, 0);
    return new FormNodeConfig<number>(InputTypes.Number, false, fallback, initialValue, disabled);
  }

  /**
   * Create a boolean input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  bool(initialValue?: boolean, options: FormNodeCtorOptions<boolean> = {}): FormNodeConfig<boolean> {
    const {fallback, disabled} = parseOptions(initialValue, options, false);
    return new FormNodeConfig<boolean>(InputTypes.Bool, false, fallback, initialValue, disabled);
  }

  /**
   * Create a file input
   */
  file(): FormNodeConfig<File> {
    return new FormNodeConfig<File>(InputTypes.File, false, FormConstants.NULL_FILE);
  }

  //</editor-fold>

  //<editor-fold desc="Date Inputs">

  /**
   * Create a date input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  date(initialValue?: Date, options: FormNodeCtorOptions<Date> = {}): FormNodeConfig<Date> {
    const {fallback, disabled} = parseOptions(initialValue, options, FormConstants.NULL_DATE);
    return new FormNodeConfig<Date>(InputTypes.Date, false, fallback, initialValue, disabled);
  }

  /**
   * Create a date and time input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  datetime(initialValue?: Date, options: FormNodeCtorOptions<Date> = {}): FormNodeConfig<Date> {
    const {fallback, disabled} = parseOptions(initialValue, options, FormConstants.NULL_DATE);
    return new FormNodeConfig<Date>(InputTypes.DateTime, false, fallback, initialValue, disabled);
  }

  /**
   * Create a time input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  time(initialValue?: Date, options: FormNodeCtorOptions<Date> = {}): FormNodeConfig<Date> {
    const {fallback, disabled} = parseOptions(initialValue, options, FormConstants.NULL_DATE);
    return new FormNodeConfig<Date>(InputTypes.Time, false, fallback, initialValue, disabled);
  }

  //</editor-fold>

  /**
   * Create a select endpoint
   * @param items - The items to select from
   */
  select<TItem>(items: TItem[] | Observable<TItem[]>): FormSelectBuilder<TItem> {
    return new FormSelectBuilder<TItem>(items);
  }

}

export class FormNullableConstructors {

  /**
   * Create a nullable generic input with no type
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  generic<T>(
    initialValue?: T, options: FormNodeCtorOptions<T> = {}
  ): FormNodeConfig<T|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<T|undefined>(InputTypes.Generic, true, fallback, initialValue, disabled);
  }

  //<editor-fold desc="String Inputs">
  /**
   * Create a nullable readonly input for storing Ids
   */
  id(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Text, true, fallback, initialValue, disabled)
      .withLabel('Id').asReadonly();
  }

  /**
   * Create a nullable text input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  text(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Text, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullable GUID input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  guid(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Text, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullable URL input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  url(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Url, true, fallback, initialValue, disabled)
      .withValidators(Validators.url);
  }

  /**
   * Create a nullable password input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  password(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Password, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullable color input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  color(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Color, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullable hex color input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  hexColor(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Color, true, fallback, initialValue, disabled)
      .withValidators(Validators.hexColor());
  }

  /**
   * Create a nullablen email input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  email(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Email, true, fallback, initialValue, disabled)
      .withValidators(Validators.email());
  }

  /**
   * Create a nullable phone number input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  phone(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Phone, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullable textfield input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  longText(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.LongText, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullablen HTML input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  html(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.HTML, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullable search input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  search(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Search, true, fallback, initialValue, disabled);
  }

  //</editor-fold>

  //<editor-fold desc="Misc Inputs">

  /**
   * Create a nullable number input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  number(initialValue?: number, options: FormNodeCtorOptions<number> = {}): FormNodeConfig<number|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<number|undefined>(InputTypes.Number, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullable boolean input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  bool(initialValue?: boolean, options: FormNodeCtorOptions<boolean> = {}): FormNodeConfig<boolean|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<boolean|undefined>(InputTypes.Bool, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullable file input
   */
  file(): FormNodeConfig<File|undefined> {
    return new FormNodeConfig<File|undefined>(InputTypes.File, true, undefined);
  }

  //</editor-fold>

  //<editor-fold desc="Date Inputs">

  /**
   * Create a nullable date input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  date(initialValue?: Date, options: FormNodeCtorOptions<Date> = {}): FormNodeConfig<Date|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options, FormConstants.NULL_DATE);
    return new FormNodeConfig<Date|undefined>(InputTypes.Date, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullable date and time input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  datetime(initialValue?: Date, options: FormNodeCtorOptions<Date> = {}): FormNodeConfig<Date|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options, FormConstants.NULL_DATE);
    return new FormNodeConfig<Date|undefined>(InputTypes.DateTime, true, fallback, initialValue, disabled);
  }

  /**
   * Create a nullable time input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  time(initialValue?: Date, options: FormNodeCtorOptions<Date> = {}): FormNodeConfig<Date|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options, FormConstants.NULL_DATE);
    return new FormNodeConfig<Date|undefined>(InputTypes.Time, true, fallback, initialValue, disabled);
  }

  //</editor-fold>

}

export const Form = new FormConstructors();

// TODO: Move to new structure
export module Temp {

  /**
   * Create a Form Layer
   * @param controls - The controls of the group
   */
  export function group<TControls extends Record<string, FormUnit>>(controls: TControls): FormLayer<TControls, FormGroupValue<TControls>> {
    return formLayer().controls(controls);
  }

  /**
   * Create a Form
   * @param controls - The controls of the form
   */
  export function root<TControls extends Record<string, FormUnit>>(controls: TControls): FormRoot<TControls, FormGroupValue<TControls>> {
    return FormRootConstructors.Controls(controls);
  }

  /**
   * Create a Form List
   * @param controls - The control to populate the list with
   * @param nullable
   * @param startLength - The starting length of the list
   */
  export function list<TControls extends Record<string, FormUnit>, TNullable extends boolean>(
    controls: TControls,
    nullable: TNullable,
    startLength?: number
  ): FormList<TControls, FormGroupValue<TControls>, TNullable> {
    return FormListConstructors.Controls(controls, nullable, startLength);
  }

  /**
   * Create a form using a type based template
   * @param template - The form template to create the form from
   */
  export function template<TValue extends Record<string, any>>(template: FormGroupTemplate<TValue>): ModelFormRoot<TValue> {
    return FormRootConstructors.Model<TValue>(formTemplateToControls(template));
  }

  /**
   * Create a Form Layer using a type based template
   * @param template - The form template to create the layer from
   */
  export function groupTemplate<TValue extends Record<string, any>>(template: FormGroupTemplate<TValue>): ModelFormLayer<TValue> {
    return formLayer().model<TValue>(formTemplateToControls(template));
  }

  /**
   * Create a Form using a type based guide
   */
  export function guide<TGuide extends Record<string, any>>(): FormGuideFactory<TGuide> {
    return new FormGuideFactory<TGuide>();
  }
}


//</editor-fold>

class FormGuideFactory<TGuide extends Record<string, any>> {

  /**
   * Define the form using a strict template
   * @param template - The template
   */
  withForm(template: FormGroupTemplate<TGuide>): ModelFormRoot<TGuide> {
    return FormRootConstructors.Model<TGuide>(
      formTemplateToControls(template)
    );
  }

  /**
   * Define the form using subset of the guide template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  withPartialForm<TTemplate extends FormGroupTemplate<any>>(template: TTemplate & PartialTemplate<TGuide>): ModelFormRoot<FormGroupTemplateValue<Constrain<TTemplate, TGuide>>> {
    return FormRootConstructors.Model<FormGroupTemplateValue<Constrain<TTemplate, TGuide>>>(
      formTemplateToValueControls(template)
    );
  }

  /**
   * Define the form using a loose template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  withAltForm<TTemplate extends FormGroupTemplate<any>>(template: TTemplate & TemplateGuide<TGuide>): ModelFormRoot<FormGroupTemplateValue<TTemplate>> {
    return FormRootConstructors.Model<FormGroupTemplateValue<TTemplate>>(
      formTemplateToValueControls(template)
    );
  }

  /**
   * Define the form controls strictly based on the type
   * @param controls - The controls
   */
  withControls(controls: FormGroupControls<TGuide>): ModelFormRoot<TGuide> {
    return FormRootConstructors.Model<TGuide>(controls);
  }

}
