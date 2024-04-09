import {FormPage, formPage} from "../form-page";
import {Form} from "../constructors";
import {autoDisable} from "../tools/auto-disable";

interface TestValue {
  value: string,
  date: Date,
  bool: boolean,
  layer: {value: string},
  list: {value: string}[]
}

test('Form Page', () => {
  const page: FormPage<TestValue> = formPage.edit<TestValue>().withForm({
    value: Form.text(),
    date: Form.date(),
    bool: Form.bool(),
    layer: {value: Form.text()},
    list: [{value: Form.text()}]
  }).done();

  //TODO: mock injection context
  autoDisable(page, x => x.layer.value(() => false), {manualCleanup: true});
  autoDisable(page, x => x.bool(() => false), {manualCleanup: true});
});
