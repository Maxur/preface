import Jsx from './types/Jsx.ts';
import Props from './types/Props.ts';
import State from './types/State.ts';

type UnpackState<T> = { [P in keyof T]: (T[P] extends { value: unknown } ? T[P]['value'] : T[P]) };
type RenderFunction<T> = (state: UnpackState<T>, slot: unknown[]) => Jsx;
type StateFunction<T> = (options: ComponentOptions) => T;

interface ComponentOptions {
  props: Props;
  context?: Record<string, unknown>;
}

class Component<T extends State> {
  private _stateFunction: StateFunction<T>;

  private _renderFunction: RenderFunction<T>;

  constructor(stateFunction: StateFunction<T>) {
    this._stateFunction = stateFunction;
    this._renderFunction = () => Component.h('template', null);
  }

  static h(tagName: Jsx['tagName'], attrs: Jsx['attrs'], ...children: Jsx['children']) {
    return { tagName, attrs, children: children.flat(Infinity) } as Jsx;
  }

  render(renderFunction: RenderFunction<T>) {
    this._renderFunction = renderFunction;
    return this;
  }

  execStateFunction(options: ComponentOptions) {
    return this._stateFunction(options);
  }

  execRenderFunction(state: UnpackState<T>, slot: unknown[]) {
    return this._renderFunction(state, slot);
  }
}

export default Component
