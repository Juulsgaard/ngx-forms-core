import {EffectRef, Signal} from "@angular/core";
import {Subscribable, Unsubscribable} from "rxjs";
import {IFormRoot, IReadonlyFormRoot} from "../units/root/form-root.interface";
import {FormLayerControls, ReadonlyFormLayerControls} from "../units/controls";
import {DeepPartial} from "@juulsgaard/ts-tools";
import {FormPageUpdateOptions} from "./form-page.types";
import {ILoadingState} from "@juulsgaard/rxjs-tools";

export interface IReadonlyFormPage<T> {

  readonly form: IReadonlyFormRoot<T>;
  readonly controls: Signal<ReadonlyFormLayerControls<T>>;
  readonly value: Signal<T>;

  readonly submitting: Signal<boolean>;
  readonly submitError: Signal<Error | undefined>;

  readonly deleting: Signal<boolean>;
  readonly deleteError: Signal<Error | undefined>;

  readonly hasSubmit: boolean;
  readonly showSubmit: Signal<boolean>;
  readonly canSubmit: Signal<boolean>;

  readonly hasDelete: boolean;
  readonly showDelete: Signal<boolean>;

  readonly submitBtnText: string;
  readonly deleteBtnText: string;
}

export interface IFormPage<T> extends IReadonlyFormPage<T> {

  readonly form: IFormRoot<T>;
  readonly controls: Signal<FormLayerControls<T>>;

  /** Update the form from a signal */
  updateFrom(
    values: Signal<DeepPartial<T>|undefined> | Signal<T|undefined>,
    options?: FormPageUpdateOptions
  ): EffectRef;
  /** Update the form from a computation (tracked) */
  updateFrom(
    values: (() => DeepPartial<T>|undefined) | (() => T|undefined),
    options?: FormPageUpdateOptions
  ): EffectRef;
  /** Update the form from a subscribable */
  updateFrom(
    values: Subscribable<DeepPartial<T>|undefined> | Subscribable<T|undefined>,
    options?: FormPageUpdateOptions
  ): Unsubscribable;

  submit(): ILoadingState;
  delete(): ILoadingState;
}

