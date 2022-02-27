import VNode from "./VNode.ts";
import Props from "../types/Props.ts";

export default class VNodeCommonTag extends VNode {
  constructor(
    private readonly tagName: string,
    private attrs: Props,
    children: VNode[],
  ) {
    super(attrs, children);
  }

  buildNode() {
    this._dom = document.createElement(this.tagName);
    if (this.attrs) {
      Object.entries(this.attrs).forEach(([name, value]) => {
        if (typeof value === "function") {
          (this._dom as unknown as Record<string, unknown>)[name] = value;
        } else {
          switch (name) {
            case "$value":
              (this._dom as HTMLInputElement).value = `${value}`;
              break;
            case "$key":
              break;
            default:
              this._dom &&
                (this._dom as HTMLElement).setAttribute(name, `${value}`);
              break;
          }
        }
      });
    }
  }

  updateNode(newVNode: VNodeCommonTag) {
    if (this._dom) {
      // Remove old attributes
      for (const k in this.attrs) {
        if (newVNode.attrs === null || newVNode.attrs[k] === undefined) {
          delete this.attrs[k];
          switch (k) {
            case "$value":
            case "$key":
              break;
            default:
              (this._dom as HTMLElement).removeAttribute(k);
              break;
          }
        }
      }
      // Add / Set attributes
      if (newVNode.attrs) {
        for (const k in newVNode.attrs) {
          if (this.attrs === null) this.attrs = {};
          if (this.attrs[k] !== newVNode.attrs[k]) {
            this.attrs[k] = newVNode.attrs[k];
            if (typeof newVNode.attrs[k] === "function") {
              (this._dom as unknown as Record<string, unknown>)[k] =
                this.attrs[k];
            } else {
              switch (k) {
                case "$value":
                  (this._dom as any).value = `${this.attrs[k]}`;
                  break;
                case "$key":
                  break;
                default:
                  (this._dom as HTMLElement).setAttribute(
                    k,
                    `${this.attrs[k]}`,
                  );
                  break;
              }
            }
          }
        }
      }
    }
  }

  updateableWith(newVNode: VNodeCommonTag) {
    return this.tagName === newVNode.tagName;
  }

  deleteNode() {
    if (this._dom) {
      (this._dom as HTMLElement).remove();
    }
  }
}
