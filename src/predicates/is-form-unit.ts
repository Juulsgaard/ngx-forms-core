import {IFormUnit} from "../units/unit/form-unit.interface";
import {FormUnit} from "../units/unit/form-unit";

export function isFormUnit(data: unknown): data is IFormUnit {
    return data instanceof FormUnit;
}
