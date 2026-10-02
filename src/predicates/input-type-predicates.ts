import {IFormUnit} from "../units/unit/form-unit.interface";
import {IFormInput} from "../units/input/form-input.interface";
import {InputTypes} from "../units/input/form-input.types";
import {isFormInput} from "./is-form-input";

//<editor-fold desc="String">
export function isStringInput(node: IFormUnit): node is IFormInput<string> {
  if (!isFormInput(node)) return false;
  if (node.nullable) return false;

  switch (node.type) {
    case InputTypes.Text:
    case InputTypes.Url:
    case InputTypes.Password:
    case InputTypes.Color:
    case InputTypes.Email:
    case InputTypes.Phone:
    case InputTypes.LongText:
    case InputTypes.HTML:
    case InputTypes.Search:
      return true;
    default:
      return false;
  }
}

export function isNullableStringInput(node: IFormUnit): node is IFormInput<string> {
  if (!isFormInput(node)) return false;
  if (!node.nullable) return false;

  switch (node.type) {
    case InputTypes.Text:
    case InputTypes.Url:
    case InputTypes.Password:
    case InputTypes.Color:
    case InputTypes.Email:
    case InputTypes.Phone:
    case InputTypes.LongText:
    case InputTypes.HTML:
    case InputTypes.Search:
      return true;
    default:
      return false;
  }
}

//</editor-fold>

//<editor-fold desc="Number">
export function isNumberInput(node: IFormUnit): node is IFormInput<number> {
  if (!isFormInput(node)) return false;
  if (node.nullable) return false;

  switch (node.type) {
    case InputTypes.Number:
      return true;
    default:
      return false;
  }
}

export function isNullableNumberInput(node: IFormUnit): node is IFormInput<number | undefined> {
  if (!isFormInput(node)) return false;
  if (!node.nullable) return false;

  switch (node.type) {
    case InputTypes.Number:
      return true;
    default:
      return false;
  }
}

//</editor-fold>

//<editor-fold desc="Boolean">
export function isBoolInput(node: IFormUnit): node is IFormInput<boolean> {
  if (!isFormInput(node)) return false;
  if (node.nullable) return false;

  switch (node.type) {
    case InputTypes.Bool:
      return true;
    default:
      return false;
  }
}

export function isNullableBoolInput(node: IFormUnit): node is IFormInput<boolean | undefined> {
  if (!isFormInput(node)) return false;
  if (!node.nullable) return false;

  switch (node.type) {
    case InputTypes.Bool:
      return true;
    default:
      return false;
  }
}

//</editor-fold>

//<editor-fold desc="Date">
export function isDateInput(node: IFormUnit): node is IFormInput<Date> {
  if (!isFormInput(node)) return false;
  if (node.nullable) return false;

  switch (node.type) {
    case InputTypes.Date:
    case InputTypes.DateTime:
    case InputTypes.Time:
      return true;
    default:
      return false;
  }
}

export function isNullableDateInput(node: IFormUnit): node is IFormInput<Date | undefined> {
  if (!isFormInput(node)) return false;
  if (!node.nullable) return false;

  switch (node.type) {
    case InputTypes.Date:
    case InputTypes.DateTime:
    case InputTypes.Time:
      return true;
    default:
      return false;
  }
}

//</editor-fold>

//<editor-fold desc="File">
export function isFileInput(node: IFormUnit): node is IFormInput<File> {
  if (!isFormInput(node)) return false;
  if (node.nullable) return false;

  switch (node.type) {
    case InputTypes.File:
      return true;
    default:
      return false;
  }
}

export function isNullableFileInput(node: IFormUnit): node is IFormInput<File | undefined> {
  if (!isFormInput(node)) return false;
  if (!node.nullable) return false;

  switch (node.type) {
    case InputTypes.File:
      return true;
    default:
      return false;
  }
}


//</editor-fold>
