import Jsx from "./types/Jsx.ts";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: unknown;
    }
  }
}

export function h(
  tagName: Jsx["tagName"],
  attrs: Jsx["attrs"],
  ...children: Jsx["children"]
): Jsx {
  return { tagName, attrs, children: children.flat(Infinity) };
}
