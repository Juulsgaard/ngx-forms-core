import {ReplaySubject, share, timer} from "rxjs";

export function cache<T>() {
  return share<T>({
    connector: () => new ReplaySubject(1, Infinity),
    resetOnError: true,
    resetOnComplete: false,
    resetOnRefCountZero: () => timer(1000)
  });
}
