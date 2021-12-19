import Reactive from "./Reactive.ts";
import Cached from "./Cached.ts";

export default class ReactivityPool {
  private _listeners: (() => void)[] = [];

  private _cached: Cached<unknown>[] = [];

  private _capturing = new Set<Cached<unknown>>();

  constructor(reactivables: unknown[]) {
    reactivables.forEach((reactivable) => {
      if (reactivable instanceof Reactive) {
        reactivable.setReactivityPool(this);
      } else if (reactivable instanceof Cached) {
        reactivable.setReactivityPool(this);
        this._cached.push(reactivable);
      }
    });
  }

  onUpdate(fn: (() => void)) {
    this._listeners.push(fn);
  }

  startDepedenciesCapture(cached: Cached<unknown>) {
    this._capturing.add(cached);
  }

  stopDepedenciesCapture(cached: Cached<unknown>) {
    this._capturing.delete(cached);
  }

  notifyReactiveGet(reactive: Reactive<unknown>) {
    this._capturing.forEach((capture) => {
      capture._deps.add(reactive);
    });
  }

  notifyReactiveSet(reactive: Reactive<unknown>) {
    this._cached.forEach((cached) => {
      if (cached._deps.has(reactive)) {
        cached._dirty = true;
      }
    });
    this._listeners.forEach((fn) => fn());
  }
}
