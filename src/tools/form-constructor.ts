import {Validators} from "@angular/forms";
import {FormNodeConfig, InputTypes} from "../forms/form-node";
import {Observable} from "rxjs";
import {Constrain, MapFunc} from "@juulsgaard/ts-tools";
import {FormSelectNodeConfig, MultiSelectNodeConfig, SingleSelectNodeConfig} from "../forms/form-select-node";
import {FormLayer, FormLayerConstructors, ModelFormLayer} from "../forms/form-layer";
import {
  FormGroupControls, FormGroupTemplate, FormGroupTemplateValue, FormGroupValue, FormGroupValueRaw, PartialTemplate,
  SmartFormUnion, TemplateGuide
} from "./form-types";
import {FormRoot, FormRootConstructors, ModelFormRoot} from "../forms/form-root";
import {NodeValidators} from "./validation";
import {FormList, FormListConstructors} from "../forms/form-list";
import {formTemplateToControls, formTemplateToValueControls} from "./templates";
import {FormConstants} from "./constants";

export module Form {

  //<editor-fold desc="Non Nullable">

  /**
   * Create a generic input with no type
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function generic<T>(initialValue: T, defaultValue?: T) {
    return new FormNodeConfig<T>(InputTypes.Generic, defaultValue ?? initialValue, initialValue);
  }

  //<editor-fold desc="String Inputs">
  /**
   * Create a readonly input for storing Ids
   */
  export function id(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Text, defaultValue ?? initialValue ?? '', initialValue).withLabel('Id').asReadonly();
  }

  /**
   * Create a text input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function text(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Text, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create a GUID input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function guid(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(
      InputTypes.Text,
      defaultValue ?? initialValue ?? FormConstants.NULL_GUID,
      initialValue
    );
  }

  /**
   * Create a URL input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function url(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Url, defaultValue ?? initialValue ?? '', initialValue).withValidators(
      NodeValidators.url);
  }

  /**
   * Create a password input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function password(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Password, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create a color input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function color(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Color, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create a hex color input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function hexColor(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(
      InputTypes.Color,
      defaultValue ?? initialValue ?? '',
      initialValue
    ).withValidators(NodeValidators.hexColor);
  }

  /**
   * Create an email input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function email(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(
      InputTypes.Email,
      defaultValue ?? initialValue ?? '',
      initialValue
    ).withValidators(Validators.email);
  }

  /**
   * Create a phone number input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function phone(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Phone, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create a textfield input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function longText(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.LongText, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create an HTML input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function html(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.HTML, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create a search input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function search(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Search, defaultValue ?? initialValue ?? '', initialValue);
  }

  //</editor-fold>

  //<editor-fold desc="Misc Inputs">

  /**
   * Create a number input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function number(initialValue?: number, defaultValue?: number) {
    return new FormNodeConfig<number>(InputTypes.Number, defaultValue ?? initialValue ?? 0, initialValue);
  }

  /**
   * Create a boolean input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function bool(initialValue?: boolean, defaultValue?: boolean) {
    return new FormNodeConfig<boolean>(InputTypes.Bool, defaultValue ?? initialValue ?? false, initialValue);
  }

  //</editor-fold>

  //<editor-fold desc="Date Inputs">

  /**
   * Create a date input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function date(initialValue?: Date, defaultValue?: Date) {
    return new FormNodeConfig<Date>(InputTypes.Date, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  /**
   * Create a date and time input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function datetime(initialValue?: Date, defaultValue?: Date) {
    return new FormNodeConfig<Date>(InputTypes.DateTime, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  /**
   * Create a time input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  export function time(initialValue?: Date, defaultValue?: Date) {
    return new FormNodeConfig<Date>(InputTypes.Time, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  //</editor-fold>

  /**
   * Create a select endpoint
   * @param items - The items to select from
   */
  export function select<TItem>(items: TItem[] | Observable<TItem[]>) {
    return new SelectConfig<TItem>(items);
  }

  /**
   * Create a Form Layer
   * @param controls - The controls of the group
   */
  export function group<TControls extends Record<string, SmartFormUnion>>(controls: TControls): FormLayer<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>> {
    return FormLayerConstructors.Controls(controls);
  }

  /**
   * Create a Form
   * @param controls - The controls of the form
   */
  export function root<TControls extends Record<string, SmartFormUnion>>(controls: TControls): FormRoot<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>> {
    return FormRootConstructors.Controls(controls);
  }

  /**
   * Create a Form List
   * @param controls - The control to populate the list with
   * @param startLength - The starting length of the list
   */
  export function list<TControls extends Record<string, SmartFormUnion>>(
    controls: TControls,
    startLength?: number
  ): FormList<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>> {
    return FormListConstructors.Controls(controls, startLength);
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
    return FormLayerConstructors.Model<TValue>(formTemplateToControls(template));
  }

  /**
   * Create a Form using a type based guide
   */
  export function guide<TGuide extends Record<string, any>>(): FormGuideFactory<TGuide> {
    return new FormGuideFactory<TGuide>();
  }


  //</editor-fold>

  //<editor-fold desc="Nullable">

  /** Create a nullable input */
  export const nullable = {

    /**
     * Create a generic input with no type, which can be null
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    generic<T = any>(initialValue?: T, disabledDefault?: T) {
      return new FormNodeConfig<T | undefined>(InputTypes.Generic, undefined, initialValue, true, undefined, disabledDefault);
    },

    //<editor-fold desc="Text Inputs">

    /**
     * Create a nullable Id input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    id(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Text, undefined, initialValue, true, undefined, disabledDefault).withLabel('Id')
        .asReadonly();
    },

    /**
     * Create nullable text input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    text(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Text, undefined, initialValue, true, undefined, disabledDefault);
    },

    /**
     * Create a nullable GUID input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    guid(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Text, undefined, initialValue, true, undefined, disabledDefault);
    },

    /**
     * Create a nullable URL input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    url(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Url, undefined, initialValue, true, undefined, disabledDefault).withValidators(
        NodeValidators.url);
    },

    /**
     * Create a nullable password input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    password(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Password, undefined, initialValue, true, undefined, disabledDefault);
    },

    /**
     * Create a nullable color input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    color(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Color, undefined, initialValue, true, undefined, disabledDefault);
    },

    /**
     * Create a nullable hex color input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    hexColor(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Color, undefined, initialValue, true, undefined, disabledDefault).withValidators(
        NodeValidators.hexColor);
    },

    /**
     * Create a nullable email input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    email(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Email, undefined, initialValue, true, undefined, disabledDefault).withValidators(
        Validators.email);
    },

    /**
     * Create a nullable phone number input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    phone(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Phone, undefined, initialValue, true, undefined, disabledDefault);
    },

    /**
     * Create a nullable textfield input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    longText(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.LongText, undefined, initialValue, true, undefined, disabledDefault);
    },

    /**
     * Create a nullable HTML input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    html(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.HTML, undefined, initialValue, true, undefined, disabledDefault);
    },

    /**
     * Create a nullable search input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    search(initialValue?: string, disabledDefault?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Search, undefined, initialValue, true, undefined, disabledDefault);
    },
    //</editor-fold>

    //<editor-fold desc="Misc Inputs">

    /**
     * Create a nullable number input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    number(initialValue?: number, disabledDefault?: number) {
      return new FormNodeConfig<number | undefined>(InputTypes.Number, undefined, initialValue, true, undefined, disabledDefault);
    },

    /**
     * Create a nullable file input
     */
    file() {
      return new FormNodeConfig<File | undefined>(InputTypes.File, undefined, undefined, true);
    },

    //</editor-fold>

    //<editor-fold desc="Date Inputs">

    /**
     * Create a nullable date input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    date(initialValue?: Date, disabledDefault?: Date) {
      return new FormNodeConfig<Date | undefined>(InputTypes.Date, undefined, initialValue, true, undefined, disabledDefault);
    },

    /**
     * Create a nullable date and time input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    datetime(initialValue?: Date, disabledDefault?: Date) {
      return new FormNodeConfig<Date | undefined>(InputTypes.DateTime, undefined, initialValue, true, undefined, disabledDefault);
    },

    /**
     * Create a nullable time input
     * @param initialValue - The starting value of the input
     * @param disabledDefault - A default value to use when the input is disabled
     */
    time(initialValue?: Date, disabledDefault?: Date) {
      return new FormNodeConfig<Date | undefined>(InputTypes.Time, undefined, initialValue, true, undefined, disabledDefault);
    },
    //</editor-fold>
  }
  //</editor-fold>

  //<editor-fold desc="Server Null">

  /** Create a nullable input that returns a non-null raw value */
  export const serverNull = {

    //<editor-fold desc="Text Inputs">

    /**
     * Create a nullable text input field coalescing to a NULL string
     * @param initialValue - The starting value of the input
     */
    text(initialValue?: string) {
      return Form.nullable.text(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    /**
     * Create a nullable GUID input field coalescing to an empty GUID
     * @param initialValue - The starting value of the input
     */
    guid(initialValue?: string) {
      return Form.nullable.text(initialValue).withRawDefault(FormConstants.NULL_GUID);
    },

    /**
     * Create a nullable URL input field coalescing to a NULL string
     * @param initialValue - The starting value of the input
     */
    url(initialValue?: string) {
      return Form.nullable.url(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    /**
     * Create a nullable password input field coalescing to a NULL string
     * @param initialValue - The starting value of the input
     */
    password(initialValue?: string) {
      return Form.nullable.password(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    /**
     * Create a nullable color input field coalescing to a NULL string
     * @param initialValue - The starting value of the input
     */
    color(initialValue?: string) {
      return Form.nullable.color(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    /**
     * Create a nullable hex color input field coalescing to a NULL string
     * @param initialValue - The starting value of the input
     */
    hexColor(initialValue?: string) {
      return Form.nullable.hexColor(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    /**
     * Create a nullable email input field coalescing to a NULL string
     * @param initialValue - The starting value of the input
     */
    email(initialValue?: string) {
      return Form.nullable.email(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    /**
     * Create a nullable phone input field coalescing to a NULL string
     * @param initialValue - The starting value of the input
     */
    phone(initialValue?: string) {
      return Form.nullable.phone(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    /**
     * Create a nullable textfield input field coalescing to a NULL string
     * @param initialValue - The starting value of the input
     */
    longText(initialValue?: string) {
      return Form.nullable.longText(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    /**
     * Create a nullable HTML input field coalescing to a NULL string
     * @param initialValue - The starting value of the input
     */
    html(initialValue?: string) {
      return Form.nullable.html(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    /**
     * Create a nullable search input field coalescing to a NULL string
     * @param initialValue - The starting value of the input
     */
    search(initialValue?: string) {
      return Form.nullable.search(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },
    //</editor-fold>

    /**
     * Create a nullable date input field coalescing to Unix Epoch
     * @param initialValue - The starting value of the input
     */
    date(initialValue?: Date) {
      return Form.nullable.date(initialValue).withRawDefault(FormConstants.NULL_DATE);
    },

    /**
     * Create a nullable date and time input field coalescing to Unix Epoch
     * @param initialValue - The starting value of the input
     */
    datetime(initialValue?: Date) {
      return Form.nullable.datetime(initialValue).withRawDefault(FormConstants.NULL_DATE);
    },

    /**
     * Create a nullable time input field coalescing to Unix Epoch
     * @param initialValue - The starting value of the input
     */
    time(initialValue?: Date) {
      return Form.nullable.time(initialValue).withRawDefault(FormConstants.NULL_DATE);
    },
  }

  //</editor-fold>
}

//<editor-fold desc="Selection Node Builder">
class SelectConfig<TItem> {
  constructor(private items: TItem[] | Observable<TItem[]>) {
  }

  /**
   * Make the input single select
   */
  single(): SingleSelectConfig<TItem, TItem>
  /**
   * Make the input single select and use a mapped value
   * @param selection - The value map
   */
  single<TData>(selection: MapFunc<TItem, TData>): SingleSelectConfig<TData, TItem>
  single<TData>(selection?: MapFunc<TItem, TData>): SingleSelectConfig<TData | TItem, TItem> {
    return new SingleSelectConfig<TData | TItem, TItem>(this.items, selection ? selection : x => x);
  }

  /**
   * Make the input multi select
   */
  multiple(): MultiSelectConfig<TItem, TItem>
  /**
   * Make the input multi select and use a mapped value
   * @param selection - The value map
   */
  multiple<TData>(selection: MapFunc<TItem, TData>): MultiSelectConfig<TData, TItem>
  multiple<TData>(selection?: MapFunc<TItem, TData>): MultiSelectConfig<TData | TItem, TItem> {
    return new MultiSelectConfig<TData | TItem, TItem>(this.items, selection ? selection : x => x);
  }
}

type ServerNullTypes<T> = NonNullable<T> extends string ? 'text' | 'guid' :
  NonNullable<T> extends Date ? 'date' :
    never;

class SingleSelectConfig<TValue, TItem> {
  constructor(private items: TItem[] | Observable<TItem[]>, private map: MapFunc<TItem, TValue>) {
  }

  /**
   * Make the input nullable
   * @param initialValue - The starting value of the input
   */
  nullable(initialValue?: TValue): SingleSelectNodeConfig<TValue | undefined, TItem> {
    return new FormSelectNodeConfig(InputTypes.Select, undefined, this.items, this.map, initialValue, true);
  }

  /**
   * Make the input non-nullable
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  notNull(initialValue: TValue, defaultValue = initialValue): SingleSelectNodeConfig<TValue, TItem> {
    return new FormSelectNodeConfig(InputTypes.Select, defaultValue, this.items, this.map, initialValue);
  }

  /**
   * Make the input nullable but with a coalesced raw value
   * @param type - The coalescing type
   * @param initialValue - The starting value of the input
   */
  serverNull(type: ServerNullTypes<TValue>, initialValue?: TValue): SingleSelectNodeConfig<TValue | undefined, TItem> {
    const serverNullValue = (
      type == 'date' ? FormConstants.NULL_DATE :
        type === 'text' ? FormConstants.NULL_STRING :
          FormConstants.NULL_GUID
    ) as unknown as TValue;
    return this.nullable(initialValue).withRawDefault(serverNullValue);
  }
}

class MultiSelectConfig<TValue, TItem> {
  constructor(private items: TItem[] | Observable<TItem[]>, private map: MapFunc<TItem, TValue>) {
  }

  /**
   * Make the input non-nullable
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  notNull(initialValue?: TValue[], defaultValue = initialValue): MultiSelectNodeConfig<TValue, TItem> {
    return new FormSelectNodeConfig(InputTypes.SelectMany, defaultValue ?? [], this.items, this.map, initialValue);
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
