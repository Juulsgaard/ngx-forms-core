import {FormPage, formPage} from "../form-page";
import {Form} from "../constructors";

interface TestValue {
  value: string,
  layer: {value: string},
  list: {value: string}[]
}

test('Form Page', () => {
  const page: FormPage<TestValue> = formPage.edit<TestValue>().withForm({
    value: Form.text(),
    layer: {value: Form.text()},
    list: [{value: Form.text()}]
  }).done();

  page.autoDisable(() => false);
  page.autoDisable.value(x => x.list().length > 2)
  page.autoDisable.layer(() => false);
  page.autoDisable.layer.value(() => false);
  page.autoDisable.list((state) => state.list().length < 1);
  page.autoDisable.list.items(() => false);
  page.autoDisable.list.items.value(() => false);
});
