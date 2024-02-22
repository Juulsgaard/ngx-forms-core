import {FormDialogFactory} from "./form-dialog-factory";

class FormDialogConstructors {
  /**
   * Create a new creation Form Dialog.
   * Use this when the dialog is used for creating something.
   * @constructor
   */
  Create<TForm extends Record<string, any>>(): FormDialogFactory<TForm> {
    return new FormDialogFactory('create');
  }

  /**
   * Create a new update Form Dialog.
   * Use this when the dialog is modifying data.
   * @constructor
   */
  Update<TForm extends Record<string, any>>(): FormDialogFactory<TForm> {
    return new FormDialogFactory('update');
  }
}

/** Get constructors for Form Dialogs */
export function formDialog(): FormDialogConstructors {
  return new FormDialogConstructors();
}
