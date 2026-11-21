import {Subscribable} from "rxjs";

export interface FormDialogOptions<T> {
  /** The title of the dialog */
  title: string;
  /** The description for the dialog */
  description?: string;
  /** The action to perform when submitting the form */
  onSubmit: (data: T) => Promise<any> | Subscribable<any> | void;
}
