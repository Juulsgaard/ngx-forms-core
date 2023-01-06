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

  static generic(initialValue: any, defaultValue?: any) {
    return new FormNodeConfig<any>(InputTypes.Generic, defaultValue ?? initialValue, initialValue);
  }

  //<editor-fold desc="String Inputs">
  static id() {
    return new FormNodeConfig<string>(InputTypes.Text, '').withLabel('Id').asReadonly();
  }

  static text(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Text, defaultValue ?? initialValue ?? '', initialValue);
  }

  static guid(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Text, defaultValue ?? initialValue ?? FormConstants.NULL_GUID, initialValue);
  }

  static url(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Url, defaultValue ?? initialValue ?? '', initialValue).withValidators(NodeValidators.url);
  }

  static password(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Password, defaultValue ?? initialValue ?? '', initialValue);
  }

  static color(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Color, defaultValue ?? initialValue ?? '', initialValue);
  }

  static hexColor(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Color, defaultValue ?? initialValue ?? '', initialValue).withValidators(NodeValidators.hexColor);
  }

  static email(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Email, defaultValue ?? initialValue ?? '', initialValue).withValidators(Validators.email);
  }

  static phone(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Phone, defaultValue ?? initialValue ?? '', initialValue);
  }

  static longText(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.LongText, defaultValue ?? initialValue ?? '', initialValue);
  }

  static html(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.HTML, defaultValue ?? initialValue ?? '', initialValue);
  }

  static search(initialValue?: string, defaultValue?: string) {
    return new FormNodeConfig<string>(InputTypes.Search, defaultValue ?? initialValue ?? '', initialValue);
  }

  //</editor-fold>

  //<editor-fold desc="Misc Inputs">
  static number(initialValue?: number, defaultValue?: number) {
    return new FormNodeConfig<number>(InputTypes.Number, defaultValue ?? initialValue ?? 0, initialValue);
  }

  static bool(initialValue?: boolean, defaultValue?: boolean) {
    return new FormNodeConfig<boolean>(InputTypes.Bool, defaultValue ?? initialValue ?? false, initialValue);
  }

  //</editor-fold>

  //<editor-fold desc="Date Inputs">
  static date(initialValue?: Date, defaultValue?: Date) {
    return new FormNodeConfig<Date>(InputTypes.Date, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  static datetime(initialValue?: Date, defaultValue?: Date) {
    return new FormNodeConfig<Date>(InputTypes.DateTime, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  static time(initialValue?: Date, defaultValue?: Date) {
    return new FormNodeConfig<Date>(InputTypes.Time, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  //</editor-fold>

  static select<TItem>(items: TItem[] | Observable<TItem[]>) {
    return new SelectConfig<TItem>(items);
  }

  static group<TControls extends Record<string, SmartFormUnion>>(controls: TControls): FormLayer<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>> {
    return FormLayerConstructors.Controls(controls);
  }

  static root<TControls extends Record<string, SmartFormUnion>>(controls: TControls): FormRoot<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>> {
    return FormRootConstructors.Controls(controls);
  }

  static list<TControls extends Record<string, SmartFormUnion>>(controls: TControls, startLength?: number): FormList<TControls, FormGroupValue<TControls>, FormGroupValueRaw<TControls>> {
    return FormListConstructors.Controls(controls, startLength);
  }

  static template<TValue extends Record<string, any>>(template: FormGroupTemplate<TValue>): ModelFormRoot<TValue> {
    return FormRootConstructors.Model<TValue>(formTemplateToControls(template));
  }

  static groupTemplate<TValue extends Record<string, any>>(template: FormGroupTemplate<TValue>): ModelFormLayer<TValue> {
    return FormLayerConstructors.Model<TValue>(formTemplateToControls(template));
  }

  static guide<TGuide extends Record<string, any>>(): FormGuideFactory<TGuide> {
    return new FormGuideFactory<TGuide>();
  }


  //</editor-fold>

  //<editor-fold desc="Nullable">
  static nullable = {

    generic(initialValue: any) {
      return new FormNodeConfig<any | undefined>(InputTypes.Generic, undefined, initialValue, true);
    },

    //<editor-fold desc="Text Inputs">
    id() {
      return new FormNodeConfig<string | undefined>(InputTypes.Text, undefined, undefined, true).withLabel('Id').asReadonly();
    },
    text(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Text, undefined, initialValue, true);
    },
    guid(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Text, undefined, initialValue, true);
    },
    url(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Url, undefined, initialValue, true).withValidators(NodeValidators.url);
    },
    password(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Password, undefined, initialValue, true);
    },
    color(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Color, undefined, initialValue, true);
    },
    hexColor(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Color, undefined, initialValue, true).withValidators(NodeValidators.hexColor);
    },
    email(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Email, undefined, initialValue, true).withValidators(Validators.email);
    },
    phone(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Phone, undefined, initialValue, true);
    },
    longText(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.LongText, undefined, initialValue, true);
    },
    html(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.HTML, undefined, initialValue, true);
    },
    search(initialValue?: string) {
      return new FormNodeConfig<string | undefined>(InputTypes.Search, undefined, initialValue, true);
    },
    //</editor-fold>

    //<editor-fold desc="Misc Inputs">
    number(initialValue?: number) {
      return new FormNodeConfig<number | undefined>(InputTypes.Number, undefined, initialValue, true);
    },
    file() {
      return new FormNodeConfig<File | undefined>(InputTypes.File, undefined, undefined, true);
    },
    //</editor-fold>

    //<editor-fold desc="Date Inputs">
    date(initialValue?: Date) {
      return new FormNodeConfig<Date | undefined>(InputTypes.Date, undefined, initialValue, true);
    },
    datetime(initialValue?: Date) {
      return new FormNodeConfig<Date | undefined>(InputTypes.DateTime, undefined, initialValue, true);
    },
    time(initialValue?: Date) {
      return new FormNodeConfig<Date | undefined>(InputTypes.Time, undefined, initialValue, true);
    },
    //</editor-fold>
  }
  //</editor-fold>

  //<editor-fold desc="Server Null">
  static serverNull = {

    //<editor-fold desc="Text Inputs">

    text(initialValue?: string) {
      return Form.nullable.text(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    guid(initialValue?: string) {
      return Form.nullable.text(initialValue).withRawDefault(FormConstants.NULL_GUID);
    },

    url(initialValue?: string) {
      return Form.nullable.url(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    password(initialValue?: string) {
      return Form.nullable.password(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    color(initialValue?: string) {
      return Form.nullable.color(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    hexColor(initialValue?: string) {
      return Form.nullable.hexColor(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    email(initialValue?: string) {
      return Form.nullable.email(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    phone(initialValue?: string) {
      return Form.nullable.phone(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    longText(initialValue?: string) {
      return Form.nullable.longText(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    html(initialValue?: string) {
      return Form.nullable.html(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },

    search(initialValue?: string) {
      return Form.nullable.search(initialValue).withRawDefault(FormConstants.NULL_STRING);
    },
    //</editor-fold>

    date(initialValue?: Date) {
      return Form.nullable.date(initialValue).withRawDefault(FormConstants.NULL_DATE);
    },

    datetime(initialValue?: Date) {
      return Form.nullable.datetime(initialValue).withRawDefault(FormConstants.NULL_DATE);
    },

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

  single(): SingleSelectConfig<TItem, TItem>
  single<TData>(selection: MapFunc<TItem, TData>): SingleSelectConfig<TData, TItem>
  single<TData>(selection?: MapFunc<TItem, TData>): SingleSelectConfig<TData | TItem, TItem> {
    return new SingleSelectConfig<TData | TItem, TItem>(this.items, selection ? selection : x => x);
  }

  multiple(): MultiSelectConfig<TItem, TItem>
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

  nullable(initialValue?: TValue): SingleSelectNodeConfig<TValue | undefined, TItem> {
    return new FormSelectNodeConfig(InputTypes.Select, undefined, this.items, this.map, initialValue, true);
  }

  notNull(initialValue: TValue, defaultValue = initialValue): SingleSelectNodeConfig<TValue, TItem> {
    return new FormSelectNodeConfig(InputTypes.Select, defaultValue, this.items, this.map, initialValue);
  }

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

  notNull(initialValue?: TValue[], defaultValue = initialValue): MultiSelectNodeConfig<TValue, TItem> {
    return new FormSelectNodeConfig(InputTypes.SelectMany, defaultValue ?? [], this.items, this.map, initialValue);
  }
}

//</editor-fold>

class FormGuideFactory<TGuide extends Record<string, any>> {
  withForm<TControls extends FormGroupControls<DeepPartial<TGuide>>>(controls: TControls): ControlFormRoot<TControls> {
    return new FormRoot(controls);
  }

}
