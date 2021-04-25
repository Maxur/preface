import Jsx from './types/Jsx.ts';
import Props from './types/Props.ts';
import State from './types/State.ts';

type UnpackStates<T extends State> = { [P in keyof T]: (T[P] extends { value: unknown } ? T[P]['value'] : T[P]) };
type RenderFunction<T extends State> = (state: { [P in keyof T]: (T[P] extends { value: unknown } ? T[P]['value'] : T[P]) }, slot: unknown[]) => Jsx;
type StateFunction<TProps extends Props, TState extends State> = (options: ComponentOptions<TProps>) => TState;

interface ComponentOptions<T extends Props> {
  props: T;
  context?: Record<string, unknown>;
}

class Component<TProps extends Props, TState extends State = any> { // TODO: Replace "any" to partial type argument inference
  private _stateFunction: StateFunction<TProps, TState>;

  private _renderFunction: RenderFunction<TState>;

  constructor(stateFunction: StateFunction<TProps, TState>) {
    this._stateFunction = stateFunction;
    this._renderFunction = () => Component.h('template', null);
  }

  static h(tagName: Jsx['tagName'], attrs: Jsx['attrs'], ...children: Jsx['children']) {
    return { tagName, attrs, children: children.flat(Infinity) } as Jsx;
  }

  render(renderFunction: RenderFunction<TState>) {
    this._renderFunction = renderFunction;
    return this;
  }

  execStateFunction(options: ComponentOptions<TProps>) {
    return this._stateFunction(options);
  }

  execRenderFunction(state: UnpackStates<TState>, slot: unknown[]) {
    return this._renderFunction(state, slot);
  }

  end() {
    return (_: TProps) => this;
  }
}

export default Component
