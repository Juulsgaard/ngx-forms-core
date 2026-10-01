import {IFormNode} from "./form-node";
import {Signal} from "@angular/core";
import {IReadonlyFormLayer} from "./form-layer";

export interface IReadonlyFormRoot<T> extends IReadonlyFormLayer<T> {
  readonly canCreate: Signal<boolean>;
  readonly canUpdate: Signal<boolean>;
}

export interface IFormRoot<T> extends IReadonlyFormRoot<T>, IFormNode<T> {


}
