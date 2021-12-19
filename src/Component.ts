import { Jsx } from "./types/Jsx.ts";
import Props from "./types/Props.ts";
import State from "./types/State.ts";
import { h } from "./JSX.ts";
import Reactive from "./reactivity/Reactive.ts";

export default class Component<
  TProps extends Props,
  TState extends State,
> {
  private _defaultProps: TProps;

  private _stateFunction: (
    props: { [P in keyof TProps]: Reactive<TProps[P]> },
  ) => TState;

  private _renderFunction: (
    state:
      & (TProps extends null ? Record<never, never>
        : { [P in keyof TProps]: Reactive<TProps[P]> })
      & TState,
    slot: unknown[],
  ) => Jsx;

  constructor(
    props: TProps,
    stateFunction: Component<TProps, TState>["_stateFunction"],
  ) {
    this._defaultProps = props;
    this._stateFunction = stateFunction;
    this._renderFunction = () => h("template", null);
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

  getDefaultProps(): TProps {
    return this._defaultProps;
  }

  end() {
    return (_: Partial<TProps & { $key: string }> | null) => this;
  }
}
