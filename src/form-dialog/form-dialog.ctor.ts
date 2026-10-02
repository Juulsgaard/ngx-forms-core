import {FormLayerControls} from "../units/controls";
import {FormDialogBuilder} from "./form-dialog.builder";

interface Constructor {
  <T>(controls: FormLayerControls<T>): FormDialogBuilder<T>;
  create: <T>(controls: FormLayerControls<T>) => FormDialogBuilder<T>;
  update: <T>(controls: FormLayerControls<T>) => FormDialogBuilder<T>;
}

function create<T>(controls: FormLayerControls<T>) {
  return new FormDialogBuilder<T>('create', controls);
}

function update<T>(controls: FormLayerControls<T>) {
  return new FormDialogBuilder<T>('update', controls);
}

function ctor<T>(controls: FormLayerControls<T>) {
  return new FormDialogBuilder<T>('create', controls);
}

ctor.create = create;
ctor.update = update;

export const formDialog: Constructor = ctor;
