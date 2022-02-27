import Reactive from "./Reactive.ts";
import Cached from "./Cached.ts";

export default class ReactivityPool {
  private listeners: (() => void)[] = [];

  private cached: Cached[] = [];

  private capturing = new Set<Cached>();

  constructor(reactivables: unknown[]) {
    reactivables.forEach((reactivable) => {
      if (reactivable instanceof Reactive) {
        reactivable.setReactivityPool(this);
      } else if (reactivable instanceof Cached) {
        reactivable.setReactivityPool(this);
        this.cached.push(reactivable);
      }
    });
  }

  onUpdate(fn: (() => void)) {
    this.listeners.push(fn);
  }

  startDepedenciesCapture(cached: Cached) {
    this.capturing.add(cached);
  }

  stopDepedenciesCapture(cached: Cached) {
    this.capturing.delete(cached);
  }

  notifyReactiveGet(reactive: Reactive) {
    this.capturing.forEach((capture) => {
      capture.deps.add(reactive);
    });
  }

  notifyReactiveSet(reactive: Reactive) {
    this.cached.forEach((cached) => {
      if (cached.deps.has(reactive)) {
        cached.dirty = true;
      }
    });
    this.listeners.forEach((fn) => fn());
  }
}
