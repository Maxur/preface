import Props from "../types/Props.ts";
import State from "../types/State.ts";
import Component from "../Component.ts";
import VNode from "./VNode.ts";
import VNodeComponent from "./VNodeComponent.ts";
import VNodeCommonTag from "./VNodeCommonTag.ts";
import VNodeFragment from "./VNodeFragment.ts";
import VNodeText from "./VNodeText.ts";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: unknown;
    }
  }
}

type JsxChildren = Array<string | number | VNode | JsxChildren>;

export interface Jsx {
  tagName?:
    | string
    | ((
      props: Props,
      children: unknown[],
    ) => Jsx | Component<Props, State>);
  attrs: Record<string, string | number | (() => unknown)> | null;
  children: JsxChildren;
}

function recursiveChildrenArray(
  children: Jsx["children"],
  array: VNode[] = [],
) {
  children.forEach((c) => {
    if (typeof c === "string" || typeof c === "number") {
      array.push(new VNodeText(c));
    } else {
      if (Array.isArray(c)) {
        recursiveChildrenArray(c, array);
      } else {
        array.push(c);
      }
    }
  });
  return array;
}

export default {
  h(
    tagName: Jsx["tagName"],
    attrs: Jsx["attrs"],
    ...children: Jsx["children"]
  ): VNode {
    const childrenNodes = recursiveChildrenArray(children);
    if (!tagName) {
      return new VNodeFragment(attrs, childrenNodes);
    } else if (typeof tagName === "string") {
      return new VNodeCommonTag(tagName, attrs, childrenNodes);
    }
    const instance = tagName(attrs, children);
    if (instance instanceof Component) {
      return new VNodeComponent(instance, attrs, childrenNodes);
    }
    return this.h(instance.tagName, instance.attrs, ...instance.children);
  },
  fragment(
    attrs: Jsx["attrs"],
    ...children: Jsx["children"]
  ) {
    return {
      attrs,
      children,
    };
  },
};
