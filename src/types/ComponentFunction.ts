import Component from '../Component.ts';
import Props from './Props.ts';
import State from './State.ts';

type ComponentFunction = (props: Props) => Component<State>;

export default ComponentFunction;
