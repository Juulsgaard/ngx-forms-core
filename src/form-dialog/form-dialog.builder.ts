import {FormDialog} from "./form-dialog";
import {FormValidator} from "../tools";
import {IFormDialog} from "./form-dialog.interface";
import {FormLayerControls} from "../units/controls";
import {FormDialogOptions} from "./form-dialog.types";

export class FormDialogBuilder<T> {

  protected buttonText?: string;
  protected errorValidators: FormValidator<T>[] = [];
  protected warningValidators: FormValidator<T>[] = [];
  protected shouldSubmitOnEnter?: boolean;

  constructor(
    private type: 'create' | 'update',
    private controls: FormLayerControls<T>
  ) {

  }

  /**
   * Add validators to the form
   * @param validators
   */
  public withErrors(...validators: FormValidator<T>[]): this {
    this.errorValidators = [...this.errorValidators, ...validators];
    return this;
  }

  /**
   * Add warning validators to the form
   * @param validators
   */
  public withWarnings(...validators: FormValidator<T>[]): this {
    this.warningValidators = [...this.warningValidators, ...validators];
    return this;
  }

  /**
   * Toggle whether the form should submit when the user hits enter
   * @param submitOnEnter
   */
  public submitOnEnter(submitOnEnter: boolean): this {
    this.shouldSubmitOnEnter = submitOnEnter;
    return this;
  }

  /**
   * Set custom submit button text
   * @param buttonText
   */
  public withButtonText(buttonText: string): this {
    this.buttonText = buttonText;
    return this;
  }

  /**
   * Configure the dialog
   * @param settings
   */
  configure(settings: FormDialogOptions<T>): IFormDialog<T> {
    return new FormDialog<T>(
      this.controls,
      this.type,
      settings,
      this.shouldSubmitOnEnter,
      this.buttonText,
      this.errorValidators,
      this.warningValidators
    );
  }
}
