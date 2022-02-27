import Reactive from "./Reactive.ts";
import ReactivityPool from "./ReactivityPool.ts";

export default class Cached<T = unknown> {
  private reactivityPool?: ReactivityPool;

  deps = new Set<Reactive>();

  dirty = true;

  private fn: () => T;

  private _value!: T;

  /**
   * Create a cached function. Cached function are executed only if the value is getted after a "Reactive value" in the function is updated.
   * @param fn The function that return the value.
   * @returns Cached function.
   */
  constructor(fn: () => T) {
    this.fn = fn;
  }

  private refresh() {
    this.deps.clear();
    if (this.reactivityPool) {
      this.reactivityPool.startDepedenciesCapture(this);
    }
    this._value = this.fn();
    if (this.reactivityPool) {
      this.reactivityPool.stopDepedenciesCapture(this);
    }
    this.dirty = false;
  }

  get value(): T {
    if (this.dirty === true) {
      this.refresh();
    }
    return this._value;
  }

  setReactivityPool(reactivityPool: ReactivityPool) {
    this.reactivityPool = reactivityPool;
  }
}
