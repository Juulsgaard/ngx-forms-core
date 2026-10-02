import {IFormNode, IReadonlyFormNode} from "../node/form-node.interface";
import {Observable} from "rxjs";
import {FormInputEvent, FormInputType} from "../index";
import {Signal} from "@angular/core";
import {IFormUnit} from "../unit/form-unit.interface";
import {InputFocusOptions} from "./form-input.types";

export interface IReadonlyFormInput<T> extends IReadonlyFormNode<T> {

  readonly type: FormInputType;
  readonly label?: string;
  readonly autocomplete?: string;
  readonly tooltip?: string;
  readonly readonly?: boolean;
  readonly autoFocus?: boolean;
  readonly showDisabledField?: boolean;
  readonly required: boolean;

  readonly actions$: Observable<FormInputEvent>;

  readonly state: Signal<T|undefined>;
  readonly debouncedState: Signal<T|undefined>;
  readonly resetState: Signal<T|undefined>;
  readonly resetValue: Signal<T>;

  readonly empty: Signal<boolean>;

  focus(options?: InputFocusOptions): void;
  scrollTo(): void;
}

export interface IFormInput<T> extends IReadonlyFormInput<T>, IFormNode<T> {

  /** Toggle the input value if boolean */
  toggle(): void
  
  clone(): IFormInput<T>
}

export type IAnonFormInput = IReadonlyFormInput<unknown> & IFormUnit;
