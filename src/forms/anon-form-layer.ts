import {FormUnit} from "./form-unit";
import {computed, Signal} from "@angular/core";
import {AnonFormNode} from "./anon-form-node";
import {FormNode} from "./form-node";

export abstract class AnonFormLayer extends FormUnit {

  /** The controls of the layer */
  abstract readonly controls: Signal<Record<string, FormUnit>>;

  /** A list of all the Form Nodes in the layer */
  readonly nodes: Signal<AnonFormNode[]> = computed(
    () => Object.values(this.controls()).filter(x => x instanceof FormNode) as AnonFormNode[]
  );
}
