import {Signal} from "@angular/core";

export interface AnonFormRoot {
  canCreate: Signal<boolean>;
  canUpdate: Signal<boolean>;
}
