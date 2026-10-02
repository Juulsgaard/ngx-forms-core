import {IFormNode, IReadonlyFormNode} from "../node/form-node.interface";
import {Signal} from "@angular/core";
import {IFormUnit} from "../unit/form-unit.interface";
import {FormControl, FormLayerControls} from "../controls";
import {DeepPartial} from "@juulsgaard/ts-tools";
import {IAnonFormInput} from "../input/form-input.interface";

export interface IReadonlyFormLayer<T> extends IReadonlyFormNode<T> {
  // readonly controls: Signal<ReadonlyFormLayerControls<T>>;
  // readonly inputs: Signal<IReadonlyFormUnit[]>;
}

export interface IFormLayer<T> extends IReadonlyFormLayer<T>, IFormNode<T> {
  readonly controls: Signal<FormLayerControls<T>>;
  readonly inputs: Signal<IAnonFormInput[]>;

  setControl<K extends Extract<keyof T, string>>(name: K, control: FormControl<T[K]>): void;
  patchValue(value: DeepPartial<T>|T|undefined): void;

  clone(): IFormLayer<T>;
}

export type IAnonFormLayer = IReadonlyFormLayer<unknown> & IFormUnit;
