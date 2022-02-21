import Props from "./types/Props.ts";
import State from "./types/State.ts";
import Reactive from "./reactivity/Reactive.ts";
import jsx from "./render/jsx.ts";
import VNode from "./render/VNode.ts";

type ReactiveProps<TProps extends Props> = (TProps extends null ? null
  : { [P in keyof TProps]: Reactive<TProps[P]> });

interface RenderVars<TProps extends Props, TState extends State> {
  props: ReactiveProps<TProps>;
  state: TState;
}

export default class Component<
  TProps extends Props,
  TState extends State,
> {
  private _defaultProps: TProps;

  private _stateFunction: (props: ReactiveProps<TProps>) => TState;

  private _renderFunction: (
    renderVars: RenderVars<TProps, TState>,
    slot: unknown[],
  ) => VNode;

  private _onMountFunction: (
    renderVars: RenderVars<TProps, TState>,
    rootElements: VNode,
  ) => void;

  private _onDestroyFunction: (
    renderVars: RenderVars<TProps, TState>,
  ) => void;

  constructor(
    props: TProps,
    stateFunction: (Component<TProps, TState>["_stateFunction"]),
  ) {
    this._defaultProps = props;
    this._stateFunction = stateFunction;
    this._onMountFunction = () => {};
    this._onDestroyFunction = () => {};
    this._renderFunction = () => jsx.h("template", null);
  }

  onMount(mountFunction: Component<TProps, TState>["_onMountFunction"]) {
    this._onMountFunction = mountFunction;
    return this;
  }

  onDestroy(destroyFunction: Component<TProps, TState>["_onDestroyFunction"]) {
    this._onDestroyFunction = destroyFunction;
    return this;
  }

  render(renderFunction: Component<TProps, TState>["_renderFunction"]) {
    this._renderFunction = renderFunction;
    return this;
  }

  execStateFunction(
    props: Parameters<Component<TProps, TState>["_stateFunction"]>[0],
  ) {
    return this._stateFunction(props);
  }

  execRenderFunction(
    state: Parameters<Component<TProps, TState>["_renderFunction"]>[0],
    slot: Parameters<Component<TProps, TState>["_renderFunction"]>[1],
  ) {
    return this._renderFunction(state, slot);
  }

  execMountFunction(
    state: Parameters<Component<TProps, TState>["_onMountFunction"]>[0],
    rootElements: Parameters<Component<TProps, TState>["_onMountFunction"]>[1],
  ) {
    return this._onMountFunction(state, rootElements);
  }

  execDestroyFunction(
    state: Parameters<Component<TProps, TState>["_onDestroyFunction"]>[0],
  ) {
    return this._onDestroyFunction(state);
  }

  getDefaultProps() {
    return this._defaultProps;
  }

  end() {
    return (
      _props: Partial<TProps>,
      _children: unknown[],
    ) => this;
  }
}
