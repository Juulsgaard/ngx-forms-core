import {of, Subscribable} from "rxjs";
import {DeepPartial, isBool, isFunction, SimpleObject} from "@juulsgaard/ts-tools";
import {FormConfirmService} from "./form-confirm.service";
import {FormPage} from "./form-page";
import {ILoadingState} from "@juulsgaard/rxjs-tools";
import {FormGroupControls} from "../types/controls";

export interface WarningDialog {
  title: string;
  text: string;
  btnText?: string;
}

export interface FormPageOptions<T> {
  onSubmit?: FormPageAction<T>;
  submitBtnText: string;
  submitWarning?: (value: T) => WarningDialog;
  canEdit$?: Subscribable<boolean>;

  onDelete?: FormPageAction<T>;
  deleteBtnText: string;
  deleteWarning?: (value: T) => WarningDialog;
  canDelete$?: Subscribable<boolean>;

  getError?: (value: DeepPartial<T>) => string | undefined;
  getWarning?: (value: DeepPartial<T>) => string | undefined;

  warningService?: FormConfirmService;
}

export type FormPageAction<T> = (data: T) => Promise<any> | Subscribable<any> | ILoadingState | void;

export abstract class BaseFormPageConfig<TVal extends SimpleObject> {

  protected options: FormPageOptions<TVal>;

  protected constructor(
    protected type: 'create' | 'update',
    protected controls: FormGroupControls<TVal>,
    options?: FormPageOptions<TVal>
  ) {
    this.options = options ?? {
      submitBtnText: type === 'create' ? 'Create' : 'Save',
      deleteBtnText: 'Delete'
    };
  }

  renderWarnings(service: FormConfirmService): this {
    this.options.warningService = service;
    return this;
  }

  withSubmitWarning(
    title: string | ((value: TVal) => string),
    text: string | ((value: TVal) => string),
    btnText?: string
  ): this {
    const getTitle = isFunction(title) ? title : () => title;
    const getText = isFunction(text) ? text : () => text;
    this.options.submitWarning = val => (
      {
        title: getTitle(val),
        text: getText(val),
        btnText
      }
    );
    return this;
  }

  withDeleteWarning(
    title: string | ((value: TVal) => string),
    text: string | ((value: TVal) => string),
    btnText?: string
  ): this {
    const getTitle = isFunction(title) ? title : () => title;
    const getText = isFunction(text) ? text : () => text;
    this.options.deleteWarning = val => (
      {
        title: getTitle(val),
        text: getText(val),
        btnText
      }
    );
    return this;
  }

  limitSubmit(canEdit$: Subscribable<boolean> | boolean): this {
    this.options.canEdit$ = isBool(canEdit$) ? of(canEdit$) : canEdit$;
    return this;
  }

  limitDelete(canDelete$: Subscribable<boolean> | boolean): this {
    this.options.canDelete$ = isBool(canDelete$) ? of(canDelete$) : canDelete$;
    return this;
  }

  done(): FormPage<TVal> {
    return new FormPage<TVal>(this.type, this.controls, this.options)
  }
}

export class FormPageConfig<TVal extends SimpleObject> extends BaseFormPageConfig<TVal> {

  constructor(type: 'create' | 'update', controls: FormGroupControls<TVal>) {
    super(type, controls);
  }

  withSubmit(action: FormPageAction<TVal>, btnText?: string): this {
    this.options.onSubmit = action;
    this.options.submitBtnText = btnText ?? this.options.submitBtnText;
    return this;
  }

  withDelete(action: FormPageAction<TVal>, btnText?: string): this {
    this.options.onDelete = action;
    this.options.deleteBtnText = btnText ?? this.options.deleteBtnText;
    return this;
  }

  withCustomError(getError: (value: DeepPartial<TVal>) => string | undefined): this {
    this.options.getError = getError;
    return this;
  }

  withCustomWarning(getWarning: (value: DeepPartial<TVal>) => string | undefined): this {
    this.options.getWarning = getWarning;
    return this;
  }
}
