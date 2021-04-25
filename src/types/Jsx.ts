import ComponentFunction from './ComponentFunction.ts';
import Props from './Props.ts';

export default interface Jsx {
  tagName: string | ComponentFunction;
  attrs: Props;
  children: (string | number | (() => unknown) | Jsx)[];
}
