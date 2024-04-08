import {Provider, Type} from "@angular/core";
import {WarningDialog} from "./form-page-config";

export abstract class FormConfirmService {

  static Provide(implementation: Type<FormConfirmService>): Provider {
    return {provide: FormConfirmService, useClass: implementation};
  }

  abstract confirmSubmit(data: WarningDialog): Promise<boolean>;
  abstract confirmDelete(data: WarningDialog): Promise<boolean>;
}
