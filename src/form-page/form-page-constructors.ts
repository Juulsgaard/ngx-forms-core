import {FormPageFactory} from "./form-page-factory";
import {SimpleObject} from "@juulsgaard/ts-tools";

class FormPageConstructors {

  edit<T extends SimpleObject>(): FormPageFactory<T> {
    return new FormPageFactory<T>('update');
  }

  create<T extends SimpleObject>(): FormPageFactory<T> {
    return new FormPageFactory<T>('create');
  }

}

export const formPage: FormPageConstructors = new FormPageConstructors();
