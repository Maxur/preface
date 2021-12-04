import Component from "../Component.ts";
import Props from "./Props.ts";
import State from "./State.ts";

interface DefaultTag {
  tagName: string;
  attrs: Record<string, string | number | (() => unknown)> | null;
  children: (string | number | Jsx)[];
}

interface CustomTag {
  tagName: (
    props: Partial<Record<string, unknown>> | null,
  ) => Component<Record<string, unknown>, State>;
  attrs: Props;
  children: (string | number | Jsx)[];
}

type Jsx = DefaultTag | CustomTag;

export type { CustomTag, DefaultTag, Jsx };
