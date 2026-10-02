import {FormLayerControls} from "../controls";
import {IFormList} from "./form-list.interface";
import {FormListBuilder} from "./form-list.builder";

interface Constructor {
  <T>(controls: FormLayerControls<T>): IFormList<T>;
  build: <T>(controls: FormLayerControls<T>) => FormListBuilder<T>;
}

function build<T>(controls: FormLayerControls<T>): FormListBuilder<T> {
  return new FormListBuilder<T>(controls);
}

function ctor<T>(controls: FormLayerControls<T>): IFormList<T> {
  return build(controls).done();
}

ctor.build = build;

export const formList: Constructor = ctor;
