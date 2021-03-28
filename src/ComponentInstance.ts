import Render from './Render.ts';
import Component from './Component.ts';
import { reactive, Reactive, isReactive } from './reactive.ts';
import { Cached, isCached } from './cached.ts';
import { watch } from './watch.ts';
import Props from './types/Props.ts';
import State from './types/State.ts';
import ComponentFunction from './types/ComponentFunction.ts';

const stateProxy: ProxyHandler<State> = {
  get(obj, prop: string) {
    const v = Reflect.get(obj, prop);
    if (isCached(v) || isReactive(v)) {
      return v.value;
    }
    return v;
  },
  set: (obj, prop: string, value) => {
    Reflect.set(Reflect.get(obj, prop), 'value', value)
    return true;
  }
}

class ComponentInstance {
  private _component: Component<State>;

  private _props: Record<string, Reactive<unknown>> = {};

  private _render: Render;

  private _refreshTimer = 0;

  private _renderArgs: State;

  private _slot: any[];

  private _onRender: ((value?: unknown) => void)[] = [];

  constructor(componentFunction: ComponentFunction, props: Props, slot: any[]) {
    this._component = componentFunction(props);
    for (const v in props) {
      this._props[v] = reactive(props[v]);
    }
    this._slot = slot;
    const state = this._component.execStateFunction({
      props: this._props,
    });
    const cacheds: Cached<unknown>[] = [];
    const reactives: Reactive<unknown>[] = [];
    for (const v in state) {
      const e = state[v];
      if (isCached(e)) {
        cacheds.push(e);
      } else if (isReactive(e)) {
        reactives.push(e);
        watch(e, this.notify);
      }
    }
    reactives.forEach((s) => {
      s._cachedPool = cacheds;
    });
    for (const v in props) {
      this._props[v]._cachedPool = cacheds;
    }
    this._renderArgs = new Proxy(state, stateProxy);
    this._render = new Render(this._component.execRenderFunction(this._renderArgs, this._slot));
  }

  getRender() {
    return this._render;
  }

  getRenderArgs() {
    return this._renderArgs;
  }

  updateWith(props: Props, slot: any[]) {
    for (const v in props) {
      this._props[v].value = props[v];
    }
    this._slot = slot;
    this.refresh();
  }

  /**
   * Mount the component on a HTML element.
   * @param elmement The HTML element or a query selector.
   * @returns True on success, false otherwise.
  */
  mount(element: HTMLElement | string) {
    if (typeof element === 'string') {
      element = document.querySelector(element) as HTMLElement;
    }
    if (element) {
      element.appendChild(this._render.getRootElement());
      return true;
    }
    return false;
  }

  private notify = () => {
    clearTimeout(this._refreshTimer);
    this._refreshTimer = setTimeout(this.refresh.bind(this));
  }

  private refresh() {
    this._render.update(this._component.execRenderFunction(this._renderArgs, this._slot));
    let fn: ((value?: unknown) => void) | undefined;
    while ((fn = this._onRender.pop()) !== undefined) {
      fn();
    }
  }

  /**
   * Return a new Promise resolved on next render.
   * @returns New Promise.
  */
  nextRender() {
    return new Promise((resolve) => {
      this._onRender.push(resolve)
    });
  }
}

export default ComponentInstance
