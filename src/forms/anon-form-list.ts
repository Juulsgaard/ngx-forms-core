import {FormUnit} from "./form-unit";
import {computed, Signal} from "@angular/core";
import {AnonFormLayer} from "./anon-form-layer";

export abstract class AnonFormList extends FormUnit {

  /** A list of all the Form Layers making up the list */
  abstract readonly controls: Signal<AnonFormLayer[]>;

  /** The current amount of controls */
  readonly length: Signal<number> = computed(() => this.controls().length);

  /** True if the list has no controls */
  readonly empty: Signal<boolean> = computed(() => this.length() <= 0);
}
