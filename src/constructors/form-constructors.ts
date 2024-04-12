import {Observable} from "rxjs";
import {Constrain, SimpleObject} from "@juulsgaard/ts-tools";
import {formTemplateToControls, formTemplateToValueControls} from "../tools/templates";
import {FormConstants, Validators} from "../tools";
import {FormLayerConfig, FormListConfig, FormNodeConfig, FormRootConfig, InputTypes} from "../forms";
import {FormSelectBuilder} from "./form-select-builder";
import {FormNodeCtorOptions, parseOptions} from "./constructor-tools";
import {FormTemplateGuide, PartialFormTemplate} from "../types";
import {FormGroupTemplate, FormGroupTemplateValue, TemplateLayerPrimitive} from "../types/templates";

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
      .withErrors(Validators.url());
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
      .withErrors(Validators.hexColor());
  }

  /**
   * Create an email input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  email(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string> {
    const {fallback, disabled} = parseOptions(initialValue, options, '');
    return new FormNodeConfig<string>(InputTypes.Email, false, fallback, initialValue, disabled)
      .withErrors(Validators.email());
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

  layer<T extends SimpleObject>(template: FormGroupTemplate<T>): FormLayerConfig<T> {
    const controls = formTemplateToControls(template);
    return new FormLayerConfig(controls, false);
  }

  list<T extends SimpleObject>(template: FormGroupTemplate<T>): FormListConfig<T, false> {
    const controls = formTemplateToControls(template);
    return new FormListConfig(controls, false);
  }

  root<T extends SimpleObject>(template: FormGroupTemplate<T>): FormRootConfig<T> {
    const controls = formTemplateToControls(template);
    return new FormRootConfig(controls);
  }

  guide<T extends SimpleObject>(): FormGuideConstructors<T> {
    return new FormGuideConstructors<T>();
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
      .withErrors(Validators.url());
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
      .withErrors(Validators.hexColor());
  }

  /**
   * Create a nullablen email input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  email(initialValue?: string, options: FormNodeCtorOptions<string> = {}): FormNodeConfig<string|undefined> {
    const {fallback, disabled} = parseOptions(initialValue, options);
    return new FormNodeConfig<string|undefined>(InputTypes.Email, true, fallback, initialValue, disabled)
      .withErrors(Validators.email());
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

  layer<T extends SimpleObject>(template: FormGroupTemplate<T>): FormLayerConfig<T|undefined> {
    const controls = formTemplateToControls(template);
    return new FormLayerConfig<T|undefined>(controls, true);
  }

  list<T extends SimpleObject>(template: FormGroupTemplate<T>): FormListConfig<T, true> {
    const controls = formTemplateToControls(template);
    return new FormListConfig(controls, true);
  }
}

class FormGuideConstructors<TGuide extends SimpleObject> {

  /**
   * Define the form using subset of the guide template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  partial<TTemplate extends TemplateLayerPrimitive>(
    template: TTemplate & PartialFormTemplate<TGuide>
  ): FormRootConfig<FormGroupTemplateValue<Constrain<TTemplate, TGuide>>> {
    const controls = formTemplateToValueControls<Constrain<TTemplate, TGuide>>(template);
    return new FormRootConfig<FormGroupTemplateValue<Constrain<TTemplate, TGuide>>>(controls);
  }

  /**
   * Define the form using a loose template.
   * This sacrifices type conciseness for flexibility.
   * @param template - The template
   */
  modified<TTemplate extends TemplateLayerPrimitive>(
    template: TTemplate & FormTemplateGuide<TGuide>
  ): FormRootConfig<FormGroupTemplateValue<TTemplate>> {
    const controls = formTemplateToValueControls<TTemplate>(template);
    return new FormRootConfig<FormGroupTemplateValue<TTemplate>>(controls);
  }
}

export const Form = new FormConstructors();
