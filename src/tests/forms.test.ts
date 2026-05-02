import {Form, formLayer, formList} from "../constructors";
import {FormLayer, FormList, FormNode, FormSelectNode} from "../forms";
import {FormConstants} from "../tools";

interface Item {
  id: string;
  name: string;
}

const items: Item[] = [{id: 'id', name: 'Name'}];

interface FormData {
  value: string;
  nullable?: string;
  select?: string;
  date: Date;
  file?: File;
  bool: boolean;
  layer?: SubFormData;
  list: SubFormData[];
}

interface SubFormData {
  value: string;
  nullable?: string;
}

const defaultData: FormData = {
  value: '',
  nullable: undefined,
  select: undefined,
  date: FormConstants.NULL_DATE,
  file: undefined,
  bool: false,
  layer: {value: '', nullable: undefined},
  list: []
};

const testData: FormData = {
  value: 'Value str',
  nullable: 'Nullable value',
  select: 'id',
  bool: true,
  date: new Date(),
  file: undefined,
  layer: {value: 'Nested value', nullable: 'Layer nullable value'},
  list: [{value: 'List value', nullable: 'List nullable value'}],
};

test('Model Based', () => {

  const layer = formLayer.model<FormData>({
    value: Form.text().done(),
    nullable: Form.nullable.text().done(),
    select: Form.select(items).single(x => x.id).nullable().done(),
    bool: Form.bool().done(),
    date: Form.date().done(),
    file: Form.nullable.file().done(),
    layer: formLayer.nullable.model<SubFormData>({
      value: Form.text().done(),
      nullable: Form.nullable.text().done(),
    }),
    list: formList.model<SubFormData>({
      value: Form.text().done(),
      nullable: Form.nullable.text().done(),
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
    bool: Form.bool().done(),
    date: Form.date().done(),
    file: Form.nullable.file().done(),
    layer: formLayer.nullable.model({
      value: Form.text().done(),
      nullable: Form.nullable.text().done(),
    }),
    list: formList.model({
      value: Form.text().done(),
      nullable: Form.nullable.text().done(),
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
    bool: Form.bool(),
    date: Form.date(),
    file: Form.nullable.file(),
    layer: Form.nullable.layer<SubFormData>({
      value: Form.text(),
      nullable: Form.nullable.text()
    }),
    list: Form.list<SubFormData>({
      value: Form.text(),
      nullable: Form.nullable.text()
    })
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
