import {IFormNode, IReadonlyFormNode} from "./form-node";
import {IReadonlyFormInput} from "./form-input";
import {AnonFormLayer} from "../forms";
import {Signal} from "@angular/core";
import {IFormLayer, IReadonlyFormLayer} from "./form-layer";

export interface IReadonlyFormList<T> extends IReadonlyFormNode<T[]> {

  /** A list of all the Form Layers making up the list */
  readonly controls: Signal<ReadonlyArray<IReadonlyFormLayer<T>>>;

  /** The current amount of controls */
  readonly length: Signal<number>;

  /** True if the list has no controls */
  readonly empty: Signal<boolean>;
}

export interface IFormList<T> extends IFormNode<T[]>, IReadonlyFormInput<T[]> {

  /** A list of all the Form Layers making up the list */
  readonly controls: Signal<ReadonlyArray<IFormLayer<T>>>;

  /**
   * Add a form layer to the end of the list
   * @param layers - The layers to add
   */
  addLayers(...layers: IFormLayer<T>[]): IFormLayer<T>[];

  /**
   * Update the control list to the given list
   * @param layers - The layers to use
   */
  setLayers(layers: IFormLayer<T>[]): IFormLayer<T>[];

  /**
   * Add a value to the end of the list.
   * The value is converted to a Form Layer and appended.
   * @param value - The value to add
   */
  addElement(value?: T): IFormLayer<T>;

  /**
   * Add a value to the end of the list.
   * The value is converted to a Form Layer and appended.
   * @param values - The values to add
   */
  appendElements(...values: T[]): IFormLayer<T>[];

  /**
   * Update the value of the first match in the list.
   * If no match is found, add the item.
   * @param filter - The search filter
   * @param value - The value to update with
   */
  setElement(filter: (x: T) => boolean, value: T): IFormLayer<T>;

  /**
   * Update the value of the first match in the list
   * @param filter - The search filter
   * @param value - The value to update with
   */
  updateElement(filter: (x: T) => boolean, value: T): IFormLayer<T> | undefined;

  /**
   * Toggle the presence of an item based on the filter.
   * If a match is found it will be removed.
   * If no match is found the value will be added.
   * @param filter - The search filter
   * @param value - The value to add if applicable
   */
  toggleElement(filter: (x: T) => boolean, value: T): IFormLayer<T> | undefined;

  /**
   * Remove the first item matching the predicate
   * @param filter - The match predicate
   */
  removeElement(filter: (x: T) => boolean): IFormLayer<T> | undefined;

  /**
   * Remove the given form layer
   * @param layer - The layer to remove
   */
  remove(layer: AnonFormLayer): IFormLayer<T> | undefined;

  /**
   * Remove a layer at a specified index
   * @param index - The index at which to remove the item
   */
  removeAt(index: number): IFormLayer<T> | undefined;

}
