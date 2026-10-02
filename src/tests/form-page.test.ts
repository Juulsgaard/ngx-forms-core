import {FormPage, formPage} from "../form-page";
import {formInput, formLayer, formList} from "../units";

interface TestValue {
  name: string,
  length: number,
  date: Date,
  bool: boolean,
  layer: {value: string},
  list: {value: string}[]
}

test('Form Page', () => {
  const page: FormPage<TestValue> = formPage.edit<TestValue>({
    name: formInput.text().done(),
    length: formInput.number().done(),
    date: formInput.date().done(),
    bool: formInput.bool().done(),
    layer: formLayer({value: formInput.text().done()}),
    list: formList({value: formInput.text().done()})
  }).done();
});
