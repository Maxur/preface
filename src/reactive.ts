import { Cached } from "./cached.ts";

type ReactiveType = unknown;

class Reactive<T extends ReactiveType> {
  _cachedPool: Cached<unknown>[] = [];

  _functions: (() => unknown)[] = [];

  value: T;

  constructor(value: T) {
    this.value = value;
    return new Proxy(this, reactiveProxy());
  }
}

function reactiveProxy<T>(): ProxyHandler<Reactive<T>> {
  return {
    get(obj, prop) {
      if (prop === "_cachedPool" || prop === "_functions") {
        return Reflect.get(obj, prop);
      }
      obj._cachedPool.forEach((cached) => {
        if (cached._inGetter) {
          cached._deps.push(obj);
        }
      });
      const value = Reflect.get(obj, prop);
      return typeof value === "object"
        ? new Proxy(value, refererProxy(obj))
        : value;
    },
    set(obj, prop, value) {
      if (prop === "_cachedPool" || prop === "_functions") {
        return Reflect.set(obj, prop, value);
      }
      const r = Reflect.set(obj, prop, value);
      obj._cachedPool.forEach((cached) => {
        if (cached._deps.indexOf(obj) !== -1) {
          cached._dirty = true;
        }
      });
      obj._functions.forEach((f) => {
        f();
      });
      return r;
    },
  };
}

function refererProxy<T>(referer: Reactive<T>): ProxyHandler<Reactive<T>> {
  return {
    get(obj, prop) {
      referer._cachedPool.forEach((cached) => {
        if (cached._inGetter) {
          cached._deps.push(obj);
        }
      });
      return Reflect.get(obj, prop);
    },
    set(obj, prop, value) {
      const r = Reflect.set(obj, prop, value);
      referer._cachedPool.forEach((cached) => {
        if (cached._deps.indexOf(obj) !== -1) {
          cached._dirty = true;
        }
      });
      referer._functions.forEach((f) => {
        f();
      });
      return r;
    },
  };
}

function isReactive(obj: unknown): obj is Reactive<ReactiveType> {
  return obj instanceof Reactive;
}

/**
 * Create a reactive value.
 * @param value The value.
 * @returns Reactive value.
 */
function reactive<T extends ReactiveType>(value: T): Reactive<T> {
  return new Reactive(value);
}

export { isReactive, Reactive, reactive };
