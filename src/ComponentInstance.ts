import Component from "./Component.ts";
import Reactive from "./reactivity/Reactive.ts";
import ReactivityPool from "./reactivity/ReactivityPool.ts";
import Props from "./types/Props.ts";
import State from "./types/State.ts";
import VNode from "./render/VNode.ts";

export default class ComponentInstance<
  TProps extends Props,
  TState extends State,
> {
  private _component: Component<TProps, TState>;

  private _reactivityPool: ReactivityPool;

  private _refreshTimer = 0;

  private _renderArgs: Parameters<
    Component<TProps, TState>["execRenderFunction"]
  >[0];

  private _slot: unknown[];

  private _onRender: ((value?: unknown) => void)[] = [];

  private _mountedElement?: Node;

  private _virtualDom: VNode;

  constructor(
    component: Component<TProps, TState>,
    props: Partial<TProps>,
    slot: unknown[],
  ) {
    this._component = component;
    const newProps = createReactiveProps(
      props,
      this._component.getDefaultProps(),
    );
    const state = this._component.execStateFunction(
      newProps as Parameters<Component<TProps, TState>["execStateFunction"]>[0],
    );
    this._renderArgs = {
      props: newProps as Parameters<
        Component<TProps, TState>["execStateFunction"]
      >[0],
      state,
    };
    this._slot = slot;
    this._reactivityPool = new ReactivityPool([
      ...Object.values(this._renderArgs.props || {}),
      ...Object.values(this._renderArgs.state),
    ]);
    this._reactivityPool.onUpdate(this.notify);
    this._virtualDom = this._component.execRenderFunction(
      this._renderArgs,
      this._slot,
    );
    this._virtualDom.build();
  }

  /**
   * Mount the component on a HTML element.
   * @param element The HTML element or a query selector.
   * @returns True on success, false otherwise.
   */
  mount(mountedElement?: Node | string, before?: Node) {
    const alreadyMounted = !!this._mountedElement;
    if (typeof mountedElement === "string") {
      this._mountedElement = document.querySelector(
        mountedElement,
      ) as Node;
    } else {
      this._mountedElement = mountedElement;
    }
    if (this._mountedElement && this._virtualDom.dom) {
      if (before) {
        this._mountedElement.insertBefore(this._virtualDom.dom, before);
      } else {
        this._mountedElement.appendChild(this._virtualDom.dom);
      }
      if (!alreadyMounted) {
        this._component.execMountFunction(this._renderArgs, this._virtualDom);
      }
    }
  }

  update(props: Partial<TProps> | null, slot: unknown[]): void {
    updateProps(
      props,
      this._component.getDefaultProps(),
      this._renderArgs.props,
    );
    this._slot = slot;
    this.refresh();
  }

  destroy() {
    this._component.execDestroyFunction(this._renderArgs);
    this._virtualDom.delete();
  }

  private notify = () => {
    clearTimeout(this._refreshTimer);
    this._refreshTimer = setTimeout(this.refresh.bind(this));
  };

  private refresh() {
    this._virtualDom.update(
      this._component.execRenderFunction(this._renderArgs, this._slot),
    );
    let fn: ((value?: unknown) => void) | undefined;
    while ((fn = this._onRender.pop()) !== undefined) {
      fn();
    }
  }

  get virtualDom() {
    return this._virtualDom;
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

function createReactiveProps<TProps extends Props>(
  props: Props,
  defaultProps: TProps,
): { [P in keyof TProps]: Reactive<TProps[P]> } | null {
  if (!defaultProps) return null;
  return Object.entries(defaultProps).reduce((acc, [k, v]) => {
    if (props !== null && k in props) { // If property filled, create a "Reactive" property
      acc[k] = new Reactive(props[k]);
    } else if (v instanceof Reactive) { // If property isn't filled, and default property is a "Reactive", create a "Reactive" property equals to the value of the default property
      acc[k] = new Reactive(v._value);
    } else { // If property isn't filled, and default property is not a "Reactive", create a "Reactive" property with the value of the default property
      acc[k] = new Reactive(v);
    }
    return acc;
  }, {} as any);
}

function updateProps<TProps extends Props>(
  newProps: Partial<Props> | null,
  defaultProps: TProps,
  props: { [P in keyof TProps]: Reactive<TProps[P]> } | null,
): { [P in keyof TProps]: Reactive<TProps[P]> } | null {
  if (!defaultProps) return null;
  return Object.entries(defaultProps).reduce((acc, [k, v]) => {
    if (newProps !== null && k in newProps) { // If property filled, change the "Reactive" property
      acc[k]._value = newProps[k];
    } else if (!(v instanceof Reactive)) { // If property isn't filled, change the "Reactive" property to the value of the default property only if the default property isn't a "Reactive"
      acc[k]._value = v;
    }
    return acc;
  }, props as any);
}
