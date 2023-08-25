import {Provider, Type} from "@angular/core";

export abstract class FormConfirmService {

  static Provide(implementation: Type<FormConfirmService>): Provider {
    return {provide: FormConfirmService, useClass: implementation};
  }

  abstract confirmSubmit(title: string, text: string, btnText?: string): Promise<boolean>;

  abstract confirmDelete(title: string, text: string, btnText?: string): Promise<boolean>;
}
