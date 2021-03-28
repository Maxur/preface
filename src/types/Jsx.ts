import Component from '../Component.ts';
import Props from './Props.ts';
import State from './State.ts';

export default interface Jsx {
  tagName: string | (() => Component<State>);
  attrs: Props;
  children: (string | number | Function | Jsx)[];
}
