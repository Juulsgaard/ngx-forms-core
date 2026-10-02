import {IFormLayer} from "./form-layer.interface";
import {FormLayerControls} from "../controls";
import {FormLayerBuilder} from "./form-layer.builder";

//<editor-fold desc="Interface">

interface NullableConstructor {
  <T>(controls: FormLayerControls<T>): IFormLayer<T | undefined>;
  build: <T>(controls: FormLayerControls<T>) => FormLayerBuilder<T | undefined>;
}

interface Constructor {
  <T>(controls: FormLayerControls<T>): IFormLayer<T>;

  build: <T>(controls: FormLayerControls<T>) => FormLayerBuilder<T>;
  nullable: NullableConstructor;
}
//</editor-fold>

//<editor-fold desc="Functions">
function build<T>(controls: FormLayerControls<T>): FormLayerBuilder<T> {
return new FormLayerBuilder<T>(controls, false);
}

function ctor<T>(controls: FormLayerControls<T>): IFormLayer<T> {
  return build(controls).done();
}

function nullableBuild<T>(controls: FormLayerControls<T>): FormLayerBuilder<T|undefined> {
  return new FormLayerBuilder<T|undefined>(controls, true);
}

function nullableCtor<T>(controls: FormLayerControls<T>): IFormLayer<T|undefined> {
  return nullableBuild(controls).done();
}
//</editor-fold>

//<editor-fold desc="Export">
ctor.build = build;
ctor.nullable = nullableCtor;
nullableCtor.build = nullableBuild;

export const formLayer: Constructor = ctor;
//</editor-fold>
