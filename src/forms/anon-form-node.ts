import {FormUnit} from "./form-unit";
import {Observable, Subject} from "rxjs";
import {computed, Signal} from "@angular/core";

export enum FormNodeEvent {
  Focus = 'focus',
  Select = 'select',
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

export type FormNodeType = InputTypes | string;

export interface FormNodeOptions {
  readonly label?: string;
  readonly autocomplete?: string;
  readonly tooltip?: string;
  readonly readonly?: boolean;
  readonly autoFocus?: boolean;
  readonly showDisabledField?: boolean;

  readonly required?: boolean;
  readonly disabled?: boolean;
}

export abstract class AnonFormNode extends FormUnit {

  readonly label?: string;
  readonly autocomplete?: string;
  readonly tooltip?: string;
  readonly readonly?: boolean;
  readonly autoFocus?: boolean;
  readonly showDisabledField?: boolean;
  readonly required: boolean;

  private readonly _actions$ = new Subject<FormNodeEvent>();
  /** An observable emitting input actions */
  readonly actions$: Observable<FormNodeEvent> = this._actions$.asObservable();

  readonly abstract state: Signal<unknown|undefined>;
  readonly empty: Signal<boolean> = computed(() => this.state() == null);

  protected constructor(
    /** The type of the input */
    readonly type: FormNodeType,
    readonly defaultValue: unknown,
    readonly initialValue: unknown,
    nullable: boolean,
    protected readonly options: FormNodeOptions
  ) {
    super(nullable, !!options?.disabled);
    this.required = !!options?.required;

    if (!options) return;
    this.label = options.label;
    this.autocomplete = options.autocomplete;
    this.tooltip = options.tooltip;
    this.readonly = options.readonly;
    this.autoFocus = options.autoFocus;
    this.showDisabledField = options.showDisabledField;
  }

  /**
   * Focus the input
   * @param selectValue - If true the contents of the input will be selected
   */
  focus(selectValue?: true) {
    setTimeout(() => {
      this._actions$.next(FormNodeEvent.Focus);
      if (selectValue) this._actions$.next(FormNodeEvent.Select);
    }, 0);
  }

  /** Toggle the input value if boolean */
  abstract toggle(): void;
}
