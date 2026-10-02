import {IFormRoot, IReadonlyFormRoot} from "../units/root/form-root.interface";
import {Signal} from "@angular/core";
import {FormLayerControls, ReadonlyFormLayerControls} from "../units/controls";
import {FormValidationContext} from "../tools";
import {DeepPartial} from "@juulsgaard/ts-tools";

export interface IReadonlyFormDialog<T> {

  /** The form of the dialog */
  readonly form: IReadonlyFormRoot<T>;
  /** The value of the dialog form */
  readonly value: Signal<T>;
  /** The dialog form controls */
  readonly controls: Signal<ReadonlyFormLayerControls<T>>;

  /** Whether the dialog should be shown */
  readonly show: Signal<boolean>;
  /** Whether the submission is currently in progress */
  readonly working: Signal<boolean>

  /** The title of the Dialog */
  readonly title: string;
  /** The description text for the dialog */
  readonly description?: string;
  /** The text for the submit button */
  readonly buttonText: string;
  /** Whether the form should submit when enter is hit */
  readonly submitOnEnter: boolean;

  readonly valid: Signal<boolean>;
  readonly canSubmit: Signal<boolean>;

  readonly errors: Signal<string[]>;
  readonly errorState: Signal<FormValidationContext[]>;

  readonly warnings: Signal<string[]>;
  readonly warningState: Signal<FormValidationContext[]>;
}

export interface IFormDialog<T> extends IReadonlyFormDialog<T> {

  /** The form of the dialog */
  readonly form: IFormRoot<T>;

  /** The dialog form controls */
  readonly controls: Signal<FormLayerControls<T>>;

  /**
   * Start the dialog.
   * This will reset and show the dialog.
   * @param reset - Optional reset data
   */
  start(reset?: DeepPartial<T>): void;

  /**
   * Close the dialog
   */
  close(): void;

  /**
   * Submit the form Dialog with the current values
   */
  submit(): Promise<void>;
}
