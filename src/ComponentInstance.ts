import Component from "./Component.ts";
import Render from "./Render.ts";
import Reactive from "./reactivity/Reactive.ts";
import ReactivityPool from "./reactivity/ReactivityPool.ts";
import Props from "./types/Props.ts";
import State from "./types/State.ts";

export default class ComponentInstance<
  TComponent extends Component<TProps, TState>,
  TProps extends Props,
  TState extends State,
> {
  private _component: TComponent;

  private _reactivityPool: ReactivityPool;

  private _props: { [P in keyof TProps]: Reactive<TProps[P]> } | null = null;

  private _render: Render;

  private _refreshTimer = 0;

  private _renderArgs:
    & (TProps extends null ? Record<never, never>
      : { [P in keyof TProps]: Reactive<TProps[P]> })
    & TState;

  private _slot: unknown[];

  private _onRender: ((value?: unknown) => void)[] = [];

  constructor(
    componentFunction: (
      props: Partial<TProps & { $key: string }> | null,
    ) => TComponent,
    props: Partial<TProps & { $key: string }> | null,
    slot: unknown[],
  ) {
    this._component = componentFunction(props);
    const defaultProps = this._component.getDefaultProps();
    for (const k in defaultProps) {
      const v = defaultProps[k];
      if (v instanceof Reactive) {
        defaultProps[k] = new Reactive(v.value);
      }
    }
    const newProps: Record<string, Reactive> = {};
    for (const k in defaultProps) {
      newProps[k] = new Reactive(props && props[k] || defaultProps[k]);
    }
    this._props = newProps as { [P in keyof TProps]: Reactive<TProps[P]> };
    this._slot = slot;
    const state = this._component.execStateFunction(this._props);
    this._renderArgs = Object.assign(state, this._props) as
      & (TProps extends null ? Record<never, never>
        : { [P in keyof TProps]: Reactive<TProps[P]> })
      & TState;
    this._reactivityPool = new ReactivityPool(Object.values(this._renderArgs));
    this._reactivityPool.onUpdate(this.notify);
    this._render = new Render(
      this._component.execRenderFunction(this._renderArgs, this._slot),
    );
  }

  getRender(): Render {
    return this._render;
  }

  getRenderArgs(): State {
    return this._renderArgs;
  }

  updateWith(props: Partial<TProps> | null, slot: unknown[]): void {
    const defaultProps = this._component.getDefaultProps();
    if (this._props) {
      for (const k in this._props) {
        this._props[k]._value = (props as TProps)[k] ||
          (defaultProps as TProps)[k];
      }
    }
    this._slot = slot;
    this.refresh();
  }

  /**
   * Mount the component on a HTML element.
   * @param elmement The HTML element or a query selector.
   * @returns True on success, false otherwise.
   */
  mount(element: HTMLElement | string): boolean {
    if (typeof element === "string") {
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
  };

  private refresh() {
    this._render.update(
      this._component.execRenderFunction(this._renderArgs, this._slot),
    );
    let fn: ((value?: unknown) => void) | undefined;
    while ((fn = this._onRender.pop()) !== undefined) {
      fn();
    }
  }

  /**
   * Return a new Promise resolved on next render.
   * @returns New Promise.
   */
  nextRender(): Promise<unknown> {
    return new Promise((resolve) => {
      this._onRender.push(resolve);
    });
  }
}
