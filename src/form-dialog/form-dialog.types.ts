import {Observable} from "rxjs";
import {ILoadingState} from "@juulsgaard/rxjs-tools";

export interface FormDialogOptions<T> {
  /** The title of the dialog */
  title: string;
  /** The description for the dialog */
  description?: string;
  /** The action to perform when submitting the form */
  onSubmit: (data: T) => Promise<any> | Observable<any> | ILoadingState | void;
}
