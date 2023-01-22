export abstract class FormConfirmService {

  abstract confirmSubmit(title: string, text: string, btnText?: string): Promise<boolean>;

  abstract confirmDelete(title: string, text: string, btnText?: string): Promise<boolean>;
}
