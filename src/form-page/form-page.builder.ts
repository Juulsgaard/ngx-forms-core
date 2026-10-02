import {Subscribable} from "rxjs";
import {isBool, isFunction} from "@juulsgaard/ts-tools";
import {FormConfirmService} from "./form-confirm.service";
import {FormPage} from "./form-page";
import {Injector, signal, Signal} from "@angular/core";
import {FormValidator} from "../tools";
import {FormPageAction, FormPageOptions, WarningDialog} from "./form-page.types";
import {FormLayerControls} from "../units/controls";

export class FormPageBuilder<T> {

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
    protected controls: FormLayerControls<T>
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
