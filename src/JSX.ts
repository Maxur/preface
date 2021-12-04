import { CustomTag, DefaultTag, Jsx } from "./types/Jsx.ts";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: unknown;
    }
  }
}

function h(
  tagName: CustomTag["tagName"],
  attrs: CustomTag["attrs"],
  ...children: CustomTag["children"]
): CustomTag;

function h(
  tagName: DefaultTag["tagName"],
  attrs: DefaultTag["attrs"],
  ...children: DefaultTag["children"]
): DefaultTag;

function h(
  tagName: any,
  attrs: any,
  ...children: any
): Jsx {
  return { tagName, attrs, children: children.flat(Infinity) };
}

export { h };
