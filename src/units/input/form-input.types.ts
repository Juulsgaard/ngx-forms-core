export enum InputEvents {
  Focus = 'focus',
  Select = 'select',
  ScrollTo = 'scroll-to',
}

export enum InputTypes {
  Generic = 'generic',
  Text = 'text',
  Url = 'url',
  Number = 'number',
  Password = 'password',
  Bool = 'boolean',
  Date = 'text-date',
  DateTime = 'datetime-local',
  Time = 'time',
  Color = 'color',
  Email = 'email',
  Phone = 'tel',
  LongText = 'textarea',
  HTML = 'html',
  Select = 'select',
  SelectMany = 'multipleSelect',
  Search = 'search',
  File = 'file'
}

export type FormInputEvent = InputEvents | string;
export type FormInputType = InputTypes | string;

export interface FormInputOptions {
  readonly label?: string;
  readonly autocomplete?: string;
  readonly tooltip?: string;
  readonly readonly?: boolean;
  readonly autoFocus?: boolean;
  readonly showDisabledField?: boolean;

  readonly required?: boolean;
  readonly disabled?: boolean;
}

export interface InputFocusOptions {
  /** If true the contents of the input will be selected */
  selectValue?: boolean;
  scroll?: boolean;
}
