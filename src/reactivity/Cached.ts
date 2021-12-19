import Reactive from "./Reactive.ts";
import ReactivityPool from "./ReactivityPool.ts";

export default class Cached<T> {
  private _reactivityPool?: ReactivityPool;

  _deps = new Set<Reactive>();

  _dirty = true;

  private _fn: () => T;

  private _value!: T;

  /**
   * Create a cached function. Cached function are executed only if the value is getted after a "Reactive value" in the function is updated.
   * @param fn The function that return the value.
   * @returns Cached function.
   */
  constructor(fn: () => T) {
    this._fn = fn;
  }

  private refresh() {
    this._deps.clear();
    if (this._reactivityPool) {
      this._reactivityPool.startDepedenciesCapture(this);
    }
    this._value = this._fn();
    if (this._reactivityPool) {
      this._reactivityPool.stopDepedenciesCapture(this);
    }
    this._dirty = false;
  }

  get value(): T {
    if (this._dirty === true) {
      this.refresh();
    }
    return this._value;
  }

  setReactivityPool(reactivityPool: ReactivityPool) {
    this._reactivityPool = reactivityPool;
  }
}
