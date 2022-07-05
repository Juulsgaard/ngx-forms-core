import {Validators} from "@angular/forms";
import {FormNode, InputTypes} from "../models/form-node";
import {Observable} from "rxjs";
import {DeepPartial, MapFunc} from "@consensus-labs/ts-tools";
import {FormSelectNode, MultiSelectNode, SingleSelectNode} from "../models/form-select-node";
import {FormLayer, FormLayerConstructors, ModelFormLayer} from "../models/form-layer";
import {FormGroupControls, FormGroupTemplate, FormGroupValue, FormGroupValueRaw, SmartFormUnion} from "./form-types";
import {ControlFormRoot, FormRoot, FormRootConstructors, ModelFormRoot} from "../models/form-root";
import {NodeValidators} from "./validation";
import {FormList, FormListConstructors} from "../models/form-list";
import {formTemplateToControls} from "./templates";

export class Form {
  //<editor-fold desc="Non Nullable">

  static generic(initialValue: any, defaultValue?: any) {
    return new FormNode<any>(InputTypes.Generic, defaultValue ?? initialValue, initialValue);
  }

  //<editor-fold desc="String Inputs">
  static id() {
    return new FormNode<string>(InputTypes.Text, '').withLabel('Id').lock();
  }

  static text(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.Text, defaultValue ?? initialValue ?? '', initialValue);
  }

  static guid(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.Text, defaultValue ?? initialValue ?? '00000000-0000-0000-0000-000000000000', initialValue);
  }

  static url(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.Url, defaultValue ?? initialValue ?? '', initialValue).withValidators(NodeValidators.url);
  }

  static password(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.Password, defaultValue ?? initialValue ?? '', initialValue);
  }

  static color(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.Color, defaultValue ?? initialValue ?? '', initialValue);
  }

  static hexColor(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.Color, defaultValue ?? initialValue ?? '', initialValue).withValidators(NodeValidators.hexColor);
  }

  static email(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.Email, defaultValue ?? initialValue ?? '', initialValue).withValidators(Validators.email);
  }

  static phone(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.Phone, defaultValue ?? initialValue ?? '', initialValue);
  }

  static longText(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.LongText, defaultValue ?? initialValue ?? '', initialValue);
  }

  static html(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.HTML, defaultValue ?? initialValue ?? '', initialValue);
  }

  static search(initialValue?: string, defaultValue?: string) {
    return new FormNode<string>(InputTypes.Search, defaultValue ?? initialValue ?? '', initialValue);
  }

  //</editor-fold>

  //<editor-fold desc="Misc Inputs">
  static number(initialValue?: number, defaultValue?: number) {
    return new FormNode<number>(InputTypes.Number, defaultValue ?? initialValue ?? 0, initialValue);
  }

  static bool(initialValue?: boolean, defaultValue?: boolean) {
    return new FormNode<boolean>(InputTypes.Bool, defaultValue ?? initialValue ?? false, initialValue);
  }

  //</editor-fold>

  //<editor-fold desc="Date Inputs">
  static date(initialValue?: Date, defaultValue?: Date) {
    return new FormNode<Date>(InputTypes.Date, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  static datetime(initialValue?: Date, defaultValue?: Date) {
    return new FormNode<Date>(InputTypes.DateTime, defaultValue ?? initialValue ?? new Date(0), initialValue);
  }

  static time(initialValue?: Date, defaultValue?: Date) {
    return new FormNode<Date>(InputTypes.Time, defaultValue ?? initialValue ?? new Date(0), initialValue);
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
      return new FormNode<any | undefined>(InputTypes.Generic, undefined, initialValue, true);
    },

    //<editor-fold desc="Text Inputs">
    id() {
      return new FormNode<string | undefined>(InputTypes.Text, undefined, undefined, true).withLabel('Id').lock();
    },
    text(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.Text, undefined, initialValue, true);
    },
    guid(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.Text, undefined, initialValue, true);
    },
    url(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.Url, undefined, initialValue, true).withValidators(NodeValidators.url);
    },
    password(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.Password, undefined, initialValue, true);
    },
    color(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.Color, undefined, initialValue, true);
    },
    hexColor(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.Color, undefined, initialValue, true).withValidators(NodeValidators.hexColor);
    },
    email(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.Email, undefined, initialValue, true).withValidators(Validators.email);
    },
    phone(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.Phone, undefined, initialValue, true);
    },
    longText(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.LongText, undefined, initialValue, true);
    },
    html(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.HTML, undefined, initialValue, true);
    },
    search(initialValue?: string) {
      return new FormNode<string | undefined>(InputTypes.Search, undefined, initialValue, true);
    },
    //</editor-fold>

    //<editor-fold desc="Misc Inputs">
    number(initialValue?: number) {
      return new FormNode<number | undefined>(InputTypes.Number, undefined, initialValue, true);
    },
    file() {
      return new FormNode<File | undefined>(InputTypes.File, undefined, undefined, true);
    },
    //</editor-fold>

    //<editor-fold desc="Date Inputs">
    date(initialValue?: Date) {
      return new FormNode<Date | undefined>(InputTypes.Date, undefined, initialValue, true);
    },
    datetime(initialValue?: Date) {
      return new FormNode<Date | undefined>(InputTypes.DateTime, undefined, initialValue, true);
    },
    time(initialValue?: Date) {
      return new FormNode<Date | undefined>(InputTypes.Time, undefined, initialValue, true);
    },
    //</editor-fold>
  }
  //</editor-fold>

  //<editor-fold desc="Server Null">
  static serverNull = {
    //<editor-fold desc="Text Inputs">
    text(initialValue?: string) {
      return Form.nullable.text(initialValue).withRawDefault('\0');
    },

    guid(initialValue?: string) {
      return Form.nullable.text(initialValue).withRawDefault('00000000-0000-0000-0000-000000000000');
    },

    url(initialValue?: string) {
      return Form.nullable.url(initialValue).withRawDefault('\0');
    },

    password(initialValue?: string) {
      return Form.nullable.password(initialValue).withRawDefault('\0');
    },

    color(initialValue?: string) {
      return Form.nullable.color(initialValue).withRawDefault('\0');
    },

    hexColor(initialValue?: string) {
      return Form.nullable.hexColor(initialValue).withRawDefault('\0');
    },

    email(initialValue?: string) {
      return Form.nullable.email(initialValue).withRawDefault('\0');
    },

    phone(initialValue?: string) {
      return Form.nullable.phone(initialValue).withRawDefault('\0');
    },

    longText(initialValue?: string) {
      return Form.nullable.longText(initialValue).withRawDefault('\0');
    },

    html(initialValue?: string) {
      return Form.nullable.html(initialValue).withRawDefault('\0');
    },

    search(initialValue?: string) {
      return Form.nullable.search(initialValue).withRawDefault('\0');
    },
    //</editor-fold>

    date(initialValue?: Date) {
      return Form.nullable.date(initialValue).withRawDefault(new Date(1970, 0, 1));
    },

    datetime(initialValue?: Date) {
      return Form.nullable.datetime(initialValue).withRawDefault(new Date(1970, 0, 1));
    },

    time(initialValue?: Date) {
      return Form.nullable.time(initialValue).withRawDefault(new Date(1970, 0, 1));
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

  nullable(initialValue?: TValue): SingleSelectNode<TValue | undefined, TItem> {
    return new FormSelectNode(InputTypes.Select, undefined, this.items, this.map, initialValue, true);
  }

  notNull(initialValue: TValue, defaultValue = initialValue): SingleSelectNode<TValue, TItem> {
    return new FormSelectNode(InputTypes.Select, defaultValue, this.items, this.map, initialValue);
  }

  serverNull(type: ServerNullTypes<TValue>, initialValue?: TValue): SingleSelectNode<TValue | undefined, TItem> {
    const serverNullValue = (
      type == 'date' ? new Date(1970, 0, 1) :
        type === 'text' ? '\0' :
          '00000000-0000-0000-0000-000000000000'
    ) as unknown as TValue;
    return this.nullable(initialValue).withRawDefault(serverNullValue);
  }
}

class MultiSelectConfig<TValue, TItem> {
  constructor(private items: TItem[] | Observable<TItem[]>, private map: MapFunc<TItem, TValue>) {
  }

  notNull(initialValue?: TValue[], defaultValue = initialValue): MultiSelectNode<TValue, TItem> {
    return new FormSelectNode(InputTypes.SelectMany, defaultValue ?? [], this.items, this.map, initialValue);
  }
}

//</editor-fold>

class FormGuideFactory<TGuide> {
  withForm<TControls extends FormGroupControls<DeepPartial<TGuide>>>(controls: TControls): ControlFormRoot<TControls> {
    return new FormRoot(controls);
  }

}
