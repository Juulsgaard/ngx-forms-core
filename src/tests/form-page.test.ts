import {FormPage, formPage} from "../form-page";
import {Form} from "../constructors";

interface TestValue {
  name: string,
  length: number,
  date: Date,
  bool: boolean,
  layer: {value: string},
  list: {value: string}[]
}

test('Form Page', () => {
  const page: FormPage<TestValue> = formPage.edit<TestValue>().withForm({
    name: Form.text(),
    length: Form.number(),
    date: Form.date(),
    bool: Form.bool(),
    layer: {value: Form.text()},
    list: [{value: Form.text()}]
  }).done();
});
