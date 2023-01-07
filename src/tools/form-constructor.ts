import {Validators} from "@angular/forms";
import {FormNodeConfig, InputTypes} from "../models/form-node";
import {Observable} from "rxjs";
import {DeepPartial, MapFunc} from "@consensus-labs/ts-tools";
import {FormSelectNodeConfig, MultiSelectNodeConfig, SingleSelectNodeConfig} from "../models/form-select-node";
import {FormLayer, FormLayerConstructors, ModelFormLayer} from "../models/form-layer";
import {FormGroupControls, FormGroupTemplate, FormGroupValue, FormGroupValueRaw, SmartFormUnion} from "./form-types";
import {ControlFormRoot, FormRoot, FormRootConstructors, ModelFormRoot} from "../models/form-root";
import {NodeValidators} from "./validation";
import {FormList, FormListConstructors} from "../models/form-list";
import {formTemplateToControls} from "./templates";
import {FormConstants} from "./constants";

export class Form {

  //<editor-fold desc="Non Nullable">

  /**
   * Create a generic input with no type
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static generic(initialValue: any, defaultValue?: any) {
    return new FormNodeConfig<any>(InputTypes.Generic, defaultValue ?? initialValue, initialValue);
  }

  //<editor-fold desc="String Inputs">
  /**
   * Create a readonly input for storing Ids
   */
  static id() {
    return new FormNodeConfig<string>(InputTypes.Text, '').withLabel('Id').asReadonly();
  }

  /**
   * Create a text input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static text(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Text, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create a GUID input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static guid(initialValue?: string, defaultValue?: string) {
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
  static url(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Url, defaultValue ?? initialValue ?? '', initialValue).withValidators(
      NodeValidators.url);
  }

  /**
   * Create a password input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static password(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Password, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create a color input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static color(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Color, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create a hex color input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static hexColor(initialValue?: string, defaultValue?: string) {
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
  static email(initialValue?: string, defaultValue?: string) {
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
  static phone(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Phone, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create a textfield input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static longText(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.LongText, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create an HTML input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static html(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.HTML, defaultValue ?? initialValue ?? '', initialValue);
  }

  /**
   * Create a search input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static search(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Search, defaultValue ?? initialValue ?? '', initialValue);
  }

  //</editor-fold>

  //<editor-fold desc="Misc Inputs">

  /**
   * Create a number input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static number(initialValue?: number, defaultValue?: number) {
    return new FormNodeConfig<number>(InputTypes.Number, defaultValue ?? initialValue ?? 0, initialValue);
  }

  /**
   * Create a boolean input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static bool(initialValue?: boolean, defaultValue?: boolean) {
    return new FormNodeConfig<boolean>(InputTypes.Bool, defaultValue ?? initialValue ?? false, initialValue);
  }

  //</editor-fold>

  //<editor-fold desc="Date Inputs">

  /**
   * Create a date input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static date(initialValue?: Date, defaultValue?: Date) {
    return new FormNodeConfig<Date>(InputTypes.Date, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  /**
   * Create a date and time input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static datetime(initialValue?: Date, defaultValue?: Date) {
    return new FormNodeConfig<Date>(InputTypes.DateTime, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  /**
   * Create a time input
   * @param initialValue - The starting value
   * @param defaultValue - The value to use when empty
   */
  static time(initialValue?: Date, defaultValue?: Date) {
    return new FormNodeConfig<Date>(InputTypes.Time, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  //</editor-fold>

  /**
   * Create a select endpoint
   * @param items - The items to select from
   */
  static select<TItem>(items: TItem[] | Observable<TItem[]>) {
    return new SelectConfig<TItem>(items);
  }

  /**
   * Create a Form Layer
   * @param controls - The controls of the group
   */
  static group<TControls extends Record<string, SmartFormUnion>>(controls: TControls): FormLayer<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>> {
    return FormLayerConstructors.Controls(controls);
  }

  /**
   * Create a Form
   * @param controls - The controls of the form
   */
  static root<TControls extends Record<string, SmartFormUnion>>(controls: TControls): FormRoot<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>> {
    return FormRootConstructors.Controls(controls);
  }

  /**
   * Create a Form List
   * @param controls - The control to populate the list with
   * @param startLength - The starting length of the list
   */
  static list<TControls extends Record<string, SmartFormUnion>>(
    controls: TControls,
    startLength?: number
  ): FormList<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>> {
    return FormListConstructors.Controls(controls, startLength);
  }

  /**
   * Create a form using a type based template
   * @param template - The form template to create the form from
   */
  static template<TValue extends Record<string, any>>(template: FormGroupTemplate<TValue>): ModelFormRoot<TValue> {
    return FormRootConstructors.Model<TValue>(formTemplateToControls(template));
  }

  /**
   * Create a Form Layer using a type based template
   * @param template - The form template to create the layer from
   */
  static groupTemplate<TValue extends Record<string, any>>(template: FormGroupTemplate<TValue>): ModelFormLayer<TValue> {
    return FormLayerConstructors.Model<TValue>(formTemplateToControls(template));
  }

  /**
   * Create a Form using a type based guide
   */
  static guide<TGuide extends Record<string, any>>(): FormGuideFactory<TGuide> {
    return new FormGuideFactory<TGuide>();
  }


  //</editor-fold>

  //<editor-fold desc="Nullable">

  /** Create a nullable input */
  static nullable = {

    /**
     * Create a generic input with no type, which can be null
     * @param initialValue - The starting value of the input
     */
    generic(initialValue: any) {
      return new FormNodeConfig<any | undefined>(InputTypes.Generic, undefined, initialValue, true);
    },

    //<editor-fold desc="Text Inputs">

    /**
     * Create a nullable Id input
     */
    id() {
      return new FormNodeConfig<string | undefined>(InputTypes.Text, undefined, undefined, true).withLabel('Id')
        .asReadonly();
    },

    /**
     * Create nullable text input
     * @param initialValue - The starting value of the input
     */
    text(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Text, undefined, initialValue, true);
    },

    /**
     * Create a nullable GUID input
     * @param initialValue - The starting value of the input
     */
    guid(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Text, undefined, initialValue, true);
    },

    /**
     * Create a nullable URL input
     * @param initialValue - The starting value of the input
     */
    url(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Url, undefined, initialValue, true).withValidators(
        NodeValidators.url);
    },

    /**
     * Create a nullable password input
     * @param initialValue - The starting value of the input
     */
    password(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Password, undefined, initialValue, true);
    },

    /**
     * Create a nullable color input
     * @param initialValue - The starting value of the input
     */
    color(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Color, undefined, initialValue, true);
    },

    /**
     * Create a nullable hex color input
     * @param initialValue - The starting value of the input
     */
    hexColor(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Color, undefined, initialValue, true).withValidators(
        NodeValidators.hexColor);
    },

    /**
     * Create a nullable email input
     * @param initialValue - The starting value of the input
     */
    email(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Email, undefined, initialValue, true).withValidators(
        Validators.email);
    },

    /**
     * Create a nullable phone number input
     * @param initialValue - The starting value of the input
     */
    phone(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Phone, undefined, initialValue, true);
    },

    /**
     * Create a nullable textfield input
     * @param initialValue - The starting value of the input
     */
    longText(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.LongText, undefined, initialValue, true);
    },

    /**
     * Create a nullable HTML input
     * @param initialValue - The starting value of the input
     */
    html(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.HTML, undefined, initialValue, true);
    },

    /**
     * Create a nullable search input
     * @param initialValue - The starting value of the input
     */
    search(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Search, undefined, initialValue, true);
    },
    //</editor-fold>

    //<editor-fold desc="Misc Inputs">

    /**
     * Create a nullable number input
     * @param initialValue - The starting value of the input
     */
    number(initialValue?: number) {
      return new FormNodeConfig<number | undefined>(InputTypes.Number, undefined, initialValue, true);
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
     */
    date(initialValue?: Date) {
      return new FormNodeConfig<Date | undefined>(InputTypes.Date, undefined, initialValue, true);
    },

    /**
     * Create a nullable date and time input
     * @param initialValue - The starting value of the input
     */
    datetime(initialValue?: Date) {
      return new FormNodeConfig<Date | undefined>(InputTypes.DateTime, undefined, initialValue, true);
    },

    /**
     * Create a nullable time input
     * @param initialValue - The starting value of the input
     */
    time(initialValue?: Date) {
      return new FormNodeConfig<Date | undefined>(InputTypes.Time, undefined, initialValue, true);
    },
    //</editor-fold>
  }
  //</editor-fold>

  //<editor-fold desc="Server Null">

  /** Create a nullable input that returns a non-null raw value */
  static serverNull = {

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
   * Supply the controls that fulfill the guide
   * @param controls - Form controls
   */
  withForm<TControls extends FormGroupControls<DeepPartial<TGuide>>>(controls: TControls): ControlFormRoot<TControls> {
    return new FormRoot(controls);
  }

}
