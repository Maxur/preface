import { Cached } from './cached.ts';

type ReactiveType = unknown;

class Reactive<T extends ReactiveType> {
  _cachedPool: Cached<unknown>[] = [];

  _functions: (() => unknown)[] = [];

  value: T; //(T extends Record<string, unknown> ? { [P in keyof T]: Record<P, ReactiveObject<T[P]>> } : T);

  constructor(value: T) {
    this.value = value;
    // if (typeof value === 'object') {
    //   this.value map(new Proxy(this, reactiveObjectProxy));
    //   this.value = Object.entries(value).reduce((acc, [k, v]) => {
    //     acc[k] = new ReactiveObject(v);
    //   }, {} as Record<string, unknown>)
    // } else {
    //   this.value = value;
    // }
    // return new Proxy(this, refererProxy(this as any));
    return new Proxy(this, reactiveProxy);
  }
}

const reactiveProxy: ProxyHandler<Reactive<any>> = {
  get(obj, prop) {
    if (prop === '_cachedPool' || prop === '_functions') {
      return Reflect.get(obj, prop);
    }
    obj._cachedPool.forEach((cached) => {
      if (cached._inGetter) {
        cached._deps.push(obj);
      }
    })
    const value = Reflect.get(obj, prop);
    return typeof value === 'object' ? new Proxy(value, refererProxy(obj)) : value;
  },
  set(obj, prop, value) {
    if (prop === '_cachedPool' || prop === '_functions') {
      return Reflect.set(obj, prop, value);
    }
    const r = Reflect.set(obj, prop, value);
    obj._cachedPool.forEach((cached) => {
      if (cached._deps.indexOf(obj) !== -1) {
        cached._dirty = true;
      }
    })
    obj._functions.forEach((f) => {
      f();
    });
    return r;
  }
}

function refererProxy<T extends Reactive<T>>(referer: T) {
  return {
    get(obj, prop) {
      referer._cachedPool.forEach((cached) => {
        if (cached._inGetter) {
          cached._deps.push(obj);
        }
      })
      return Reflect.get(obj, prop);
    },
    set(obj, prop, value) {
      const r = Reflect.set(obj, prop, value);
      referer._cachedPool.forEach((cached) => {
        if (cached._deps.indexOf(obj) !== -1) {
          cached._dirty = true;
        }
      })
      referer._functions.forEach((f) => {
        f();
      });
      return r;
    }
  } as ProxyHandler<T>
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

export { Reactive, reactive, isReactive };
