import {FormLayerControls} from "../units/controls";
import {FormPageBuilder} from "./form-page.builder";

interface Constructor {
  <T>(controls: FormLayerControls<T>): FormPageBuilder<T>;
  create: <T>(controls: FormLayerControls<T>) => FormPageBuilder<T>;
  edit: <T>(controls: FormLayerControls<T>) => FormPageBuilder<T>;
}

function create<T>(controls: FormLayerControls<T>) {
  return new FormPageBuilder<T>('create', controls);
}

function edit<T>(controls: FormLayerControls<T>) {
  return new FormPageBuilder<T>('update', controls);
}

function ctor<T>(controls: FormLayerControls<T>) {
  return new FormPageBuilder<T>('create', controls);
}

ctor.create = create;
ctor.edit = edit;

export const formPage: Constructor = ctor;
