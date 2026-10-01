import {IFormNode, IReadonlyFormNode} from "./form-node";
import {Signal} from "@angular/core";
import {IFormUnit, IReadonlyFormUnit} from "./form-unit";
import {FormControl, FormLayerControls, ReadonlyFormLayerControls} from "./controls";

export interface IReadonlyFormLayer<T> extends IReadonlyFormNode<T> {
  readonly controls: Signal<ReadonlyFormLayerControls<T>>;
  readonly inputs: Signal<IReadonlyFormUnit[]>;
}

export interface IFormLayer<T> extends IReadonlyFormLayer<T>, IFormNode<T> {
  readonly controls: Signal<FormLayerControls<T>>;
  readonly inputs: Signal<IFormUnit[]>;

  setControl<K extends Extract<keyof T, string>>(name: K, control: FormControl<T[K]>): void;
}

