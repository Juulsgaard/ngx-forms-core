import {IFormNode, IReadonlyFormNode} from "./form-node";
import {Observable} from "rxjs";
import {FormNodeEvent} from "../forms";
import {Signal} from "@angular/core";

export interface IReadonlyFormInput<T> extends IReadonlyFormNode<T> {

  readonly label?: string;
  readonly autocomplete?: string;
  readonly tooltip?: string;
  readonly readonly?: boolean;
  readonly autoFocus?: boolean;
  readonly showDisabledField?: boolean;
  readonly required: boolean;

  readonly actions$: Observable<FormNodeEvent>;

  readonly state: Signal<T|undefined>;
  readonly debouncedState: Signal<T|undefined>;
  readonly resetState: Signal<T|undefined>;
  readonly resetValue: Signal<T>;

  readonly empty: Signal<boolean>;

  focus(options?: FocusOptions): void;
  scrollTo(): void;
}

export interface IFormInput<T> extends IFormNode<T>, IReadonlyFormInput<T> {

  /** Toggle the input value if boolean */
  toggle(): void
}

interface FocusOptions {
  /** If true the contents of the input will be selected */
  selectValue?: boolean;
  scroll?: boolean;
}
