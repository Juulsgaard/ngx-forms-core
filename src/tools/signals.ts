import {BehaviorSubject} from "rxjs";
import {signal, Signal} from "@angular/core";

export function subjectToSignal<T>(subject: BehaviorSubject<T>): Signal<T> {
  const sig = signal(subject.value);
  subject.subscribe(val => sig.set(val));
  return sig.asReadonly();
}
