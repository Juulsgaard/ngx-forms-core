import {firstValueFrom, lastValueFrom, Observable, of, switchMap} from "rxjs";
import {map} from "rxjs/operators";
import {DeepPartial} from "@consensus-labs/ts-tools";
import {persistentCache} from "@consensus-labs/rxjs-tools";
import {FormGroupControls, FormGroupValue, FormGroupValueRaw, SmartFormUnion} from "../tools/form-types";
import {ControlFormRoot} from "./form-root";
import {Form} from "../tools/form-constructor";

export class FormDialog<TControls extends Record<string, SmartFormUnion>> {

  private readonly _form: ControlFormRoot<TControls>;
  get form(): ControlFormRoot<TControls> {return this._form}

  get value(): FormGroupValueRaw<TControls> {return this.form.getRawValue()}
  controls: TControls;

  private _show = false;
  get show() {return this._show}

  private _working = false;
  get working() {return this._working}

  private readonly onSubmit: (data: FormGroupValueRaw<TControls>) => Promise<any>|Observable<any>|void;
  private readonly createForm: boolean;

  readonly title: string;
  readonly description?: string;
  readonly buttonText: string;
  readonly submitOnEnter: boolean;

  valid$: Observable<boolean>;
  error$: Observable<string|undefined>;

  static Create<TForm extends Record<string, any>>(): FormDialogFactory<TForm> {
    return new FormDialogFactory('create');
  }

  static Update<TForm extends Record<string, any>>(): FormDialogFactory<TForm> {
    return new FormDialogFactory('update');
  }

  constructor(template: TControls, type: 'create'|'update', settings: Settings<TControls>) {
    this._form = Form.root(template);
    this.controls = this._form.controls;
    this.createForm = type === 'create';
    this.onSubmit = settings.onSubmit;
    this.title = settings.title;
    this.description = settings.description;
    this.buttonText = settings.buttonText ?? (this.createForm ? 'Create' : 'Save');
    this.submitOnEnter = settings.submitOnEnter ?? true;

    const error$ = settings.validate
      ? this.form.throttledValue$.pipe(map(x => settings.validate!(x)))
      : of(undefined);
    this.error$ = error$.pipe(persistentCache());

    this.valid$ = this.error$.pipe(
      switchMap(error => error ? of(false) : this.createForm ? this.form.canCreate$ : this.form.canSubmit$),
      persistentCache()
    );
  }

  start(reset?: FormGroupValue<TControls>) {
    this.form.reset(reset);
    this._show = true;
  }

  close() {
    this._show = false;
  }

  async submit() {
    if (this.working) return;
    const valid = await firstValueFrom(this.valid$);
    if (!valid) return;

    this._working = true;

    try {

      let result = this.onSubmit(this.form.getRawValue());

      if (result instanceof Observable) {
        result = lastValueFrom(result);
      }

      if (result instanceof Promise) {
        await result;
      }

      this._show = false

    } finally {
      this._working = false;
    }

  }

}

interface Settings<TControls extends Record<string, SmartFormUnion>> {
  onSubmit: (data: FormGroupValueRaw<TControls>) => Promise<any>|Observable<any>|void;
  title: string;
  description?: string;
  buttonText?: string;
  validate?: (data: FormGroupValue<TControls>) => string|undefined;
  /**
   * If true the form will submit when the user presses enter
   * @default true
   */
  submitOnEnter?: boolean;
}

class FormDialogFactory<TGuide> {
  constructor(private type: 'create'|'update') {

  }

  withForm<TControls extends FormGroupControls<DeepPartial<TGuide>>>(controls: TControls): FormDialogConfig<TControls> {
    return new FormDialogConfig(this.type, controls);
  }

}

class FormDialogConfig<TControls extends Record<string, SmartFormUnion>> {
  constructor(private type: 'create'|'update', private controls: TControls) {

  }

  configure(settings: Settings<TControls>) {
    return new FormDialog<TControls>(this.controls, this.type, settings)
  }
}
