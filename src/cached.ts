import { Reactive } from './reactive.ts';

class Cached<T> {
  _deps: Reactive<unknown>[] = [];

  _dirty = true;

  _inGetter = false;

  private _fn: () => T;

  private _value!: T;

  constructor(fn: () => T) {
    this._fn = fn;
  }

  private refresh() {
    this._deps.length = 0;
    this._inGetter = true;
    this._value = this._fn();
    this._inGetter = false;
    this._dirty = false;
  }

  get value() {
    if (this._dirty === true) {
      this.refresh();
    }
    return this._value;
  }
}

/**
 * Create a cached function. Cached function are executed only if the value is getted and a reactive value in the function is updated.
 * @param fn The function that return the value.
 * @returns Cached function.
*/
function cached<T>(fn: () => T): Cached<T> {
  return new Cached(fn);
}

function isCached(obj: unknown): obj is Cached<unknown> {
  return obj instanceof Cached;
}

export { Cached, cached, isCached };
