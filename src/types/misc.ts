//<editor-fold desc="Config Values">
import {SimpleObject} from "@juulsgaard/ts-tools";

export type AutoComplete =
  'on'
  | 'off'

  | 'name'
  | 'honorific-prefix'
  | 'given-name'
  | 'additional-name'
  | 'family-name'
  | 'honorific-suffix'
  | 'nickname'
  | 'username'

  | 'new-password'
  | 'current-password'
  | 'one-time-code'
  | 'organization-title'
  | 'organization'

  | 'street-address'
  | 'country'
  | 'country-name'
  | 'postal-code'

  | 'transaction-currency'
  | 'transaction-amount'
  | 'language'

  | 'bday'
  | 'bday-day'
  | 'bday-month'
  | 'bday-year'
  | 'sex'

  | 'url'
  | 'photo'

  | 'tel'
  | 'tel-country-code'
  | 'tel-national'
  | 'tel-area-code'
  | 'tel-local'
  | 'tel-local-prefix'
  | 'tel-local-suffix'
  | 'tel-extension'
  | 'email'
  | 'impp'
  | string;
//</editor-fold>

export type FormListValue<T extends SimpleObject | undefined, TNullable extends boolean> = TNullable extends true ? T[]|undefined : T[];

export type FormObjectTypes = Date | File;
export type ObjArr<T extends SimpleObject | undefined> = T[] & (SimpleObject | undefined)[];
