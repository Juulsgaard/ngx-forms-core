import {Injector, Signal} from "@angular/core";
import {Subscribable} from "rxjs";
import {FormValidator} from "../tools";
import {FormConfirmService} from "./form-confirm.service";
import {ILoadingState} from "@juulsgaard/rxjs-tools";

export interface FormPageUpdateOptions {
  manualCleanup?: boolean;
  injector?: Injector;
}

export interface WarningDialog {
  title: string;
  text: string;
  btnText?: string;
}

export type FormPageAction<T> = (data: T) => Promise<any> | Subscribable<any> | ILoadingState | void;

export interface FormPageOptions<T> {
  onSubmit?: FormPageAction<T>;
  submitBtnText: string;
  submitWarning?: (value: T) => WarningDialog;
  canSubmit?: Subscribable<boolean> | Signal<boolean>;

  onDelete?: FormPageAction<T>;
  deleteBtnText: string;
  deleteWarning?: (value: T) => WarningDialog;
  canDelete?: Subscribable<boolean> | Signal<boolean>;

  errorValidators: FormValidator<T>[];
  warningValidators: FormValidator<T>[];

  warningService?: FormConfirmService;
  injector?: Injector;
}
