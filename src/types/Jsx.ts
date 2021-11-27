import Component from "../Component.ts";
import Props from "./Props.ts";
import State from "./State.ts";

export default interface Jsx {
  tagName:
    | string
    | ((
      props: Partial<Record<string, unknown>> | null,
    ) => Component<Record<string, unknown>, State>);
  attrs: Props;
  children: (string | number | (() => unknown) | Jsx)[];
}
