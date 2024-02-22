import {FormPageFactory} from "./form-page-factory";

class FormPageConstructors {
  Edit<T extends Record<string, any>>(): FormPageFactory<T> {
    return new FormPageFactory<T>('update');
  }

  Create<T extends Record<string, any>>(): FormPageFactory<T> {
    return new FormPageFactory<T>('create');
  }
}

export function formPage(): FormPageConstructors {
  return new FormPageConstructors();
}
