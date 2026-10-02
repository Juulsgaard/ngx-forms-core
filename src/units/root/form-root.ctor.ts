import {FormLayerControls} from "../controls";
import {IFormRoot} from "./form-root.interface";
import {FormRootBuilder} from "./form-root.builder";

interface Constructor {
  <T>(controls: FormLayerControls<T>): IFormRoot<T>;
  build: <T>(controls: FormLayerControls<T>) => FormRootBuilder<T>;
}

function build<T>(controls: FormLayerControls<T>): FormRootBuilder<T> {
  return new FormRootBuilder<T>(controls);
}

function ctor<T>(controls: FormLayerControls<T>): IFormRoot<T> {
  return build(controls).done();
}

ctor.build = build;

export const formRoot: Constructor = ctor;
