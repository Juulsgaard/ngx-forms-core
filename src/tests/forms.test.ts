import {Form, formLayer, formList} from "../constructors";
import {FormLayer, FormList, FormNode, FormSelectNode} from "../forms";

interface Item {
  id: string;
  name: string;
}

const items: Item[] = [{id: 'id', name: 'Name'}];

interface FormData {
  value: string;
  nullable?: string;
  select?: string;
  layer?: SubFormData;
  list: SubFormData[];
}

interface SubFormData {
  value: string;
}

const defaultData: FormData = {value: '', select: undefined, nullable: undefined, layer: {value: ''}, list: []};
const testData: FormData = {value: 'Value str', select: 'id', nullable: 'Nullable value', layer: {value: 'Nested Value'}, list: [{value: 'List value'}]};

test('Model Based', () => {

  const layer = formLayer.model<FormData>({
    value: Form.text().done(),
    nullable: Form.nullable.text().done(),
    select: Form.select(items).single(x => x.id).nullable().done(),
    layer: formLayer.nullable.model({
      value: Form.text().done()
    }),
    list: formList.model({
      value: Form.text().done()
    })
  });

  expect(layer.controls().value).toBeInstanceOf(FormNode);
  expect(layer.controls().select).toBeInstanceOf(FormSelectNode);
  expect(layer.controls().nullable).toBeInstanceOf(FormNode);
  expect(layer.controls().nullable.nullable).toBe(true);
  expect(layer.controls().layer).toBeInstanceOf(FormLayer);
  expect(layer.controls().layer.controls().value).toBeInstanceOf(FormNode);
  expect(layer.controls().list).toBeInstanceOf(FormList);

  expect(layer.value()).toStrictEqual(defaultData);

  layer.reset(testData);
  expect(layer.value()).toStrictEqual(testData);

  layer.controls().list.addElement({value: 'Second list value'});
  expect(layer.value().list.length).toBe(2);

  layer.controls().nullable.clear();
  expect(layer.value().nullable).toBe(undefined);
});

test('Control Based', () => {

  const layer = formLayer.controls({
    value: Form.text().done(),
    nullable: Form.nullable.text().done(),
    select: Form.select(items).single(x => x.id).nullable().done(),
    layer: formLayer.controls({
      value: Form.text().done()
    }),
    list: formList.controls({
      value: Form.text().done()
    })
  });

  expect(layer.controls().value).toBeInstanceOf(FormNode);
  expect(layer.controls().select).toBeInstanceOf(FormSelectNode);
  expect(layer.controls().nullable).toBeInstanceOf(FormNode);
  expect(layer.controls().nullable.nullable).toBe(true);
  expect(layer.controls().layer).toBeInstanceOf(FormLayer);
  expect(layer.controls().layer.controls().value).toBeInstanceOf(FormNode);
  expect(layer.controls().list).toBeInstanceOf(FormList);

  expect(layer.value()).toStrictEqual(defaultData);
});

test('Template Based', () => {

  const layer = Form.root<FormData>({
    value: Form.text(),
    nullable: Form.nullable.text(),
    select: Form.select(items).single(x => x.id).nullable(),
    layer: Form.nullable.layer({
      value: Form.text()
    }),
    list: [{value: Form.text()}]
  }).done();

  expect(layer.controls().value).toBeInstanceOf(FormNode);
  expect(layer.controls().select).toBeInstanceOf(FormSelectNode);
  expect(layer.controls().nullable).toBeInstanceOf(FormNode);
  expect(layer.controls().nullable.nullable).toBe(true);
  expect(layer.controls().layer).toBeInstanceOf(FormLayer);
  expect(layer.controls().layer.controls().value).toBeInstanceOf(FormNode);
  expect(layer.controls().list).toBeInstanceOf(FormList);

  expect(layer.value()).toStrictEqual(defaultData);
});
