import {Subscribable} from "rxjs";
import {isBool, isFunction, SimpleObject} from "@juulsgaard/ts-tools";
import {FormConfirmService} from "./form-confirm.service";
import {FormPage} from "./form-page";
import {ILoadingState} from "@juulsgaard/rxjs-tools";
import {FormGroupControls} from "../types";
import {Injector, signal, Signal} from "@angular/core";
import {FormValidator} from "../tools";

export interface WarningDialog {
  title: string;
  text: string;
  btnText?: string;
}

export interface FormPageOptions<T> {
  onSubmit?: FormPageAction<T>;
  submitBtnText: string;
  submitWarning?: (value: T) => WarningDialog;
  canSubmit?: Subscribable<boolean>|Signal<boolean>;

  onDelete?: FormPageAction<T>;
  deleteBtnText: string;
  deleteWarning?: (value: T) => WarningDialog;
  canDelete?: Subscribable<boolean>|Signal<boolean>;

  errorValidators: FormValidator<T>[];
  warningValidators: FormValidator<T>[];

  warningService?: FormConfirmService;
  injector?: Injector;
}

export type FormPageAction<T> = (data: T) => Promise<any> | Subscribable<any> | ILoadingState | void;

export class FormPageConfig<T extends SimpleObject> {

  protected onSubmit?: FormPageAction<T>;
  protected submitBtnText: string;
  protected submitWarning?: (value: T) => WarningDialog;
  protected canSubmit?: Subscribable<boolean>|Signal<boolean>;

  protected onDelete?: FormPageAction<T>;
  protected deleteBtnText: string;
  protected deleteWarning?: (value: T) => WarningDialog;
  protected canDelete?: Subscribable<boolean>|Signal<boolean>;

  protected errorValidators: FormValidator<T>[] = [];
  protected warningValidators: FormValidator<T>[] = [];

  protected warningService?: FormConfirmService;
  protected injector?: Injector;

  constructor(
    protected type: 'create' | 'update',
    protected controls: FormGroupControls<T>
  ) {
    this.submitBtnText = type === 'create' ? 'Create' : 'Save';
    this.deleteBtnText = 'Delete';
  }

  provideConfirmService(service: FormConfirmService): this {
    this.warningService = service;
    return this;
  }

  provideInjector(injector: Injector): this {
    this.injector = injector;
    return this;
  }

  withSubmitWarning(
    title: string | ((value: T) => string),
    text: string | ((value: T) => string),
    btnText?: string
  ): this {
    const getTitle = isFunction(title) ? title : () => title;
    const getText = isFunction(text) ? text : () => text;
    this.submitWarning = val => ({
      title: getTitle(val),
      text: getText(val),
      btnText
    });
    return this;
  }

  withDeleteWarning(
    title: string | ((value: T) => string),
    text: string | ((value: T) => string),
    btnText?: string
  ): this {
    const getTitle = isFunction(title) ? title : () => title;
    const getText = isFunction(text) ? text : () => text;
    this.deleteWarning = val => ({
      title: getTitle(val),
      text: getText(val),
      btnText
    });
    return this;
  }

  limitSubmit(canSubmit: Subscribable<boolean> | Signal<boolean> | boolean): this {
    this.canSubmit = isBool(canSubmit) ? signal(canSubmit) : canSubmit;
    return this;
  }

  limitDelete(canDelete: Subscribable<boolean> | Signal<boolean> | boolean): this {
    this.canDelete = isBool(canDelete) ? signal(canDelete) : canDelete;
    return this;
  }

  withSubmit(action: FormPageAction<T>, btnText?: string): this {
    this.onSubmit = action;
    if (btnText) this.submitBtnText = btnText;
    return this;
  }

  withDelete(action: FormPageAction<T>, btnText?: string): this {
    this.onDelete = action;
    if (btnText) this.deleteBtnText = btnText;
    return this;
  }

  /**
   * Add validators to the layer
   * @param validators
   */
  public withErrors(...validators: FormValidator<T>[]): this {
    this.errorValidators = [...this.errorValidators, ...validators];
    return this;
  }

  /**
   * Add warning validators to the layer
   * @param validators
   */
  public withWarnings(...validators: FormValidator<T>[]): this {
    this.warningValidators = [...this.warningValidators, ...validators];
    return this;
  }

  private getOptions(): FormPageOptions<T> {
    return {
      onSubmit: this.onSubmit,
      submitBtnText: this.submitBtnText,
      submitWarning: this.submitWarning,
      canSubmit: this.canSubmit,
      onDelete: this.onDelete,
      deleteBtnText: this.deleteBtnText,
      deleteWarning: this.deleteWarning,
      canDelete: this.canDelete,
      errorValidators: this.errorValidators,
      warningValidators: this.warningValidators,
      warningService: this.warningService,
      injector: this.injector,
    };
  }

  done(): FormPage<T> {
    return new FormPage<T>(this.type, this.controls, this.getOptions())
  }
}
