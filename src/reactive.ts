import { Cached } from './cached.ts';

class Reactive<T> {
  _cachedPool: Cached<unknown>[] = [];

  _functions: Function[] = [];

  value: T;

  constructor(value: T) {
    this.value = value;
    return new Proxy(this, reactiveProxy);
  }
}

const reactiveProxy: ProxyHandler<Reactive<any>> = {
  get: (obj, prop: string) => {
    if (['value', '_functions'].indexOf(prop) === -1) {
      return undefined;
    }
    if (prop === 'value') {
      obj._cachedPool.forEach((cached) => {
        if (cached._inGetter) {
          cached._deps.push(obj);
        }
      })
    }
    return Reflect.get(obj, prop);
  },
  set: (obj, prop: string, value) => {
    if (['value', '_cachedPool', '_functions'].indexOf(prop) === -1) {
      return false;
    }
    const r = Reflect.set(obj, prop, value);
    if (prop === 'value') {
      obj._cachedPool.forEach((cached) => {
        if (cached._deps.indexOf(obj) !== -1) {
          cached._dirty = true;
        }
      })
      obj._functions.forEach((f) => {
        f();
      });
    }
    return r;
  }
}

function isReactive(obj: unknown): obj is Reactive<unknown> {
  return obj instanceof Reactive;
}

/**
 * Create a reactive value.
 * @param value The value.
 * @returns Reactive value.
*/
function reactive<T>(value: T): Reactive<T> {
  return new Reactive(value);
}

export { Reactive, reactive, isReactive };
