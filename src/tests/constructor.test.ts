import {Form, formLayer, formList} from "../constructors";

interface Item {
  id: string;
  name: string;
}

const items: Item[] = [];

interface FormData {
  str: string;
  select?: string;
  nullable?: string;
  num: number;
  layer?: SubFormData;
  list: SubFormData[];
}

interface SubFormData {
  value: string;
}

test('Constructors', () => {

  const modelLayer = formLayer().model<FormData>({
    str: Form.text().done(),
    select: Form.select(items).single(x => x.id).nullable('').done(),
    nullable: Form.nullable.text().done(),
    num: Form.number().done(),
    layer: formLayer().nullable.model({
      value: Form.text().done()
    }),
    list: formList().model({
      value: Form.text().done()
    })
  });

  const controlLayer = formLayer().controls({
    str: Form.text().done(),
    nullable: Form.nullable.text().done(),
    num: Form.number().done(),
    layer: formLayer().model({
      value: Form.text().done()
    }),
    list: formList().model({
      value: Form.text().done()
    })
  });

  const value = controlLayer.value().list.at(0)?.value;

  const template = Form.root<FormData>({
    str: Form.text(),
    layer: Form.nullable.layer({
      value: Form.text()
    }),
    nullable: Form.nullable.text(),
    select: Form.select(items).single(x => x.id).nullable(),
    num: Form.number(),
    list: [{value: Form.text()}]
  }).done();

});
