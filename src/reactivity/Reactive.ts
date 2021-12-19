import ReactivityPool from "./ReactivityPool.ts";

export default class Reactive<T = unknown> {
  private _reactivityPool?: ReactivityPool;

  private _listeners: (() => void)[] = [];

  _value: T;

  /**
   * Create a reactive value.
   * @param value The value.
   * @returns Reactive value.
   */
  constructor(value: T) {
    this._value = value;
  }

  onUpdate(fn: (() => void)) {
    this._listeners.push(fn);
  }

  notifyGet() {
    if (this._reactivityPool) {
      this._reactivityPool.notifyReactiveGet(this);
    }
  }

  notifySet() {
    if (this._reactivityPool) {
      this._reactivityPool.notifyReactiveSet(this);
    }
    this._listeners.forEach((fn) => fn());
  }

  setReactivityPool(reactivityPool: ReactivityPool) {
    this._reactivityPool = reactivityPool;
  }

  get value(): T extends Reactive ? T["value"] : T {
    this.notifyGet();
    return typeof this._value === "object"
      ? this._value instanceof Reactive
        ? Reflect.get(this._value, "value")
        : new Proxy(Reflect.get(this, "_value"), refererProxy(this))
      : Reflect.get(this, "_value");
  }

  set value(value: T extends Reactive ? T["value"] : T) {
    this._value instanceof Reactive
      ? Reflect.set(this._value, "value", value)
      : Reflect.set(this, "_value", value);
    this.notifySet();
  }
}

function refererProxy<T>(referer: Reactive<T>): ProxyHandler<Reactive<T>> {
  return {
    get(obj, prop) {
      const value = Reflect.get(obj, prop);
      return typeof value === "object"
        ? new Proxy(value, refererProxy(referer))
        : value;
    },
    set(obj, prop, value) {
      const r = Reflect.set(obj, prop, value);
      referer.notifySet();
      return r;
    },
  };
}
