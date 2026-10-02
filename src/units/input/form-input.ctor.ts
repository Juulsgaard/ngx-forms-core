//<editor-fold desc="Options">
import {FormInputBuilder} from "./form-input.builder";
import {InputTypes} from "./form-input.types";
import {FormConstants} from "../../tools/constants";
import {Validators} from "../../tools/validators";

export interface FormInputCtorOptions<T> {
  fallback?: T;
  disabledFallback?: T | undefined;
}

export function parseOptions<T>(initial: T, options: FormInputCtorOptions<T>): {
  fallback: T | undefined,
  disabled: T | undefined
};
export function parseOptions<T>(initial: T | undefined, options: FormInputCtorOptions<T>, defaultFallback: T): {
  fallback: T,
  disabled: T | undefined
};
export function parseOptions<T>(initial: T | undefined, options: FormInputCtorOptions<T>, defaultFallback?: T): {
  fallback: T | undefined,
  disabled: T | undefined
} {
  const fallback = 'fallback' in options ? options.fallback : initial;
  const disabled = 'disabledFallback' in options ? options.disabledFallback : fallback;
  return {fallback: fallback ?? defaultFallback, disabled};
}
//</editor-fold>

//<editor-fold desc="Constructor Function">
type CtorFunc<T> = (
  initialValue?: T,
  options?: FormInputCtorOptions<T>
) => FormInputBuilder<T>;

function getCtor<T>(
  type: InputTypes,
  configure: ((builder: FormInputBuilder<T>) => void) | undefined | null,
  defaultValue: T
): CtorFunc<T>;
function getCtor<T>(
  type: InputTypes,
  configure?: (builder: FormInputBuilder<T | undefined>) => void
): CtorFunc<T | undefined>;

function getCtor<T>(
  type: InputTypes,
  configure?: ((builder: FormInputBuilder<T> | FormInputBuilder<T | undefined>) => void) | undefined | null,
  defaultValue?: T
): CtorFunc<T> | CtorFunc<T | undefined> {

  if (defaultValue == null) {
    return (initialValue?: T, options: FormInputCtorOptions<T | undefined> = {}) => {
      const {fallback, disabled} = parseOptions(initialValue, options);
      const builder = new FormInputBuilder<T | undefined>(type, true, fallback, initialValue, disabled);
      configure?.(builder)
      return builder;
    }
  }

  return (initialValue?: T, options: FormInputCtorOptions<T> = {}) => {
    const {fallback, disabled} = parseOptions(initialValue, options, defaultValue);
    const builder = new FormInputBuilder<T>(type, false, fallback, initialValue, disabled);
    configure?.(builder)
    return builder;
  }
}

//</editor-fold>

//<editor-fold desc="Constructor Types">
interface CtorTypes {
  /**
   * Create a readonly input for storing Ids
   */
  id: string;
  /**
   * Create a text input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  text: string;
  /**
   * Create a GUID input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  guid: string;
  /**
   * Create a URL input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  url: string;
  /**
   * Create a password input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  password: string;
  /**
   * Create a color input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  color: string;
  /**
   * Create a hex color input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  hexColor: string;
  /**
   * Create an email input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  email: string;
  /**
   * Create a phone number input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  phone: string;
  /**
   * Create a textfield input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  longText: string;
  /**
   * Create an HTML input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  html: string;
  /**
   * Create a search input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  search: string;

  /**
   * Create a number input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  number: number;
  /**
   * Create a boolean input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  bool: boolean;

  /**
   * Create a file input
   */
  file: File;

  /**
   * Create a date input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  date: Date;
  /**
   * Create a date and time input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  datetime: Date;
  /**
   * Create a time input
   * @param initialValue - The starting value
   * @param options - Additional configuration
   */
  time: Date;
}

type StrictCtor = { [K in keyof CtorTypes]: CtorFunc<CtorTypes[K]> };
type NullableCtor = { [K in keyof CtorTypes]: CtorFunc<CtorTypes[K] | undefined> };

interface Constructor extends StrictCtor {
  nullable: NullableCtor;
}

//</editor-fold>

//<editor-fold desc="Export">
export const formInput: Constructor = {

  id: getCtor<string>(InputTypes.Text, b => b.withLabel('Id').asReadonly(), ''),
  text: getCtor<string>(InputTypes.Text, null, ''),
  guid: getCtor<string>(InputTypes.Text, null, FormConstants.NULL_GUID),
  url: getCtor<string>(InputTypes.Url, null, ''),
  password: getCtor<string>(InputTypes.Password, null, ''),
  color: getCtor<string>(InputTypes.Color, null, ''),
  hexColor: getCtor<string>(InputTypes.Color, b => b.withErrors(Validators.hexColor()), ''),
  email: getCtor<string>(InputTypes.Email, b => b.withErrors(Validators.email()), ''),
  phone: getCtor<string>(InputTypes.Phone, null, ''),
  longText: getCtor<string>(InputTypes.LongText, null, ''),
  html: getCtor<string>(InputTypes.HTML, null, ''),
  search: getCtor<string>(InputTypes.Search, null, ''),

  number: getCtor<number>(InputTypes.Number, null, 0),
  bool: getCtor<boolean>(InputTypes.Bool, null, false),
  file: getCtor<File>(InputTypes.File, null, FormConstants.NULL_FILE),

  date: getCtor<Date>(InputTypes.Date, null, FormConstants.NULL_DATE),
  datetime: getCtor<Date>(InputTypes.DateTime, null, FormConstants.NULL_DATE),
  time: getCtor<Date>(InputTypes.Time, null, FormConstants.NULL_DATE),

  nullable: {
    id: getCtor<string>(InputTypes.Text, b => b.withLabel('Id').asReadonly()),
    text: getCtor<string>(InputTypes.Text),
    guid: getCtor<string>(InputTypes.Text),
    url: getCtor<string>(InputTypes.Url),
    password: getCtor<string>(InputTypes.Password),
    color: getCtor<string>(InputTypes.Color),
    hexColor: getCtor<string>(InputTypes.Color, b => b.withErrors(Validators.hexColor())),
    email: getCtor<string>(InputTypes.Email, b => b.withErrors(Validators.email())),
    phone: getCtor<string>(InputTypes.Phone),
    longText: getCtor<string>(InputTypes.LongText),
    html: getCtor<string>(InputTypes.HTML),
    search: getCtor<string>(InputTypes.Search),

    number: getCtor<number>(InputTypes.Number),
    bool: getCtor<boolean>(InputTypes.Bool),
    file: getCtor<File>(InputTypes.File),

    date: getCtor<Date>(InputTypes.Date),
    datetime: getCtor<Date>(InputTypes.DateTime),
    time: getCtor<Date>(InputTypes.Time),
  }
};
//</editor-fold>
