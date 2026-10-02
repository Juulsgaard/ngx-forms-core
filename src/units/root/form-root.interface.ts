import {Signal} from "@angular/core";
import {IFormLayer, IReadonlyFormLayer} from "../layer/form-layer.interface";

export interface IReadonlyFormRoot<T> extends IReadonlyFormLayer<T> {
  readonly canCreate: Signal<boolean>;
  readonly canUpdate: Signal<boolean>;
}

export interface IFormRoot<T> extends IReadonlyFormRoot<T>, IFormLayer<T> {


}
